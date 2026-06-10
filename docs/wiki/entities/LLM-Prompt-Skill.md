---
title: LLM Prompt & Skill
description: "可供大语言模型使用的 prompt 模板与 skill 工作流"
type: entity
tags: [LLM, Prompt Engineering, Kimi, VuePress, AI Agent]
related:
  - docs/wiki/concepts/VuePress-Theme-Hope-Markdown-Converter.md
  - docs/wiki/concepts/VuePress-Theme-Hermes-JSON-Converter.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/wiki/concepts/Heat-Transfer-Literature-Report.md
  - docs/wiki/concepts/Reverse-Prompt-Engineering.md
  - docs/wiki/concepts/Hermes-Agent-Cronjob-Setup.md
  - docs/wiki/concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md
  - docs/wiki/entities/Hermes-Agent.md
created: 2026-06-04
updated: 2026-06-09
sources:
  - docs/postMortem/sp_for_LLM/000_prompt-VuePress-Theme-Hope-Markdown-Converter.md
  - docs/postMortem/sp_for_LLM/000X_prompt-VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/postMortem/sp_for_LLM/000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/postMortem/sp_for_LLM/001_QA-intermediate-heat-transfer-literature-report.md
  - docs/postMortem/sp_for_LLM/002_QA-inverse-prompt-engineering-report.md
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
  - docs/postMortem/sp_for_LLM/004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
---

# LLM Prompt & Skill

## 概述

本实体汇总与 LLM（Kimi、ChatGPT、GPT-4o、Claude 等）协作生成的工作流、Prompt 模板与 skill 方法论。核心场景是将 LLM 多轮对话的 `.docx` / `.json` 记录转换为 VuePress 博客兼容的 Markdown 格式，并生成可直接复用的 META Prompt / 反向提示词工程编译产物。

## 主要工作流

### VuePress Markdown 转换工作流（.docx → .md）

将 LLM 对话导出的 `.docx` 文件，通过 Kimi K2.6 生成的 META Prompt，转换为 VuePress Theme Hope v2.0.0-rc.107 兼容的 Markdown。

相关文档：
- [[../concepts/VuePress-Theme-Hope-Markdown-Converter.md]] — META Prompt 模板说明（.docx 输入）
- [[../sources/PostMortem.md]] — sp_for_LLM 目录知识域摘要

### Hermes JSON 转换工作流（.json → .md，单文件，sp_for_LLM/000X）

将 Hermes Agent 通过 `hermes sessions export --session-id xxx /home/ubuntu/output.json` 导出的会话 JSON，转换为 VuePress 兼容 Markdown。与 .docx 转换器形成姊妹方案，专门处理 Hermes 导出格式（`tool_calls` 数组、`tool` 消息、`reasoning_content` 字段、用户名前缀剥离、`::: details` 折叠等）。

相关文档：
- [[../concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md]] — META Prompt 模板说明（Hermes JSON 输入）

### Hermes 多会话融合工作流（.json 多文件 → 单一报告，sp_for_LLM/000Y 新增）

将**多个** Hermes Agent 导出的会话 JSON（`output_0.json`、`output_1.json` 等）通过 Kimi K2.6 生成的 META Prompt，融合为**按主题/阶段重新组织**的单一连贯报告（而非逐 Round 保留原始 Q&A）。适用于跨会话、跨模型、多方向处理的复合任务。

典型用例：先用模型 A（如 MiniMax-M3）定位问题，再用模型 B（如 deepseek-v4-flash）验证修复，将两份 session export 融合为一份故障排查报告。

相关文档：
- [[../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md]] — META Prompt 模板说明（多会话融合）

### 文献报告写作工作流

基于课程 *Intermediate Heat and Mass Transfer* 的 Literature Report 写作框架，通过 7 轮递进式提问引导，建立"宏观 CFD 优化 → 微观声子 BTE → 跨尺度批判"的叙事结构。

相关文档：
- [[../concepts/Heat-Transfer-Literature-Report.md]] — 批判框架概念页
- [[../entities/Phonon-Hydrodynamics.md]] — 声子流体动力学实体（关联）

### 反向提示词工程与 Prompt 编译管道（sp_for_LLM/002）

