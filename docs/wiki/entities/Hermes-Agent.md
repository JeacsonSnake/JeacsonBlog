---
title: Hermes Agent
description: "Hermes Agent — Nous Research 开发的可自我调整 skills 的 AI Agent，本博客核心使用对象"
type: entity
tags: [AI Agent, Hermes, NousResearch, LLM]
related:
  - docs/wiki/concepts/Hermes-Agent-Cronjob-Setup.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/wiki/concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md
  - docs/wiki/entities/LLM-Prompt-Skill.md
created: 2026-06-08
updated: 2026-06-09
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
  - docs/postMortem/sp_for_LLM/004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md
  - docs/postMortem/sp_for_LLM/000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
---

# Hermes Agent

## 概述

Hermes Agent 是 Nous Research 开发的 AI Agent 框架，核心特性是**可自我调整各个 skill 以及它们之间的联系**。本博客的 LLM Wiki 架构、RSS 简报推送、LLM 对话记录转 Markdown 等工作流均基于此 Agent。本实体汇总与 Hermes Agent 相关的部署配置、工作流和踩坑记录。

## 主要工作流

### VPS 部署 + RSS/Agent-Reach 每日简报 cronjob

在腾讯云入门型 VPS（2 CPU / 2 GB RAM / Ubuntu 24.04 LTS）上部署 Hermes Agent，配置每日 7:00 触发的 cronjob，通过 FOLO + Agent-Reach 聚合 RSS、GitHub、微博、arXiv 信源并推送日报。

相关文档：
- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — 部署流程、模型选择、gateway 多路互备完整方法论
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — sp_for_LLM/005：Brotli 流截断故障的根因诊断与模型切换修复
- [[../sources/PostMortem.md]] — 踩坑心得摘要

### LLM Wiki 维护工作流

由 Hermes Agent 读取原始博客笔记，通过 fork + Pull Request 的方式增量维护 `docs/wiki/` 知识层。配套使用 `vuepress-wiki-integration` skill 强制 GitHub-API 操作纪律。

