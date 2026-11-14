---
title: "AI Daily Briefing 流截断故障：从 MiniMax-M3 切到 deepseek-v4-flash"
description: "AI Daily Briefing 定时任务连续 4 天报 `Response remained truncated after 3 continuation attempts` 的修复记录：症状识别（Response 段为空、投递空消息）、切换 Provider 后 6 项指标对比（耗时 3min vs 8min、API 延迟 2.7-5s vs 15-47s、cache 命中 99-100%、brotli 0 次、finish_reason=stop、正文 64KB）、以及为什么『换模型就好了』不等于『问题被修好了』"
created: 2026-06-09
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [AI Agent, Hermes Agent, Cron Job, MiniMax-M3, DeepSeek, Troubleshooting, Provider]
sources:
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
related:
  - ./Brotli-Stream-Truncation-Root-Cause.md
  - ./Hermes-Agent-Cronjob-Setup.md
  - ./VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - ../entities/Hermes-Agent.md
---

# AI Daily Briefing 流截断故障与模型切换修复

## 核心结论

> **换个 Provider 就好了，但 bug 没修。** 故障是 `brotlicffi` + `httpx` + MiniMax 返回 `Content-Encoding: br` 的五层叠加；切到 deepseek-v4-flash 之所以有效，是因为它**根本不返回 brotli**（identity 编码），而不是它"兼容得更好"。所以要记住两道防线：**短期换 Provider 止血，长期在 Provider 配置层统一禁 br**。

## 故障现象

AI Daily Briefing 定时任务（Job ID `7cb8f95c3d6b`，每日 08:15 CST）从 **2026-06-05** 起连续失败 4 天：

- **错误**：`RuntimeError: Response remained truncated after 3 continuation attempts`
- **表现**：简报正文未生成（输出文件里 `## Response` 段是空占位 `[RESPONSE_PLACEHOLDER]`），Discord / 飞书投递空消息
- **干扰项**：微信投递同时失败，但那是 iLink rate limit，与本次故障无关
- **复现率**：手动触发 100% 复现，每次都在 API call #8 之后（约 4000+ tokens 输出）触发 brotli 解码错误

## 修复动作

把执行模型从 **MiniMax-M3** 切成 **deepseek-v4-flash**，然后手动触发验证。切换后同一任务、同一 prompt、同一数据源：

| 维度 | MiniMax-M3（修复前） | deepseek-v4-flash（修复后） | 结论 |
|---|---|---|---|
| 总耗时 | ~8 min 后失败 | **~3 min** 完成 | 快 60%+ |
| API call 延迟 | 15–47 s/次 | **2.7–5 s/次**（生成 call 36.5 s） | 快 5–10x |
| Cache 命中率 | 90–98% | **99–100%** | 更高 |
| Brotli 错误 | 3 次连续 | **0 次** | 根因路径消除 |
| finish_reason | `RuntimeError` | `stop` | 正常收尾 |
| 简报内容 | 空 placeholder | 完整 ~64 KB | 正常产出 |

## 为什么"换模型"能止住

三种 Provider 对同一请求的回应不同：

```
MiniMax API:   Accept-Encoding: gzip, deflate, br  →  Server 选 br        →  BrotliDecoder  →  触发 bug
DeepSeek API:  Accept-Encoding: gzip, deflate, br  →  Server 不压缩      →  IdentityDecoder →  无事发生
```

Hermes 客户端三种 Provider 都发同样的 `Accept-Encoding`，**差别全在服务端是否真的用 br 压缩**。所以这不是"deepseek 更稳"，而是"deepseek 没走那条路"——换成任何返回 identity/gzip 的 Provider 都会好，换成另一个用 br 的 Provider 会再犯。

完整的五层技术与源码级分析在：[Brotli 流截断的五层根因](./Brotli-Stream-Truncation-Root-Cause.md)。

## 关键结论

1. **不是 Hermes 的 bug，也不是 MiniMax 的 bug**，而是 `brotlicffi==1.2.0.1` + `httpx==0.28.1` + 服务端 `Content-Encoding: br` 的叠加兼容性问题。
2. **模型切换是有效止血**：错误消失、延迟降一个数量级、产出完整。
3. **止血 ≠ 修复**：deepseek 只是绕开了 brotli 解码路径。若将来切回任何启用 br 的 Provider，故障会原样回来。

## 后续建议

1. **Hermes 侧长期修复**：在 Provider 配置层统一禁用 brotli（照 `skills_hub.py` 的做法给 API 请求加 `Accept-Encoding: gzip`），而不是逐个 Provider 试运气。
2. **上游跟踪**：盯 `brotlicffi` 与 `httpx` 的版本更新（urllib3 已在 issue #3734 / PR #3736 修了同类问题）。
3. **监控**：为 Cron Job 增加 brotli 错误模式告警，保留原始错误日志。
4. **Provider 选择**：大型流式输出场景优先选不启用 br 压缩的 Provider。
5. **微信投递**：iLink rate limit 是独立问题，单独处理。

## 关联

- [Brotli 流截断的五层根因（源码级分析、Provider 对比、上游 issue）](./Brotli-Stream-Truncation-Root-Cause.md)
- [Hermes Agent 部署与 RSS 每日简报 cronjob 配置方法论](./Hermes-Agent-Cronjob-Setup.md)
- [多会话融合 META Prompt（生成这份排查报告用的模板）](./VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md)
- [Hermes Agent 实体聚合页](../entities/Hermes-Agent.md)
- [sp_for_LLM/005 原始多会话融合报告](../../postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.html) — 完整对话记录
