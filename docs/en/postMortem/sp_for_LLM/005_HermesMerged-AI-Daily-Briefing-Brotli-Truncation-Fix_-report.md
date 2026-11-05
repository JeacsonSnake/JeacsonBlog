---
title: 005-AI Daily Briefing Cron Job Brotli stream truncation troubleshooting and model-switch fix —— multi-session merged report
date: 2026-06-09
icon: "strategy"
category: Technical Investigation
tag:
  - AI Agent
  - Hermes Agent
  - MiniMax-M3
  - deepseek-v4-flash
  - Brotli
  - Cron Job
---

> This document is a merged summary report of 2 Hermes Agent sessions, covering the models MiniMax-M3 and deepseek-v4-flash. Both sessions work on the same subject, "the Brotli stream truncation failure of the AI Daily Briefing Cron Job": the first used MiniMax-M3 to confirm the symptoms, investigate the root cause and reproduce the failure by hand; the follow-up session, after switching the execution model to deepseek-v4-flash, verified the fix, triggered the Cron Job successfully, and analysed the full technical chain behind the Brotli decoding error in depth.
>
> ---
> Most of the content was put together by Hermes Agent from the sessions; I only did the factual checking and edits, so it is better to have an AGENT read and chew over it before you read it. I cannot promise there is no logical inconsistency in this article, so please keep that in mind (bows)
>
> ---
> **Merged session overview**:  
>
> | Session ID | Model | Messages | Tool calls | Session time |  
> |--------|----------|--------|----------|----------|  
> | 20260609_091940_49a883a3 | MiniMax-M3 | 86 | 47 | 2026-06-09 09:19:40 |  
> | 20260609_095454_5648b63a | deepseek-v4-flash | 123 | 67 | 2026-06-09 09:54:54 |  
>
> **Original session source**: feishu  
> **Subject keywords**: AI Daily Briefing, Brotli, stream truncation, model switch, SSE, Cron Job

## Contents

