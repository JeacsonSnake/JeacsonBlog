---
title: 007_Every proxy on the HermesAgent server died — from "thought it was a Twitter direct-connection problem" to "turns out the IP pool went dark"
date: 2026-08-10
icon: 'box-archive'
category: deploy
tag:
  - 腾讯云
  - mihomo
  - Network
---

## Background

My `Hermes Agent` is deployed on a Tencent Cloud Lighthouse server (Guangzhou) and runs a bunch of scheduled tasks day in, day out. One of them is an AI briefing task, and its "Twitter/X tracked accounts" data source depends on the local mihomo proxy (port 7890) to reach services outside the mainland.

One morning the Twitter section of the briefing read:

> ⚠️ **All tracked accounts unresponsive** — direct connections to x.com are blocked, TLS fails on every proxy node

My first reaction was "Twitter has blocked the proxy exit IP again" — Tencent Cloud's outbound link already blocks `twitter.com`/`youtube.com`/`discord.com`, and I had run into the public RSSHub Twitter route coming back 503 before. But this time `github.com` and `google.com` were timing out through the proxy too, so it clearly was not about one site.

## The investigation

### Step 1: is it "TCP blocking" or "a dead node"?

Direct test (timeouts expected):

```
https://x.com        => 000 (10s timeout)  # blocked on Tencent Cloud's outbound link, known
https://twitter.com  => 000 (10s timeout)
https://api.twitter.com => 000 (10s timeout)
```

Test through the proxy (this is where it shows up):

```
https://x.com       => 000 (5s timeout)
https://github.com  => 000 (5s timeout)   # key: github is down too = not an x.com problem
https://discord.com => 000 (5s timeout)
https://google.com  => 000 (5s timeout)
```

**Going through the proxy, even github/google time out**, so the fault is in the proxy chain itself, not in the target sites. The mihomo log confirms it:

```
[TCP] dial 节点选择 (match DomainSuffix/github.com) ... error: context deadline exceeded
[TCP] dial 节点选择 (match DomainSuffix/x.com) ... error: context deadline exceeded
```

Every node dial ends in `context deadline exceeded` — **a fault at the node layer**.

### Step 2: test all 12 nodes

Switching node by node through the mihomo REST API (`127.0.0.1:9090`):

```bash
# loop over every node, switch, then test with curl
for NODE in "直连 台湾 01 | 0.5x" "直连 台湾 02 | 0.5x" ...; do
  curl -X PUT "http://127.0.0.1:9090/proxies/节点选择" -d "{\"name\":\"$NODE\"}"
  curl --proxy http://127.0.0.1:7890 https://x.com
done
```

Result: **all 12 nodes timed out**. The latency test endpoint agreed:

```
直连 台湾 04 | 0.5x   unreachable (HTTP 504)
直连 日本 01 | 0.5x   unreachable (HTTP 504)
直连 美国 03 | 0.5x   unreachable (HTTP 504)
```

At that point I had almost concluded "the provider's nodes have all died together". But one thing did not fit: **outbound UDP 53 was fine** (DNS resolved normally), so Tencent Cloud had not blocked outbound UDP.

### Step 3: the turning point — the nodes are reachable from Hong Kong

My machine in Hong Kong (HKT, no proxy) **could connect straight to the proxy node servers**. Which meant:

- the node servers were **alive** (the provider had not done a runner)
- the problem was in the "Guangzhou server → node server" leg

So I looked again: if the nodes are alive, why can't Guangzhou reach them? I started suspecting **GSLB DNS resolution**.

### Step 4: found the root cause — GSLB IP pool drift plus an expired subscription

Resolving the node domain over and over with the system DNS showed **a different IP on every lookup**:

```
v951-zj.71edge.work => 61.228.250.100 (reachable) / 61.228.249.36 (timeout) / 36.231.117.240 (timeout) ...
```

That is textbook **GSLB (global server load balancing) multi-IP round-robin**. The provider resolves the node domain to a pile of IPs, but **most of those IPs are unreachable from Tencent Cloud Guangzhou** (the Taiwan Hinet ranges `36.230.x` / `61.228.x` / `218.172.x` are blocked or not routed).

Then I looked at the modification time of config.yaml: **2026-04-16** — a static config from 4 months back. The subscription said "remaining traffic: 24.53 GB" while the provider's new subscription returned "24.96 GB" — **the subscription in the config had long expired**, the provider's GSLB had changed its IP pool ages ago and every old IP was dead.

**Root cause: x.com was not blocked; the mihomo static subscription config had not been updated in 4 months, the GSLB IP pool drifted and every old IP became unreachable.**

### The interlude

Once I understood the problem I still could not update it directly, for all sorts of practical reasons. Then on 10 August (two days after spotting it) I found that **every single** scheduled task had stopped returning messages. I went into the Tencent Lighthouse console at `https://console.cloud.tencent.com/lighthouse/instance/detail` and tried to make the changes through the remote terminal it offers at `https://orcaterm.cloud.tencent.com/terminal`, only to find it reporting "the gateway receives messages correctly, but the network times out when it tries to reach the LLM to analyse the problem".

#### What I did

First I tried stopping the mihomo service:

```
systemctl --user stop mihomo.service
systemctl --user disable mihomo.service
```

and rebooted.

Then I found that, because the code was so tightly coupled when it was set up, the IP address conflicted and the machine could not reach github directly to update itself.

