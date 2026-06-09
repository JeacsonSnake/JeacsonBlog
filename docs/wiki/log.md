---
title: Wiki Log
---

## [2026-04-17] init | 初始化 Wiki 层
## [2026-04-17] ingest | docs/learningNote/JSNote/ — JavaScript 核心笔记
## [2026-04-17] ingest | docs/learningNote/Ros2_Note/ — ROS2 通信机制与工具
## [2026-04-17] ingest | docs/learningNote/Computer_Network/ — 计算机网络
## [2026-04-17] ingest | docs/learningNote/vueNote/ — Vue 框架
## [2026-04-17] ingest | docs/learningNote/TypeScriptNote/ — TypeScript
## [2026-04-17] ingest | docs/learningNote/coding_skill/ — 编码技术
## [2026-04-17] ingest | docs/learningNote/Principles_of_Computer_Composition/ — 计算机组成原理
## [2026-04-17] ingest | docs/learningNote/Principles_of_Automatic_Control_Related/ — 自动控制原理
## [2026-04-20] ingest | JeacsonBlog RSS 新文章推送（50篇 /learningNote/）
- Sources updated: Computer_Network, ROS2, Coding_Skill, PostMortem (lastUpdated → 2026-04-20)
- Articles: ROS2(coor_trans 10篇/launch_rosbag2 5篇/co_me_2 9篇/co_me 19篇), Computer_Network(4篇), Coding_Skill(1篇)
- Wiki pages: 已存在，跳过（2026-04-17 已完成）
## [2026-06-04] ingest | docs/postMortem/sp_for_LLM/ — LLM Prompt & Skill 新文章（3篇）
- Sources updated: PostMortem (lastUpdated → 2026-06-04)
- Articles:
  - `README.md` — 目录索引（LLM 可用 skill/prompt 概述）
  - `000_prompt-VuePress-Theme-Hope-Markdown-Converter.md` — Kimi K2.6 META Prompt 模板
  - `001_QA-intermediate-heat-transfer-literature-report.md` — 热质传递文献报告 7 轮对话记录
- Wiki pages created:
  - `concepts/VuePress-Theme-Hope-Markdown-Converter.md` — VuePress Markdown 转换器概念
  - `concepts/Heat-Transfer-Literature-Report.md` — 热质传递文献报告批判框架
  - `entities/LLM-Prompt-Skill.md` — LLM Prompt & Skill 实体
  - `entities/Phonon-Hydrodynamics.md` — 声子流体动力学实体
- Entities added to wiki/index.md: LLM-Prompt-Skill, Phonon-Hydrodynamics
## [2026-06-05] ingest | docs/postMortem/sp_for_LLM/002 — 反向提示词工程与 Prompt 编译管道
- Source article: `002_QA-inverse-prompt-engineering-report.md`（709 行，4 轮 Kimi 对话）
- Wiki pages updated:
  - **CREATE** `concepts/Reverse-Prompt-Engineering.md` — 四阶段方法论 + 三 Session 编译管道 + MVC 视角 + 关键陷阱 + 工具链
  - **MODIFY** `entities/LLM-Prompt-Skill.md` — frontmatter `related:` 加新链接；追加「工作流 3：反向提示词工程」摘要（1 段 + 1 wikilink，不复制概念内容）；核心工具表加 DALL-E 3 / Midjourney v6 / FLUX
  - **MODIFY** `sources/PostMortem.md` — `lastUpdated` → 2026-06-05；LLM Prompt & Skill 节加 002 mention
  - **MODIFY** `index.md` — Concepts/LLM Prompt & Skill 小节加 `Reverse-Prompt-Engineering` 链接
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ Pre-flight sync：upstream + fork wiki 树列举；目标文件 2 个判断为 CREATE/MODIFY，nav 文件 3 个判断为 SYNC（需 MODIFY）
  - ✅ entities vs concepts 分工：002 方法论 → concepts（新页）；实体页只加摘要 + wikilink，不复制
  - ✅ PUT 使用 fork 当前 SHA 而非 upstream SHA，避免 409
  - ✅ 仅写入真修改的 5 个文件，不重写 SHA 一致的 no-op 文件
  - ✅ PR 完成后跑 `verify-pr-noops.sh` 自检

## [2026-06-08] ingest | docs/postMortem/sp_for_LLM/003 — Hermes Agent 初步食用记录
- Source article: `003_think-Initial-notes-on-using-Hermes_Agent.md`（172 行，20012 bytes，2026-06-07）
- Topic: Hermes Agent 在腾讯云入门型 VPS 上的部署经验 + RSS/Agent-Reach 每日简报 cronjob 配置 + 多 gateway 互备方案
- Pre-flight sync:
  - ✅ Step 0: Fork master 落后 upstream 14 commits → PATCH force=true 同步至 upstream HEAD `1d727fb494...`
  - ✅ Post-sync: `compare {up}...{up}` 状态 `identical, total_commits: 0`
