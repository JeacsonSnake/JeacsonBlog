---
title: 008_What do you mean the config got lost? Investigating a silently shrunk Hermes Agent config
date: 2026-11-22
icon: 'box-archive'
category: deploy
tag:
  - Hermes Agent
  - YAML
  - deepseek harness
---

## Background

Where this started had nothing to do with config at all.

On Xiaohongshu I saw a promo for a third-party plugin for the deepseek harness called `dsh-narration-policy` (original post [here](https://github.com/hentai-joshu/dsh-narration-policy)). One comment underneath said:

>"My approach is this: when busy, for a user message, first fire off a fork request and let the model decide whether it's a BTW-style reply, an urgent message that has to be shoved into the tool round, or a queued message that only gets sent once this round is over. When you need progress or have some other question, just ask in the input box; it won't disturb the round that's already working."

I had `Hermes Agent` look into it, because I wanted to know what the difference between the two approaches was.

From what I understood after `Hermes Agent` looked it up, it's trying to solve the same class of problem: **let the agent volunteer, between tool calls, what it's doing and why**, instead of just rattling off a string of commands. I figure what he's doing is genuinely useful for sessions I start myself, because it lets `Hermes Agent` expose its chain of reasoning more fully while working, which makes later revision easier. But I also didn't want to install a new plugin just to see the process, because after the lookup I realised `dsh-narration-policy` is essentially reusing some codex features over on the dsh side, and from what I remembered Hermes already has a "show tool chain" switch — I was pretty sure I had turned it all the way on (set verbose). So I went to look at the settings, and found my previous settings had vanished completely. That shouldn't happen, because as far as I remember I had turned it on, but I genuinely couldn't find it.

So the question changed: not "should I reuse this dsh plugin's design idea", but "**why does it look like my settings are gone**".

## Symptoms

Let me list the things I observed when I found the settings were gone:

1. In the Feishu chat window I use, tool-chain calls **currently auto-omit part of the output**. The typical shape is a command followed by "…" and then the omission, like the truncation in `echo "=== hermes install ==="; ls ~/…`;
2. I remember that when I was using discord as the gateway, the amount of tool-chain output shown was much larger, and it didn't omit anything. With weixin it seemed like there was even less. So I checked the message history, and confirmed that "the same Hermes shows **different** amounts of tool-chain output on different gateways" really does happen. Some places are chattier, some quieter;
3. In the revision plan `Hermes Agent` gave after the lookup, some fields looked like they might need configuring now. My first suspicion was `display.platforms.<platform>.show_reasoning`: the key whose name looks most like "show thinking", but later, talking with `Hermes Agent`, I realised that was wrong.

## The investigation

### Step 1: rule out show_reasoning first

`Hermes Agent` read `gateway/display_config.py` and the rendering-side code, and found that `display.platforms.<platform>.show_reasoning` controls **the few lines of reasoning before the final reply** (with a length cap), which is a completely separate path from how the tool chain is displayed. Tool progress belongs to another key: `display.tool_progress`, with values `all` / `new` / `off` / `verbose`. In other words, the "omission" I was seeing was not "reasoning isn't shown" but **tool previews being truncated**. The key that actually matters is `display.tool_preview_length`: in `verbose` mode, `0` means no truncation; in `all` / `new` mode, `0` falls back to 40 characters.

That is, `display.platforms.<platform>.show_reasoning` decides **"how many entries are shown"**, while `display.tool_preview_length` decides **"how long each entry can be"**. The "cut off halfway" thing I was seeing is decided by the latter. So that means, without changing the value of `display.tool_preview_length` (which is `0` here), setting `display.platforms.<platform>.tool_progress` — or even the global `display.tool_progress` — to `verbose` is where that setting actually makes sense.

::: tip Get the priority order straight!

In `Hermes Agent`'s config, the resolution order for the relevant key/value pairs is "first non-empty value wins"; the order (higher = higher priority) usually looks like:

```
  → display.platforms.<platform>.<key>
  → display.<key>
  → platform-tier default (the display_tier + display_overrides registered by the platform)
  → global default
```

The `feishu` adapter registers the `medium` tier, and the `_TIER_MEDIUM` tier's values for those keys are `tool_progress: "new"` and `tool_preview_length: 40`.

So as long as the whole `display` section is **missing**, Feishu gets `new` + `40 characters` — tool calls only show what's "new", each one cuts off at 40 characters and the rest isn't printed. That matches the symptoms I was seeing exactly.

:::

### Step 2: check the local config, find the whole display section gone

I went to look at what was in my current `~/.hermes/config.yaml`, and found it wasn't "display is set wrong" but that **there was no display section at all**. Not just `display`: the whole file only had `model`, `fallback_providers`, `skills.external_dirs`, `onboarding` and the version number; the rest of the config had simply disappeared.

![my part of config when I reached out - Vanishing person Meme](./assets/008-img/0.jpg)

A Hermes config that had been running for the better part of a year reduced to this little — that's just not right; something I changed earlier must have wiped it. (shrugs helplessly)

### Step 3: dig through the backups, do a full comparison

Luckily I had the habit of having `Hermes Agent` make backups. I had `Hermes Agent` list everything relevant under `~/.hermes/backups/config/` and `~/.hermes/config.yaml.bak*`, sorted by time:

| file | size | version | state |
|:---|---|---|---:|
| `config.yaml.bak-20260628` | 12,497 B | v30 | complete, includes display verbose |
| `config.yaml.corrupt.20260727-190417.bak` | 11,846 B | v33 | first line corrupted |
| `config.yaml.corrupt.20260727-210532.bak` | 11,848 B | v33 | first line corrupted |
| `config.yaml.bak.20260727_214134` | 11,848 B | v33 | first line corrupted, comparison baseline |
| `config.yaml.bak-20260803-211329-pre-skills-external-dirs` | 274 B | v33 | minimal config |
| `config.yaml.bak-20260810-172630-pre-minimax-baseurl-fix` | 323 B | v33 | minimal config |
| `config.yaml.pre-setup.20260926-121440` | 794 B | v46 | minimal config |

That's not right — why did the file sizes shrink?

![Realized something while checking the file size - Something ain't Right. Meme](./assets/008-img/1.jpg)

Then `Hermes Agent` recursively expanded the leaf keys, compared the paths one by one, and checked the missing entries against `DEFAULT_CONFIG`; the config had lost a huge amount (baseline **439** leaf keys, currently 32, **422 missing**). `Hermes Agent` sorted the missing items into three classes:

- **34** whose values differ from the current defaults — missing them really changes behaviour;
- **336** whose values equal the defaults — missing them still hits the defaults, no behaviour change;
- **52** with no default at all — these are old explicit config, plugin parameters, or retired entries.

Among those 34 were fairly important key/value pairs such as `agent.clarify_timeout` (`600` changed to `90`), `agent.restart_drain_timeout` (`60` changed to `0`), `delegation.child_timeout_seconds` (`600` changed to `0`), `curator.stale_after_days` (`30` changed to `14`), `checkpoints.enabled` (`true` changed to `false`), `display.tool_progress_command` (`true` changed to `false`), and so on.

`Hermes Agent` also ruled out one possibility in passing: on 27 July and 3 August the `_config_version` was **33 both times**. The version number didn't change, which suggests this probably wasn't a version migration "migrating away" old keys; rather, one rewrite during that period lost some non-default keys.

### Step 4: forensics on the "first line"

So when exactly was this rewrite? `Hermes Agent` looked carefully at those three July backups and found the first line of all three looked the same:

``` yaml
model: default: MiniMax-M3 provider: minimax-cn base_url: https://api.minimaxi.com/v1
```

This is a flattened `YAML` nested mapping — the three keys `default` / `provider` / `base_url` under `model` were joined into one line with spaces, with no line breaks, no indentation, and no commas. This does not conform to `YAML`'s writing rules, and after reading it `PyYAML`'s verdict was blunt:

```
mapping values are not allowed here
  in "<unicode string>", line 1, column 15
```

`column 15` is exactly the colon after `default` in `model: default:`.

The first time `Hermes Agent` read the bad file, it automatically saved a copy as a `.corrupt.` file, and from the filename (`config.yaml.corrupt.20260727-190417.bak`) we can see that this `.corrupt.` file was created at **19:04:17 on 27 July**. Which means it was already broken **before 19:04**.

What proves it even better: at 21:04:36 that day, an ordinary `hermes auth list` printed this warning right there on screen:

```
⚠️  hermes config: Failed to parse ~/.hermes/config.yaml:
mapping values are not allowed in this context
  in "...config.yaml", line 1, column 15.
Falling back to default config — every user override
(auxiliary providers, fallback chain, model settings) is being IGNORED.
Fix the YAML and restart.
```

That line already spells out the consequence plainly: "**every user override** is being ignored". But I didn't stop at the time. What was I even doing?

![Me realized it might be MYSELF that I hadn’t spotted the notice - This Is Fine. Meme](./assets/008-img/2.jpg)

Leaving the very first one aside, the only difference between the other two corrupt backups is on line 554, where the fallback model changed from `deepseek-v4-pro` to `deepseek-v4-flash`. Which means that after the file broke, it was still being edited by hand.

![Let’s see who edited it: It's ME -Scooby doo mask reveal Meme](./assets/008-img/3.jpg)

### Step 5: pin down the 274 B moment

As the investigation went on, `Hermes Agent` found that in a session on 3 August there was an `ls -la` output that happened to carry `config.yaml`'s modification time:

```
-rw------- 1 ubuntu ubuntu   274 Jul 30 00:36  config.yaml
```

**30 July, 00:36**, 11,848 bytes became 274 bytes. And the entire 274 bytes were:

```yaml
model:
  default: MiniMax-M3
  provider: minimax-cn
  base_url: https://api.minimaxi.com/v1
fallback_providers:
  - provider: deepseek
    model: deepseek-v4-flash
    base_url: https://api.deepseek.com
_config_version: 33
onboarding:
  seen:
    tool_progress_prompt: true
```

Four sections: model routing, the fallback chain, the version number, and a "homepage prompt already seen" marker. Everything else was gone. Gone.

### Step 6: read the writer, answer "why exactly these four"

By this point my original guess was: "after the config broke at the end of July, maybe I did a rebuild / `hermes setup`, and when it rewrote, only model, fallback_providers and onboarding were kept — the whole display section **didn't** get carried over".

That guess was half right, but it couldn't explain two things: why was `_config_version` still there? And why would a rebuild pick these three sections and not others?

It wasn't until `Hermes Agent` read `save_config()` in `hermes_cli/config.py` that the answer turned up in the function's docstring:

```python
def save_config(config: dict, *, strip_defaults: bool = True, ...):
    """Schema defaults are not written unless the user explicitly set them
    (the path exists in the raw config before normalisation) ..."""
```

Hermes's `config.yaml` is "write only the differences"; specifically, keys equal to the schema default are not written to disk, so that when the defaults change later, the user changes along with them. The basis for deciding "this key was explicitly written by the user" is **that the path exists in the raw file**.

So the chain becomes:

1. The first line of `config.yaml` broke, and YAML parsing threw immediately;
2. The reader failed open, returning an empty shell (`{}` or the defaults); the process kept running, only shouting a warning on screen;
3. Some "read–modify–write" caller got the empty shell, added its one key, and called `save_config()`;
4. `save_config()` went to the raw file to fetch the set of "user explicit paths" — **the file couldn't be read, so the set was empty**;
5. The empty set was fed to `_strip_default_values()`, which equals "strip everything that equals the default";
6. Only three classes of keys survived: **those whose currently effective value ≠ the default** (model routing and the fallback chain, which are resolved from the runtime environment), **the forcibly retained `_config_version`**, and **the one key the caller had just written** (that onboarding marker).

Not a single key in the `display` section survived, because at the moment of writing the in-memory `display` had been **regenerated entirely from defaults** since the file couldn't be read; and when the function compared the current `display` key/value pairs against the defaults one by one, they were all equal (it would have been stranger if they weren't). And `model` / `fallback_providers` survived, not because "the rebuild deliberately kept them", but because **their effective values were already different from the defaults**.

In other words: nobody deleted display. Display simply was never read, and got **written off as defaults**.

### Step 7: seven weeks later, upstream fixed the same class of problem

`Hermes Agent` went through the official `github` repo's commit history and found three upstream commits from September 2026:

- `8b9c0b63e7` (09-17) `fix(config): save_config takes explicit paths from the fail-closed read`
- `db2f07c5cf` (09-23) `fix(config): a transient read error no longer wipes config.yaml`
- `b0369c49a1` (09-23) `fix(config): a save refused over bad YAML says to fix the file, not "try again"`

The commit message of `db2f07c5cf` on 23 September explains the mechanism more clearly than my own deduction:

> Every fail-open config reader turned a read error on an intact file into a stand-in (`{}` from `read_raw_config` …). Writers then mutated that stand-in and saved it; the writer re-reads the file, finds it fine, **and merges by deletion**, so one EMFILE/EIO during a TUI config.set, a dashboard save, a migration step or any `load_config()->save_config()` caller replaced the whole file with the stand-in plus one key.

That is, once there was a `transient read error`, that `error` would cause the entire `config.yaml` to be erased.

The upstream fix was to add a `FailedConfigRead` sentinel: when a read fails, it returns a subclass of `dict` carrying the original exception; `save_config()` and `atomic_config_write()` refuse to write to disk when they see it, and the file stays byte-identical. The current `config.py` also has an extra `require_readable_config_before_write()`, with the comment `Fails closed.`, plus an `_omitted_config_paths()` check — any write that "would delete an existing path" is rejected outright.

My incident happened on 30 July; the fix landed between 17 and 23 September. Seven weeks apart. That also explains why the version at the time quietly wrote the file down to 274 bytes: that's just how it was designed back then.

![Hermes agent at that time - I'm gonna pretend I didn't see that. Meme](./assets/008-img/4.jpg)

## Root cause

`Hermes Agent` thinks there are three layers to why this happened, and said "lose any one of them and no data would be lost":

1. **Format layer**: the `model:` section was squashed into one line, and YAML parsing failed (`line 1, column 15`). This is the only "accident"; everything else is its consequence.
2. **Read layer**: the reader fails open — a parse failure is treated as defaults, with just one shout on `stderr`. The process lives, but the config is dead.
3. **Write layer**: `save_config()` uses "explicit paths in the raw file" to decide what to keep; the file can't be read → the whitelist is empty → "write the differences" becomes "delete the differences", and since the writer is merge-by-deletion, the whole file gets replaced.

::: note So says `Hermes Agent`

`Hermes Agent` commented on this:

> On layer 1 (the format layer), all I can give is shape evidence: the first line is "`model:` plus three sub-keys, joined into one line with single spaces, with no trailing space", which looks more like **unquoted shell command substitution** (`$(...)` unquoted does word splitting and then rejoins with single spaces) or **line breaks being eaten when copy-pasting from rendered output**, not something a YAML serialiser wrote — a serialiser wouldn't emit a shape with neither colon separators nor indentation. As for which exact operation it was, the logs left no record, and I'm not going to invent one.

That description deserves a specific word of praise: at least here `Hermes Agent` wasn't trying to make up a reason.
:::

## Fix and verification

### The fix

Once the root cause was known, the fix actually became simple: I had `Hermes Agent` put back the ones worth restoring among those 34 items. `Hermes Agent` decided to go through `hermes config set` the whole way, never hand-editing the file, and to back it up with `cp -p` before every write, so that at least if something went wrong we'd know.

I split the changes into three batches:

| batch | contents | before write | after write |
|---|---|---:|---:|
| first batch | `display.tool_progress: verbose` + `display.platforms.feishu.tool_progress: verbose` | 1,116 B | 1,204 B |
| second batch | `approvals.mode`, `discord.allowed_channels`, `display.busy_input_mode`, `checkpoints.enabled`, `updates.pre_update_backup`, `display.tool_progress_command` | 1,204 B | 1,389 B |
| third batch | `agent.clarify_timeout`, `agent.restart_drain_timeout`, `agent.max_turns`, three `delegation` items, three `curator` items, two `checkpoints` items | 1,389 B | 1,668 B |

When writing, it followed two conventions:

- **Write both the global verbose and the platform verbose**. In the resolution order, the platform override takes priority over the global one: the platform key governs Feishu, the global key governs the other platforms. That way, if I later want to narrow a single platform, I only change that platform's key — no need to roll back the global one;
- **Write defaults explicitly too**. `checkpoints.max_snapshots: 20` and `auto_prune: true` are equal to the defaults and still get written to the file. That way, if upstream changes a default later, it won't silently change my original setting.

Of course, some of the remaining items weren't restored along with the rest. For example `curator.prune_builtins` (previously `true`) archives unused built-in skills, `compression.hygiene_hard_message_limit` (previously `400`) makes a session trigger compression earlier and lose context more easily, and `approvals.timeout` (previously `60`) times out more easily than the default `300`. And a few others besides; I won't go into all of them.

### Verification

After that we verified it from two angles:

- **On disk**: the file grew from **1,116 B** to **1,668 B**; `diff` showed only those specific keys added, nothing else touched.
- **At runtime**: `resolve_tool_progress()` returns `('verbose', True)` for all four platforms; the return values of `get_clarify_timeout()`, `_load_restart_drain_timeout()`, `resolve_turn_limit()` and `checkpoint_agent_kwargs()` are in sync with the current settings. After restarting the gateway, the process environment shows the modified values of `HERMES_RESTART_DRAIN_TIMEOUT` and `HERMES_MAX_ITERATIONS`. Since those two variables only appeared on this restart, their presence says more than any log that the earlier changes had taken effect.

Of course, there's one pitfall here worth writing down separately: `agent.restart_drain_timeout` is read only once at runtime initialisation, so after it's written to the config you must **restart once more** before it takes effect for **"the next shutdown"**. During the three-batch fix, after the first restart the variable still wasn't in the process environment; it only showed up after the second restart.

## Conclusions

1. **"Looks like a rebuild" ≠ a rebuild.** My initial hypothesis (`hermes setup`'s rewrite only carried model/fallback/onboarding) fitted the symptoms perfectly, but couldn't explain "why these particular keys". The real criterion is "these keys' effective values differ from the defaults", not "the rebuild process picked these keys".
2. **A diff writer needs an independent "completeness" criterion.** Using "paths in the raw file" as the whitelist assumes the raw file is readable; once reading the raw file fails, the whitelist degenerates into the empty set, and "write only the differences" becomes "delete everything equal to the defaults". Those two semantics must be separated: *whether the value equals the default* and *whether the value was defined by the user personally* — the truth of the latter cannot be derived from the result of the former.
3. **The cost of fail-open is paid on the write side.** Returning defaults on a read failure is meant to keep the process from crashing; but if that same process then writes, fail-open translates "couldn't read" into "no config", and that puts the write side under enormous pressure.
4. **A warning needs someone to catch it.** That line `every user override ... is being IGNORED` did appear, and three days later the file got written down to 274 bytes, yet I never actually looked at it closely (though maybe it's because `Hermes Agent` didn't show it directly when it ran, so I didn't see it — but it still counts as my fault ("dude, I feel like I'm sweating"))

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../postMortem/deploy/008_HermesAgent_config_silent_shrink.md). The translation is for reference only.
Translation time: 2026-11-23
:::