```
ubuntu@VM-0-2-ubuntu:~$ hermes update
⚕ Updating Hermes Agent...

◆ Pre-update snapshot: 20260810-031752-pre-update

⚠ Updating from fork:
  https://«redacted:ghp_…»@github.com/NousResearch/hermes-agent.git

→ Fetching updates...
✗ Network error — cannot reach the remote repository.
  fatal: unable to access 'https://github.com/NousResearch/hermes-agent.git/': Failed to connect to 127.0.0.1 port 7890 after 0 ms: Couldn't connect to server
```

::: info
That `7890` port is the one the mihomo service was using.
:::

I tried to fix it, but could not budge it... so in desperation I turned the mihomo service back on:

```
systemctl --user start mihomo.service
systemctl --user enable mihomo.service
```

and rebooted.

Using the `proxy-latency-check 5` I had written earlier to pick a node, I caught one that still worked on the *not-yet-updated IP pool*.

Then at last I got the LLM connected and let it carry on with the changes...

### Step 5: the fix

#### Choosing an approach

| Approach | How | Downside |
|---|---|---|
| A. Change the IP | Point the node server from a domain name to a currently reachable IP | Symptom-level; it dies again once GSLB drifts |
| B. Automate the subscription | Put the URL in `.env`, have a script pull updates on a schedule | Fixes the cause, once and for all |

Went with B. The key design constraints:

1. **mihomo does not expand `${VAR}` environment variables inside config.yaml** (it errors with `unsupported protocol scheme` in testing) → you cannot write `url: "${SUB_URL}"`
2. But it does support **`type: file` providers**: the config only references a local file, so the URL never has to appear in config.yaml

The final architecture (three layers, separated):

```
~/.hermes/.env                              # VPN_SUBSCRIBE_URL="https://..." (sensitive, chmod 600)
~/.config/mihomo/update-subscription.sh     # pull script: source .env → curl → base64 check → atomic write
~/.config/mihomo/providers/airport.yaml     # the fetched subscription file (chmod 600)
~/.config/mihomo/config.yaml                # proxy-providers: {type: file, path: ./providers/airport.yaml}
```

#### The pits I fell into

1. **`--noproxy '*' --proxy ...` together disables the proxy**: `--noproxy '*'` overrides `--proxy`, so curl connects directly during the test (and of course times out), and I briefly misjudged it as "the proxy is still broken". Testing a proxy must use a plain `--proxy http://127.0.0.1:7890`.

2. **The "remaining traffic / plan expiry" entries in the subscription are fake nodes**: they are anytls placeholder nodes that display traffic info, not real usable nodes. The node-select group can pick them by default and everything dies — my guess is that this was a major contributor.

3. **A passing latency test ≠ working forwarding**: nodes that passed the `cp.cloudflare.com` health check (Taiwan 09, say, at 98ms) still timed out on a real request to x.com. The reason is that Tencent Cloud has UDP/routing restrictions on some IPs in the Taiwan Hinet ranges, while the health check goes through Cloudflare.

4. **Nodes fluctuate on a minute timescale**: a node that measured "fine" by hand was dead a few minutes later. Pinning one node is guaranteed to fail.

5. **A file provider's path must live inside the mihomo home directory** (a security restriction in newer versions: `path is not subpath of home directory or SAFE_PATHS`).

### Step 6: the final setup — a URLTest auto-select group

Since nodes fluctuate on a minute timescale, pinning one is unreliable, so in the end I used a **URLTest auto-select group**:

```yaml
proxy-groups:
  - name: 自动选择
    type: url-test
    proxies: []
    url: https://www.gstatic.com/generate_204   # key: switch to a real reachability test
    interval: 300
    use:
      - airport
```

**The key changes**: the health check URL went from `http://cp.cloudflare.com/` to `https://www.gstatic.com/generate_204`, and interval went from 7200s down to 300s. That gives you:

- all nodes tested automatically every 5 minutes
- automatic switching to a currently reachable node
- automatic failover when a node dies, no hands needed

### Step 7: automation — update the subscription every Wednesday at 04:40

Set up a cron (`no_agent` mode, zero token cost):

```
Every Wednesday 04:40
  → update-subscription.sh (pull the subscription from .env → base64 check → atomic write)
  → restart mihomo
  → switch to the url-test group (gstatic health check, auto-switch at 300s)
  → verify with a real x.com request
  → Feishu notification: "✅ subscription updated and live | auto-select now on node: X"
```

## Results

Measured after the fix:

```
x.com      => 200 (0.7s)   ✅
twitter.com => 200 (4.5s)  ✅
twitter-cli => real tweets (the DeepSeek V4 Flash discount news @NousResearch posted that day)✅
```

Five x.com tests in a row, all 200 (0.5-1.8s), and the auto-select group holds onto a reachable node.

## Takeaways

1. **All proxies down ≠ the target site is blocked**: test unrelated sites such as github/google first, to tell "node fault" from "site blocking".
2. **Reachable from outside the mainland = the node is alive**: the problem is most likely the local-to-node leg (GSLB drift / expired subscription).
3. **A static subscription config needs automatic updates**: the provider's GSLB changes its IP pool on a schedule, and a config that never updates is a slow death. This time it was 4 months; next time it might be 1.
4. **Pick a health check URL that reflects real reachability**: `cp.cloudflare.com` gives false positives, `gstatic.com/generate_204` is more reliable.
5. **Keep secrets (the subscription URL is the provider credential) in `.env`**: permissions 600, config.yaml only references a local file, the URL never appears in the config.

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md. The translation is for reference only.
Translation time: 2026-11-05
:::