相关文档：
- [[./LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体（含 wiki ingest workflow）
- [[../concepts/VuePress-Theme-Hope-Markdown-Converter.md]] — LLM 对话→VuePress Markdown 转换
- [[../concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md]] — Hermes JSON 导出→VuePress Markdown 转换（单文件）
- [[../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md]] — Hermes 多会话 JSON 融合（sp_for_LLM/000Y 新增）

### Skills 体系分析与 LangChain Interpreter Skills 对比（sp_for_LLM/004）

通过 Hermes Agent 多轮对话（131 条消息 / 66 次工具调用）调研 LangChain 实验性功能 *Interpreter Skills* 与 Hermes Skills 体系的异同。基于 `hermes-agent` v0.16.0 源码（截至 2026-06-05）的代码级分析得出的关键发现：

- **Hermes Skills 加载**：纯 SKILL.md 模式（提示词驱动），仅有加载时的"预处理"环节，无运行时执行回环 → 长流程 / 高确定性场景下存在"上下文焦虑"
- **Programmatic Tool 机能对比**：LangChain Interpreter Skills 走 Python 运行时沙盒，Hermes 通过 terminal / read_file / patch / search_files 等 Programmatic Tool 组合实现同等能力
- **Memory 三层架构**：built-in `MEMORY.md`（2200 字符预算，注入 system prompt）↔ Holographic Memory（`fact_store` SQLite，无字符限制）↔ Disk-level 验证纪律（写入 ≠ 落盘，必须 read_file / cat / grep / stat 验证）
- **冲突指令处理**：当用户指令与已有规则矛盾（如 fact_id=26 memory-discipline 说"工作流程存 fact_store"，用户却说"存到 memory"），agent 必须指出冲突、不立即动作、等待用户明确覆盖或遵循

相关文档：
- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体（含 sp_for_LLM/004 workflow 段）

### 会话 JSON 导出与 VuePress Markdown 转换

通过 `hermes sessions export --session-id xxx /home/ubuntu/output.json` 导出多轮对话 JSON，再用 Kimi 生成的 META Prompt 转换为 VuePress 兼容 Markdown。专门处理 Hermes 特有的 `tool_calls` 数组、`tool` 消息配对、`reasoning_content` 丢弃、`::: details` 折叠等场景。

相关文档：
- [[../concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md]] — META Prompt 模板完整说明（单文件）
- [[../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md]] — META Prompt 模板（sp_for_LLM/000Y：多会话融合）

### AI Daily Briefing Cron Job 故障排查与模型切换（sp_for_LLM/005 新增）

`AI Daily Briefing`（Job ID `7cb8f95c3d6b`，每日 08:15 CST）从 2026-06-05 起持续失败，错误信息 `RuntimeError: Response remained truncated after 3 continuation attempts`。通过 2 个会话的融合报告（MiniMax-M3 调查 + deepseek-v4-flash 修复验证 + 根因源码分析）定位到 `brotlicffi==1.2.0.1` + `httpx==0.28.1` + MiniMax API 启 brotli 压缩的**五层叠加兼容性 bug**。**修复方案**：将执行模型切换至 `deepseek-v4-flash`（返回 identity 编码，绕过 brotli 解码路径），简报从空 placeholder 变为完整 ~64KB 输出，延迟从 15-47s/次降至 2.7-5s/次。

相关文档：
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — 完整故障排查、根因分析（5 层技术栈）、修复方案、后续建议

## 核心配置

- **主模型**: MiniMax-2.6 → MiniMax-2.7 → MiniMax-M3 → **2026-06-09 切换至 deepseek-v4-flash**（Brotli bug 触发后）
- **Fallback 模型**: kimi-k2.5 / kimi-k2.6 / Deepseek-V4-flash
- **多模态（图像生成占位）**: qwen/qwen3-vl-8b-instruct via OpenRouter
- **Memory**: built-in → holographic memory（迁移完成；disk-level 验证纪律 + 冲突指令处理规范于 2026-06-08 沉淀为 fact_id=45/46）
- **Skills**: SKILL.md 提示词驱动 + Programmatic Tool（terminal / read_file / patch / search_files）
- **Gateway 互备**: 微信（ilink API）/ Discord / 飞书 — 同时下发确保 cronjob 日志可送达
- **部署环境**: 腾讯云入门型 VPS，Ubuntu 24.04 LTS

## 关键陷阱

- **衔尾蛇问题**: wiki 自身的更新被 RSS 扫描捕获并触发新一轮 wiki ingest，必须用 fork + PR 隔离避免。
- **Gateway 选择**: 微信对 cronjob 批量推送限流严重；Discord 移动端懒加载；飞书是当前最稳定通路但偶发 session 合并。
- **Prompt 不可复现**: skill 中的描述性 prompt 无法保证跨运行一致性，需配合显式文件结构与 schema。
- **写入 ≠ 落盘**: `memory` / `fact_store` / `patch` 等工具返回 success 不等于磁盘落盘；必须用 read_file / cat / grep / stat 二次验证。曾因此误报：patch 工具对 SQLite 二进制 `~/.hermes/memory_store.db` 报错时显示 0x13 字节乱码，实际写入位置是 `~/.hermes/memories/MEMORY.md`（与 fact_store 是两套机制）。
- **冲突指令**: 用户指令与已有规则矛盾时不可自作主张，必须先指出冲突 → 等用户明确 (a) 覆盖旧规则 / (b) 遵循既有规则 → 再执行。
- **commit-graph divergence（2026-06-05 测得）**: fork master 与 upstream master 即使文件 SHA 同步也可能 commit-graph 落后（如 fork 缺 14 个 upstream commit），导致基于 fork 创建的 PR 出现"假 added +N/-0"（PR 算法把 base 已有但 head 是新 commit 创建的文件标为 added）。修复：先 force-update fork master 到 upstream HEAD（`gh api .../git/refs/heads/master --method PATCH --field sha=$UP_SHA --field force=true`）；警告：force-update 会让基于 fork master 旧 ref 的 open PR 被 GitHub 自动关闭，**先同步再开 PR**。
- **Brotli 流截断 bug（sp_for_LLM/005 新增）**: `brotlicffi==1.2.0.1` + `httpx==0.28.1` + 启用 brotli 压缩的 API Provider（如 MiniMax）在大型 SSE 流式响应（>500KB 压缩后）下必抛 `decoder process called with data when 'can_accept_more_data() is False`。Hermes 已知此 bug 并在 `skills_hub.py:1410-1415` 对 sitemap HTTP 请求规避（`Accept-Encoding: gzip`），但**未应用到 Provider API 调用**。短期解决：切换到不启用 brotli 的 Provider（DeepSeek 返回 identity 编码）；长期修复：在 Provider 配置层统一禁用 brotli。
- **模型切换的副作用（sp_for_LLM/005 新增）**: 不同 LLM 对同一任务的表现差异巨大（延迟 5-10x、Cache 命中率、brotli 触发概率）。切换前必须验证 (a) 任务类型匹配 (b) 输出质量相当 (c) 错误模式不会引入新问题。本次切换顺手消除了 brotli bug 是巧合（DeepSeek 不用 brotli），不应推广为"换模型就能修 bug"的通用解法。