针对参考图片（手绘技术架构图等）反推生成可喂给 DALL-E 3 / Midjourney 的图像 Prompt，再通过**三 Session 编译管道**（风格模板提取 → 内容编译 → Prompt 优化）输出最终渲染 Prompt。

核心特征：风格/结构/内容三层解耦；META Prompt + justified_prompt + final_render_prompt 三阶段产物；MVC 视角（META = View，文献 = Model，justified_prompt = Controller）。

相关文档：
- [[../concepts/Reverse-Prompt-Engineering.md]] — 四阶段方法论 + 三 Session 管道详细说明

### Hermes Agent 部署与 RSS 每日简报 cronjob（sp_for_LLM/003）

在腾讯云入门型 VPS（2 CPU / 2 GB RAM / Ubuntu 24.04 LTS）上部署 Hermes Agent，配置每日 7:00 cronjob，通过 FOLO + Agent-Reach 聚合 RSS / GitHub / 微博 / arXiv 信源并推送到多 gateway 互备通道。包含模型选型（MiniMax-M3 主，kimi-k2.6 / Deepseek-V4-flash fallback）、gateway 多路互备方案、衔尾蛇问题规避等。

相关文档：
- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — 完整部署流程与陷阱清单
- [[../entities/Hermes-Agent.md]] — Hermes Agent 实体聚合页

### LangChain Interpreter Skills vs Hermes Skills 调研（sp_for_LLM/004）

通过 Hermes Agent 多轮对话调研 LangChain 实验性功能 *Interpreter Skills* 与 Hermes 自有 Skills 体系的异同。对话共 131 条消息、66 次工具调用，涉及 Skills 加载/执行机制源码分析、Programmatic Tool 机能对比、Memory 管理（built-in vs Holographic）三层架构、disk-level 验证纪律与冲突指令处理规范。

相关文档：
- [[../entities/Hermes-Agent.md]] — Hermes Skills 体系分析与 Memory 三层架构（workflow section）

### AI Daily Briefing Cron Job 故障排查与模型切换（sp_for_LLM/005 新增）

使用多会话融合 META Prompt（000Y）将 2 个会话（MiniMax-M3 调查 + deepseek-v4-flash 修复验证）融合为单一 Brotli 流截断故障报告。故障根因：`brotlicffi==1.2.0.1` + `httpx==0.28.1` + MiniMax API 启 brotli 压缩的 5 层叠加兼容性 bug。**修复方案**：切换执行模型至 deepseek-v4-flash（返回 identity 编码，绕过 brotli 路径），简报从空 placeholder 变为完整 ~64KB 输出，延迟从 15-47s/次降至 2.7-5s/次。

相关文档：
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — 完整故障排查、根因分析、修复方案
- [[../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md]] — 用于生成此报告的 META Prompt

## 核心工具

- **LLM 模型**: Kimi K2.6、GPT-4o、Claude 3.5 Sonnet、MiniMax-M3（Hermes Agent 主，2026-06-05 起 brotli bug 频发）/ deepseek-v4-flash（2026-06-09 起替代 MiniMax-M3 用于 Cron Job）
- **AI Agent 框架**: Hermes Agent (Nous Research)
- **信息聚合工具**: Agent-Reach (Panniantong/Agent-Reach，17 平台)
- **博客框架**: VuePress Theme Hope v2.0.0-rc.107
- **数学渲染**: KaTeX 0.16.47
- **图像生成（002 新增）**: DALL-E 3、Midjourney v6、Stable Diffusion / FLUX
- **部署方式**: GitHub Actions → GitHub Pages
- **目录规范**: `docs/postMortem/sp_for_LLM/` 存放 skill/prompt 文档
- **会话导出**: `hermes sessions export --session-id xxx /home/ubuntu/output_{n}.json` → `.json` → META Prompt（单文件 000X / 多会话融合 000Y）→ Markdown
- **故障排查方法（005 新增）**: 错误信息解包（Hermes 包装后的 `Response remained truncated` 实际是 brotli decode 失败）→ 日志逐层排查（`agent.log` grep 关键字）→ 手动复现 100% 验证 → 源码级定位（brotlicffi / httpx / openai SDK）→ 网络相似案例检索（urllib3 issue #3734）→ 模型切换作为临时规避 + 长期代码层修复