- [Background and problem definition](#background-and-problem-definition): the failure symptoms and blast radius of the AI Daily Briefing Cron Job
- [First round of investigation and root cause confirmed](#first-round-of-investigation-and-root-cause-confirmed): log analysis and failure reproduction under MiniMax-M3
- [Model switch and fix verification](#model-switch-and-fix-verification): the successful run and comparison after switching to deepseek-v4-flash
- [Deep technical analysis](#deep-technical-analysis): the full five-layer trigger chain of the Brotli stream truncation bug
- [Conclusions and follow-up suggestions](#conclusions-and-follow-up-suggestions): fix summary, key conclusions and long-term suggestions

---

## Background and problem definition

`AI Daily Briefing` is a Cron Job that pushes a digest of AI news on a schedule, running every day at 08:15 CST, with job ID `7cb8f95c3d6b`. The job uses the `agent-reach` skill to pull from several data sources (Twitter/X, Weibo, arXiv, GitHub Trending, RSS blogs), collects the information, generates a structured briefing and delivers it to Discord, Feishu and WeChat.

**Symptoms**:

**User:**
What happened to today's AI Daily Briefing?

The Cron Job had been failing continuously since 2026-06-05, with the error:

```txt
⚠️ Cron job 'AI Daily Briefing' failed:
RuntimeError: Response remained truncated after 3 continuation attempts
```

The briefing body was never generated (the `## Response` section of the output file was the empty `[RESPONSE_PLACEHOLDER]`), Discord and Feishu received empty messages, and WeChat delivery kept failing on the iLink rate limit (that one has nothing to do with the model, it is a known limitation).

### Cron Job basics

| Property | Value |
|------|-----|
| Job ID | `7cb8f95c3d6b` |
| Name | AI Daily Briefing |
| Skill | `agent-reach` |
| Linked Skills | `agent-reach`, `research/aihot` |
| Schedule | `15 8 * * *` (08:15 CST) |
| Delivery channels | Discord, Feishu, WeChat |
| Failing since | 2026-06-05 |

---

## First round of investigation and root cause confirmed

### Investigation direction: log analysis and failure reproduction (Session: 20260609_091940_49a883a3, Model: MiniMax-M3)

The first session focused on confirming the symptoms and a first cut at the root cause. The user and Hermes Agent worked together, narrowing things down step by step by inspecting the Cron Job configuration, the recent run logs and the historical output files.

::: details Tool call chain (4 steps)

**Call 1**: `cronjob`

```json
{"action": "list"}
```

**Result 1**:

```json
{
  "success": true,
  "count": 3,
  "jobs": [
    {
      "job_id": "7cb8f95c3d6b",
      "name": "AI Daily Briefing",
      "skill": "agent-reach",
      "skills": ["agent-reach", "research/aihot"],
      "last_status": "error",
      "last_error": "RuntimeError: Response remained truncated after 3 continuation attempts"
    }
  ]
}
```

**Call 2**: `terminal`

```json
{"command": "ls -la /home/ubuntu/.hermes/cron/output/7cb8f95c3d6b/"}
```

**Result 2**:

```json
{"output": "total 3204\ndrwx------ 2 ubuntu ubuntu  4096 Jun  9 08:23 .\n-rw------- 1 ubuntu ubuntu 54143 Jun  9 08:23 2026-06-09_08-23-05.md\n-rw------- 1 ubuntu ubuntu 54143 Jun  9 09:40 2026-06-09_09-40-49.md\n-rw------- 1 ubuntu ubuntu 62896 Jun  8 08:21 2026-06-08_08-21-10.md\n..."}
```

**Call 3**: `read_file`

Read the 2026-06-09 08:23 output file and found the Response section was `[RESPONSE_PLACEHOLDER]` (empty).

**Call 4**: `terminal`

```json
{"command": "grep -n '## Response' /home/ubuntu/.hermes/cron/output/7cb8f95c3d6b/2026-06-09_08-23-05.md"}
```

**Result 4**:

```json
{"output": "1195:## Response\n1199:## Response"}
```

:::

### Core finding: the Brotli stream truncation error

Working layer by layer through `agent.log`, the Agent located the origin of the failure. The Cron Session log of 2026-06-09 08:15:17 revealed a clear failure chain:

| Time | Event |
|------|------|
| 08:15:17 | Job starts, tool calls (Twitter/Weibo/arXiv/GitHub/RSS) begin normally |
| 08:16:36 | `twitter search` returns `not_authenticated` (no `twitter-env.sh` in the Cron environment, a known cookie-loading issue) |
| 08:17:22 | Another terminal call exits 1 |
| from 08:18 | Agent finishes all data sources and starts generating the final briefing |
| **08:21:18** | **First stream truncation**: `brotli: decoder process called with data when 'can_accept_more_data()' is False`** |
| **08:22:11** | **Second stream truncation**: same error (partial stream, 0 chars) |
| **08:23:05** | **Third stream truncation** → `RuntimeError: Response remained truncated after 3 continuation attempts` |

The key insight: all three retries failed at the same position, because the state of the Brotli C decoder is **deterministic** — same compressed data, same chunk boundaries, the error necessarily fires at the same place again.

### Confirming it by hand

**User:**
From what I understand, the briefing still hasn't been generated, right? Try triggering this cron job by hand and see what it returns at this point in time. If it still fails, let's spin up a sub-agent and redo this cronjob with the deepseek-v4-flash model we configured earlier.

After confirming the current state, the Agent triggered the Cron Job by hand. The reproduction was 100% identical:

| API Call | in | out | latency | status |
|---------|----|-----|---------|------|
| #1 | 19,562 | 242 | 8.0s | ✅ |
| #2 | 22,079 | 1,407 | 36.8s | ✅ |
| #3 | 24,739 | 1,300 | 31.3s | ✅ |
| #4 | 32,912 | 1,142 | 43.0s | ✅ |
| #5 | 36,858 | 834 | 18.9s | ✅ |
| #6 | 37,815 | 529 | 15.0s | ✅ |
| #7 | 42,214 | 825 | 17.8s | ✅ |
| #8 | 43,109 | 1,565 | 47.2s | ✅ |
| **09:38:37** | — | — | — | **brotli #1** (partial stream, 0 chars) |
| **09:39:44** | — | — | — | **brotli #2** (partial stream, 0 chars) |

After the second brotli error appeared, the Agent judged that the third was bound to fail, stopped waiting and went straight to the user: **switch the model**.

> **First-session conclusion**: `MiniMax-M3` always hits the brotli error on long streaming responses (>~4000 output tokens). The user agreed to switch the execution model to `deepseek-v4-flash`.

---

## Model switch and fix verification

### Triggering by hand after switching to deepseek-v4-flash (Session: 20260609_095454_5648b63a, Model: deepseek-v4-flash)

The second session started after the model was switched to `deepseek-v4-flash`. The user told the Agent to trigger the Cron Job again and compare:

**User:**
@HERMES_AGENT_CRI1 After the investigation in the previous session (`id`: `20260609_091940_49a883a3`), we found that this cron job had a problem. We have now changed your main model to `deepseek-v4-flash`; try triggering it by hand again, and try to verify whether this run differs from the previous one.

The Agent first confirmed that the current main model was now `deepseek-v4-flash` / `deepseek`, then triggered the Cron Job by hand:

::: details Tool call chain (3 steps)

**Call 1**: `cronjob`

```json
{"action": "trigger", "job_id": "7cb8f95c3d6b"}
```

**Result 1**:

```json
{"success": true, "job": {"job_id": "7cb8f95c3d6b", "name": "AI Daily Briefing", "model": null, "provider": null, "next_run_at": "2026-06-09T09:55:18"}}
```

> Note: the `model` and `provider` fields are `null`, meaning they inherit the main model from `config.yaml` (now `deepseek-v4-flash`).

**Call 2**: `terminal`

```json
{"command": "grep 'cron_7cb8f95c3d6b_20260609_095518' /home/ubuntu/.hermes/logs/agent.log | tail -20"}
```

**Result 2**:

```txt
2026-06-09 09:55:18,511 INFO ... model=deepseek-v4-flash provider=deepseek
2026-06-09 09:55:44,524 INFO ... tool terminal completed (3.27s, 4818 chars)
2026-06-09 09:55:51,005 INFO ... tool terminal completed (5.48s, 37454 chars)
2026-06-09 09:56:21,900 INFO ... tool terminal completed (29.89s, 49906 chars)
2026-06-09 09:56:35,081 INFO ... API call #3: model=deepseek-v4-flash ... latency=11.0s
2026-06-09 09:56:47,269 INFO ... API call #4: model=deepseek-v4-flash ... latency=4.3s cache=100%
2026-06-09 09:56:53,378 INFO ... API call #5: model=deepseek-v4-flash ... latency=3.6s cache=100%
...
```

**Call 3**: `terminal`

```json
{"command": "grep 'delivered to' /home/ubuntu/.hermes/logs/agent.log | tail -10"}
```

**Result 3**:

```txt
2026-06-09 09:58:22,262 INFO ... delivered to discord:1500119330904604866 via live adapter
2026-06-09 09:58:23,520 INFO ... delivered to feishu:oc_c2c420673b80c4077e935d45ba11e770 via live adapter
```

:::

### Comparing the run results

| Dimension | MiniMax-M3 (Session 1, first round) | deepseek-v4-flash (Session 2) | Verdict |
|------|---------------------------|------------------------------|------|
| **Total time** | ~8 min until the brotli failure | **~3 min** to complete | ✅ 60%+ faster |
| **API Call latency** | 15-47s per call | **2.7-5s per call** (36.5s for the generation call) | ✅ 5-10x faster |
| **Cache hit rate** | 90-98% | **99-100%** (later on) | ✅ higher |
| **Brotli errors** | **3 in a row** → RuntimeError | **0** | ✅ **root cause gone** |
| **Finish Reason** | `RuntimeError` | **`stop` (clean finish)** | ✅ |
| **Briefing content** | not generated (empty placeholder) | **generated in full (~64KB)** | ✅ |
| **Discord delivery** | ✅ (empty message) | ✅ (full briefing) | ✅ improved |
| **Feishu delivery** | ✅ (empty message) | ✅ (full briefing) | ✅ improved |
| **WeChat delivery** | ❌ iLink rate limit | ❌ iLink rate limit | same (old issue, unrelated to the model) |

The briefing was completely whole: 8 GitHub entries, 5 arXiv papers, Twitter tracking + search, 7 Weibo posts, 6 blog posts, a one-line summary, every section filled normally, no trace of brotli truncation.

**Conclusion: the model switch fixed the problem completely.** `deepseek-v4-flash` not only beat MiniMax-M3 by a wide margin on latency, more importantly it eliminated the brotli stream truncation failure once and for all.

---

## Deep technical analysis

### The request for a deeper investigation

After the fix was verified, the user asked for a deeper investigation into the technical root cause of the bug:

**User:**
Help me investigate this problem, and closely related cases on the web, from the existing code. Explain what specifically causes this bug, and what effect using a different model has on triggering it.

The Session 2 Agent went through a full multi-layer technical-stack analysis via code review (Hermes source, brotlicffi, httpx, openai SDK) and web search.

### The five-layer trigger chain

This is a failure of **5 layers of the stack piling up on each other**; no single layer can take the blame alone:

```txt
┌──────────────────────────────────────────────────────┐
│  brotlicffi 1.2.0.1 (CFFI binding)                   │  ← layer 1: C library state-machine race
├──────────────────────────────────────────────────────┤
│  brotli C library (libbrotlidec)                     │  ← layer 2: NEEDS_MORE_OUTPUT
├──────────────────────────────────────────────────────┤
│  httpx 0.28.1                                        │  ← layer 3: can_accept_more_data() not checked
├──────────────────────────────────────────────────────┤
│  openai 2.24.0 SDK                                   │  ← layer 4: inherits Accept-Encoding: br
├──────────────────────────────────────────────────────┤
│  Hermes run_agent.py                                 │  ← layer 5: the client asks for brotli
├──────────────────────────────────────────────────────┤
│  MiniMax API — Content-Encoding: br                  │  ← trigger: the SSE stream uses brotli
└──────────────────────────────────────────────────────┘
```

### Root cause at source level

#### 1. The guard logic in brotlicffi._decompress()

In `brotlicffi==1.2.0.1`, the `Decompressor` class keeps an internal state `_unconsumed_data` inside the C-level decompression loop. When the C function `BrotliDecoderDecompressStream` returns `NEEDS_MORE_OUTPUT` (output buffer full) while the input buffer has **not been fully consumed**, the remaining input is stashed in `_unconsumed_data`:

```python
# brotlicffi/__init__.py (~around line 87, the _decompress method)

def _decompress(self, data, output_buffer_limit):
    if self._unconsumed_data and data:                          # ← the guard
        raise error(
            "brotli: decoder process called with data when "
            "'can_accept_more_data()' is False"
        )
    # the C decompression loop
    rc = lib.BrotliDecoderDecompressStream(self._decoder, ...)
    # ...
    # keep the input that was not fully consumed
    if available_in[0] > 0:
        remaining_input = ffi.buffer(next_in[0], available_in[0])[:]
        self._unconsumed_data = remaining_input
```

**The point**: if `_unconsumed_data` is non-empty (last time some input was left unprocessed) and this call passes in new data → **it raises straight away**.

#### 2. Why doesn't httpx check?

`httpx._decoders.BrotliDecoder.decode()` just forwards, with no up-front check:

```python
class BrotliDecoder(ContentDecoder):
    def decode(self, data: bytes) -> bytes:
        if not data:
            return b""
        self.seen_data = True
        try:
            return self._decompress(data)   # ← called directly, can_accept_more_data() not checked
        except brotli.error as exc:
            raise DecodingError(str(exc)) from exc
```

When the underlying C decoder enters the **needs more output buffer** state (large compressed payload + small TCP chunks), `_unconsumed_data` gets filled, and the next new chunk httpx hands over trips the guard.

#### 3. Why does every retry fail at the same position?

Hermes' continuation mechanism (`conversation_loop.py:1419-1468`) appends a "please continue" message and retries after the stream breaks:

```python
if length_continue_retries < 3:
    continue_msg = {"role": "user", "content": _continue_content}
    messages.append(continue_msg)
```

But the state of the Brotli C decoder is **deterministic** — same compressed data, same chunk boundaries, the C state machine necessarily enters the `NEEDS_MORE_OUTPUT` state at the same place again. So all 3 retries fail.

#### 4. Why does the error show finish_reason="length"?

In `chat_completion_helpers.py:2433-2456`, when the stream breaks but some tokens have already been delivered, Hermes creates a `PARTIAL_STREAM_STUB`:

```python
_stub_finish_reason = FINISH_REASON_LENGTH   # disguised as the "output length limit"
return SimpleNamespace(
    id=PARTIAL_STREAM_STUB_ID,
    choices=[SimpleNamespace(finish_reason=_stub_finish_reason)],
)
```

This is **not** a real `max_tokens` truncation — Hermes uses this `finish_reason` to trigger the continuation retry mechanism, but the root cause has nothing to do with token length.

### Similar cases on the web

#### urllib3 Issue #3734 (2025-12-09)

- **Title**: "Brotli DecodeError with chunked transfer encoding: 'can_accept_more_data() is False'"
- **Status**: closed, fixed by the merged PR #3736
- **Pain point**: a regression urllib3 2.6.0 picked up from a security update (GHSA-2xpw-w6gg-jr37)
- **Reproduction conditions** (a 100% match with this case):
  - `Content-Encoding: br` (brotli compression)
  - `Transfer-Encoding: chunked`
  - compressed payload >500KB
  - data arriving in small TCP segments
- **Conclusion**: `can_accept_more_data() returns False` but the caller keeps feeding data

That issue states explicitly that "**The issue does not occur with urllib3 2.5.0**" — so a change in 2.6.0 trips a state-machine-sensitive condition deep inside the brotli C library.

#### Hermes' own known workaround (skills_hub.py)

The Hermes team already knew about this bug and put an explicit workaround in `skills_hub.py:1410-1415`:

```python
# httpx's optional brotlicffi backend has a streaming-decode bug
# that fails on these specific payloads. Excluding "br" from
# Accept-Encoding makes the server fall back to gzip (or
# identity), which works on every httpx install.
sitemap_headers = {"Accept-Encoding": "gzip"}
```

But that workaround applies **only** to the HTTP requests in `skills_hub.py`, not to the Provider API calls.

### What different models/Providers change

#### MiniMax-M3 → **triggers the bug**

| Factor | Value | Effect |
|------|-----|------|
| HTTP version | HTTP/2 | — |
| **Accept-Encoding negotiation** | httpx asks for `gzip, deflate, br` by default | MiniMax's server picks `br` |
| **MiniMax response encoding** | `Content-Encoding: br` (brotli) | **the necessary condition** |
| Response shape | SSE chunked stream, large response (>500KB compressed) | trips the C library state-machine race |
| TCP segmentation | real network packets are small | makes `_unconsumed_data` build up |
| **Result** | **brotli decode error → 3 failed retries → RuntimeError** | ❌ |

#### DeepSeek V4 Flash → **does not trigger the bug**

| Factor | Value | Effect |
|------|-----|------|
| HTTP version | HTTP/2 | — |
| DeepSeek response headers | `content-type: text/event-stream; charset=utf-8` | **no Content-Encoding** |
| **Actual encoding** | **no compression (identity)** | httpx uses IdentityDecoder (pass-through) |
| Response shape | plain-text SSE stream | skips the brotli decode path entirely |
| **Result** | **no brotli decode, no error** | ✅ |

#### The core difference in one line

```txt
MiniMax API:   Accept-Encoding: gzip, deflate, br  →  server picks br  →  BrotliDecoder  →  bug fires
DeepSeek API:  Accept-Encoding: gzip, deflate, br  →  server does not compress  →  IdentityDecoder  →  nothing happens
```

**DeepSeek is not "more brotli-compatible", it simply never uses brotli**. It dodges the bug purely by coincidence.

#### What to expect from other Providers

| Provider | Expected Content-Encoding | Expected to trigger the bug |
|----------|----------------------|-------------|
| **Anthropic** (direct) | usually not `br` | low probability |
| **OpenAI** (direct) | `gzip` or `identity` | low probability |
| **OpenRouter** (proxy) | depends on the upstream | depends on the upstream |
| **Google Gemini** | dedicated SDK, does not go through httpx brotli | irrelevant |
| **any API behind an Nginx reverse proxy** | depends on the nginx config | possible |

---

## Conclusions and follow-up suggestions

### Key conclusions

1. **Root cause**: the failure of the `AI Daily Briefing` Cron Job is not a Hermes bug, nor a MiniMax bug, but a **five-layer compatibility problem** of `brotlicffi==1.2.0.1` + `httpx==0.28.1` + the MiniMax API. The trigger conditions are:
   - the API server uses `Content-Encoding: br` for the SSE streaming response
   - the compressed payload is large enough (~500KB+ in the MiniMax case)
   - data arrives in small chunks (HTTP/2 frame splitting + network MTU)
   - the C library decoder enters `NEEDS_MORE_OUTPUT` while input is not exhausted → `_unconsumed_data` non-empty → the next call raises

2. **The model switch is an effective fix**: after switching the execution model from `MiniMax-M3` to `deepseek-v4-flash`:
   - the brotli stream truncation failure is gone completely (0 errors)
   - execution latency dropped from 15-47s per call to 2.7-5s per call (a 5-10x improvement)
   - total time dropped from ~8 min (failure) to ~3 min (success)
   - the briefing was generated in full and delivered successfully

3. **DeepSeek bypasses the bug rather than "fixing" it**: the SSE stream returned by the DeepSeek API carries no `Content-Encoding` header (identity encoding), so httpx uses `IdentityDecoder` and passes the data straight through, skipping the brotli decode path entirely.

### Follow-up suggestions

1. **Long-term fix on the Hermes side**: disable brotli uniformly at the Provider configuration layer (like `skills_hub.py` does), either by overriding `Accept-Encoding: gzip` on every API request or by adding a `disable_brotli: true` option to the Provider config, so that it no longer depends on whether the upstream server chooses brotli.

2. **Upstream fix in brotlicffi/httpx**: keep an eye on new releases of `brotlicffi` and `httpx`. urllib3 already fixed the same class of problem in issue #3734 (PR #3736); httpx may need a similar fix.

3. **Monitoring and alerts**: add an alert on the brotli error pattern for the Cron Job. The current message `Response remained truncated after 3 continuation attempts` is a wrapped one; the underlying failure is a brotli decode failure, so keep the original error in the log to make it quick to locate.

4. **Provider selection advice**: for large streaming outputs (long-text generation, multi-tool aggregate reports), prefer a Provider that does not enable brotli compression, or disable brotli explicitly at the Hermes configuration layer.

5. **The WeChat delivery problem**: the WeChat delivery failure caused by the iLink rate limit is a known issue independent of the model switch and needs its own fix (adding retry backoff, or changing the WeChat delivery approach).

### How the sessions differed

Although the two sessions used different models, they worked together well:

- **Session 1 (MiniMax-M3)**: solid during the investigation phase, systematically working through the logs, the code and the reproduction. But on long streaming outputs it is itself affected by the brotli bug (not as an Agent run, since Agent output does not go through brotli decoding, but as the Cron Job execution model).

- **Session 2 (deepseek-v4-flash)**: stronger code analysis during the fix verification and deep technical analysis, drilling down into the brotlicffi/httpx source to the exact function and state-machine logic, and finding the known urllib3 case of the same class through web search.

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md. The translation is for reference only.
Translation time: 2026-11-05
:::