- Wiki pages created/updated:
  - **CREATE** `entities/Hermes-Agent.md` — Hermes Agent 实体聚合页（包含 VPS 部署 cronjob 工作流、LLM Wiki 维护工作流、核心配置、关键陷阱三节）
  - **CREATE** `concepts/Hermes-Agent-Cronjob-Setup.md` — 完整部署方法论 + gateway 多路互备 + 衔尾蛇陷阱清单（related → entities/Hermes-Agent.md）
  - **MODIFY** `entities/LLM-Prompt-Skill.md` — 加 `### Hermes Agent 部署与 RSS 每日简报 cronjob` 摘要段 + 2 wikilink；frontmatter 加 `Hermes-Agent-Cronjob-Setup` 和 `Hermes-Agent` related；核心工具表加 MiniMax-M3 / Hermes Agent / Agent-Reach
  - **MODIFY** `sources/PostMortem.md` — `lastUpdated` → 2026-06-08；tags 加 `AI Agent`；LLM Prompt & Skill 节加 003 mention；关联加 Hermes-Agent 实体 + Cronjob 概念
  - **MODIFY** `index.md` — Entities 节加 Hermes-Agent；Concepts 节加 LLM Prompt & Skill 与 AI Agent 两个子节都列出 Hermes-Agent-Cronjob-Setup；header 加 `Last updated: 2026-06-08`
  - **MODIFY** `log.md` — 本条目
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ entities vs concepts 分工：Hermes Agent 本身 → entities（thing）；部署流程 + gateway 互备方法论 → concepts（method）
  - ✅ 实体页只引用概念页（不复制内容）
  - ✅ 概念页通过 `related:` back-link 到实体页
  - ✅ YAML description 字段全部加引号（含中文冒号）
  - ✅ PUT 使用 fork 当前 SHA（force-sync 后 fork SHA = upstream SHA）
  - ✅ 仅写入真修改的 6 个文件，不重写 no-op 文件
  - ✅ PR 完成后跑 `verify-pr-noops.sh` 自检

## [2026-06-09] ingest | docs/postMortem/sp_for_LLM/000X + 004 — Hermes JSON Converter & LangChain Interpreter Skills 调研
- Source articles:
  - `000X_prompt-VuePress-Theme-Hope-Hermes-JSON-Converter.md`（282 行，2026-06-08）— Kimi 生成的 META Prompt，用于将 Hermes `sessions export` 导出的 `.json` 转换为 VuePress Markdown
  - `004_Hermes-report.md`（1646 行，2026-06-08）— Hermes Agent 多轮对话调研 LangChain Interpreter Skills vs Hermes Skills，含 Skills 加载机制代码分析、Memory 三层架构、disk-level 验证纪律与冲突指令处理规范
- Pre-flight sync:
  - ✅ Step 0: Fork master 落后 upstream 2 commits → PATCH force=true 同步至 upstream HEAD `996f09b388...`
  - ✅ Post-sync: `compare {up}...{up}` 状态 `identical, total_commits: 0`
- Wiki pages created/updated:
  - **CREATE** `concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md` — Kimi META Prompt 完整说明（Hermes JSON 输入，含 `tool_calls` 折叠、`reasoning_content` 丢弃、用户名前缀剥离；与 .docx 转换器对比表）；related → entities/Hermes-Agent.md, entities/LLM-Prompt-Skill.md, concepts/VuePress-Theme-Hope-Markdown-Converter.md, source postMortem/000X
  - **MODIFY** `entities/LLM-Prompt-Skill.md` — frontmatter 加 `VuePress-Theme-Hope-Hermes-JSON-Converter` related；sources 加 000X/004；主工作流加"Hermes JSON 转换工作流"摘要段（1 段 + 1 wikilink）+ "LangChain Interpreter Skills vs Hermes Skills 调研"摘要段（1 段 + 1 wikilink）；核心工具表加 `hermes sessions export` 命令
  - **MODIFY** `entities/Hermes-Agent.md` — frontmatter 加 `VuePress-Theme-Hope-Hermes-JSON-Converter` related；sources 加 004；主工作流加"Skills 体系分析与 LangChain Interpreter Skills 对比"段（含 131 条消息 / 66 次工具调用、Memory 三层架构、Programmatic Tool 机能对比、冲突指令处理）+ "会话 JSON 导出与 VuePress Markdown 转换"段；核心配置加 Skills 模式说明；关键陷阱加"写入 ≠ 落盘"+"冲突指令"+"commit-graph divergence"三条
  - **MODIFY** `sources/PostMortem.md` — `lastUpdated` → 2026-06-09；sources 加 000X/004；LLM Prompt & Skill 节加 000X/004 mention；关联加 Hermes-JSON-Converter 概念
  - **MODIFY** `index.md` — Concepts/LLM Prompt & Skill 小节加 `VuePress-Theme-Hope-Hermes-JSON-Converter` 链接；header 加 `Last updated: 2026-06-09`
  - **MODIFY** `log.md` — 本条目
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ Step 0 已完成（fork master force-sync）
  - ✅ entities vs concepts 分工：000X META Prompt 方法论 → concepts（新页）；004 调研 → entity 工作流段（不复制到 concept，避免重复）
  - ✅ 实体页只引用概念页（不复制内容）
  - ✅ YAML description 字段全部加引号（含中文冒号）
  - ✅ 6 个目标文件均通过 fork SHA-first PUT 写入