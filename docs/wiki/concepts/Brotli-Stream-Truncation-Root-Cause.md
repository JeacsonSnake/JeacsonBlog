---
title: "Brotli 流截断的五层根因：brotlicffi 守卫 + httpx 不检查 + 服务端 br"
description: "`brotli: decoder process called with data when 'can_accept_more_data()' is False` 的完整技术分析：五层技术栈（Hermes 请求 br → openai SDK 继承 → httpx 不检查 can_accept_more_data → brotli C 状态机 NEEDS_MORE_OUTPUT → brotlicffi 的 `_unconsumed_data` 守卫抛错）、为什么 retry 永远在同一位置失败、四种 Provider 的 Content-Encoding 差异、urllib3 #3734 的同类回归、以及 Hermes 已在 skills_hub.py 做过的规避为什么没覆盖 Provider 调用"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [Brotli, httpx, brotlicffi, Streaming, LLM Provider, Root Cause, Hermes Agent]
sources:
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
related:
  - ./AI-Daily-Briefing-Brotli-Fix-Investigation.md
  - ./Hermes-Agent-Cronjob-Setup.md
  - ../entities/Hermes-Agent.md
---

# Brotli 流截断的五层根因

## 核心结论

> 报错的那一句 `brotli: decoder process called with data when 'can_accept_more_data()' is False` 不是"数据坏了"，而是**调用方在上一次解码没消化完时又塞了新数据**。它需要五层同时对才发生：客户端请求 br、服务端真返回 br、SDK 不改 Accept-Encoding、httpx 不检查解码器状态、brotlicffi 的守卫直接抛错。少任何一层，故障都不会出现——所以它极难复现，也极难归因。

「修好了没有」的判断在：[AI Daily Briefing 流截断故障的修复与验证](./AI-Daily-Briefing-Brotli-Fix-Investigation.md)。

## 五层叠加

```
┌─────────────────────────────────────────────┐
│  brotlicffi 1.2.0.1 (CFFI binding)          │  ← 第 1 层：C 库状态机 race
├─────────────────────────────────────────────┤
│  brotli C library (libbrotlidec)            │  ← 第 2 层：NEEDS_MORE_OUTPUT
├─────────────────────────────────────────────┤
│  httpx 0.28.1                               │  ← 第 3 层：未检查 can_accept_more_data()
├─────────────────────────────────────────────┤
│  openai 2.24.0 SDK                          │  ← 第 4 层：继承 Accept-Encoding: br
├─────────────────────────────────────────────┤
│  Hermes run_agent.py                        │  ← 第 5 层：客户端请求 brotli
├─────────────────────────────────────────────┤
│  MiniMax API — Content-Encoding: br         │  ← 触发条件：SSE 流启用 brotli
└─────────────────────────────────────────────┘
```

## 故障时间线（一次失败长什么样）

`agent.log` 里 2026-06-09 08:15 那次 Cron Session：

| 时间 | 事件 |
|---|---|
| 08:15:17 | 任务启动，正常调用 Twitter / 微博 / arXiv / GitHub / RSS 工具 |
| 08:16:36 | `twitter search` 返回 `not_authenticated`（Cron 环境没有 twitter-env.sh，与本故障无关） |
| 08:17:22 | terminal 调用 exit 1 |
| 08:18 起 | 数据源调完，开始生成最终简报 |
| **08:21:18** | **第一次流截断**：`brotli: decoder process called with data when 'can_accept_more_data()' is False` |
| **08:22:11** | **第二次流截断**：同一错误（partial stream, 0 chars） |
| **08:23:05** | **第三次流截断** → `RuntimeError` |

三次都在"开始生成长文本之后"，且都在同一位置 —— 这是解码器状态的确定性，不是偶发抖动。

## 源码级根因

**① brotlicffi 的 `_decompress()` 守卫**

```python
# brotlicffi/__init__.py (~行 87)
def _decompress(self, data, output_buffer_limit):
    if self._unconsumed_data and data:                          # ← 守卫条件
        raise error(
            "brotli: decoder process called with data when "
            "'can_accept_more_data()' is False"
        )
    rc = lib.BrotliDecoderDecompressStream(self._decoder, ...)
    if available_in[0] > 0:
        remaining_input = ffi.buffer(next_in[0], available_in[0])[:]
        self._unconsumed_data = remaining_input
```

`_unconsumed_data` 非空（上次还有输入没消化）时又传新数据 → **直接抛错**。

**② httpx 为什么不检查**

`httpx._decoders.BrotliDecoder.decode()` 直接转发，没有前置检查。当底层 C 解码器进入"需要更多输出缓冲区"（大型压缩数据 + 小 TCP chunk），`_unconsumed_data` 被填满，下一个 chunk 到达即触发守卫。

**③ 为什么每次 retry 都在同一位置**

Brotli C 解码器状态是**确定性**的：同样的压缩数据 + 同样分块边界 → 必然在同一字节位置再次进入 `NEEDS_MORE_OUTPUT`。因此 Hermes 的 continuation 机制（追加"请继续"重试）注定无效——**它解决的是"输出被截断"，而这里的问题是"输入根本没法再喂进去"**。

## 不同 Provider 的差别

```
MiniMax API:   Accept-Encoding: gzip, deflate, br  →  Server 选 br   →  BrotliDecoder   →  触发 bug
DeepSeek API:  Accept-Encoding: gzip, deflate, br  →  Server 不压缩  →  IdentityDecoder →  无事发生
```

| Provider | Content-Encoding | 触发 bug |
|---|---|---|
| MiniMax | `br`（brotli） | 高概率 |
| DeepSeek V4 Flash | identity（无压缩） | 不会 |
| Anthropic（直连） | 通常不用 `br` | 低概率 |
| OpenAI（直连） | `gzip` 或 identity | 低概率 |

注意客户端一侧完全相同：**差别全在服务端是否真的选择 br**。

## 上游同类案例

urllib3 Issue #3734（2025-12-09）报了完全相同的错误，触发条件 100% 匹配：

- `Content-Encoding: br`
- `Transfer-Encoding: chunked`
- 压缩数据 > 500 KB
- 数据以小 TCP 分段到达

issue 里明确写 "The issue does not occur with urllib3 2.5.0" —— 是 2.6.0 的安全更新（GHSA-2xpw-w6gg-jr37）引入的回归。

## Hermes 已知规避为什么没盖住

`skills_hub.py:1410-1415` 已有显式规避：

```python
# httpx's optional brotlicffi backend has a streaming-decode bug
# that fails on these specific payloads. Excluding "br" from
# Accept-Encoding makes the server fall back to gzip (or
# identity), which works on every httpx install.
sitemap_headers = {"Accept-Encoding": "gzip"}
```

但这句只作用在 `skills_hub.py` 的 HTTP 请求上，**没有应用到 Provider 的 API 调用**。这就是"知道 bug 却没生效"的典型：规避写在调用点，而不是写在一层所有出站请求都会经过的地方。

## 与修复页的关系

诊断到这里，能做的只有两件事：换 Provider 止血、或在配置层统一禁 br。实际执行与验证见 → [AI Daily Briefing 流截断故障：从 MiniMax-M3 切到 deepseek-v4-flash](./AI-Daily-Briefing-Brotli-Fix-Investigation.md)。
