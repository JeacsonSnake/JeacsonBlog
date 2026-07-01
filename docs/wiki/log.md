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

## [2026-06-09] ingest | docs/postMortem/sp_for_LLM/000Y + 004 + 005 — Hermes Multi-Session Merger & Brotli 流截断故障排查
- Source articles:
  - `000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md`（345 行，15229 bytes，2026-06-09）— Kimi K2.6 生成的 META Prompt，用于将**多个** Hermes Agent 导出的会话 JSON（`output_0.json`、`output_1.json` ...）融合为单一按主题/阶段组织的连贯报告。与 000X 单文件 converter 形成姊妹方案
  - `004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md`（1647 行，204542 bytes，2026-06-08，原文件已从 `004_Hermes-report.md` 重命名）— Hermes Agent 多轮对话调研 LangChain Interpreter Skills 与 Hermes Skills 体系对比
  - `005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md`（466 行，21897 bytes，2026-06-09）— AI Daily Briefing Cron Job 从 2026-06-05 起连续失败的多会话融合排查报告（MiniMax-M3 调查 + deepseek-v4-flash 修复验证 + 根因源码分析）
- Pre-flight sync:
  - ✅ Step 0: Fork master 落后 upstream 6 commits / ahead 5 commits (diverged, total_commits=6) → PATCH force=true 同步至 upstream HEAD `8756be958e...`
  - ✅ Post-sync: `compare {up}...{up}` 状态 `identical, total_commits: 0`
- Wiki pages created/updated (9 files total):
  - **CREATE** `concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md` — Kimi META Prompt 多会话融合完整说明（含与 000X 单文件 converter 对比表、Merged Meta Info Block 模板、按主题/阶段重新组织的内容融合规则）；related → entities/Hermes-Agent.md, entities/LLM-Prompt-Skill.md, concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md, concepts/VuePress-Theme-Hope-Markdown-Converter.md, source postMortem/000Y
  - **CREATE** `concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md` — 完整故障排查方法论（5 层技术栈叠加 bug 根因：`brotlicffi==1.2.0.1` + `httpx==0.28.1` + MiniMax API 启 brotli）、修复对比（MiniMax-M3 vs deepseek-v4-flash：延迟 5-10x 提升、Brotli 错误 3 次→0 次、简报从空 placeholder→完整 ~64KB）、后续建议（Hermes Provider 层统一禁用 brotli / 跟踪上游修复 / Provider 选择参考）；related → entities/Hermes-Agent.md, concepts/Hermes-Agent-Cronjob-Setup.md, concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - **MODIFY** `entities/Hermes-Agent.md` — frontmatter 加 `VuePress-Theme-Hope-Hermes-Multi-Session-Merger` + `AI-Daily-Briefing-Brotli-Fix-Investigation` related；sources 路径 `004_Hermes-report.md` → `004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md`（原文件已重命名）+ 加 000Y/005；主工作流加"AI Daily Briefing Cron Job 故障排查与模型切换"段；核心配置加 2026-06-09 deepseek-v4-flash 切换注释；关键陷阱加"Brotli 流截断 bug"+"模型切换副作用"两条
  - **MODIFY** `entities/LLM-Prompt-Skill.md` — frontmatter 加 `VuePress-Theme-Hope-Hermes-Multi-Session-Merger` + `AI-Daily-Briefing-Brotli-Fix-Investigation` related；sources 加 000Y/005（004 路径同步重命名）；主工作流加"Hermes 多会话融合工作流（sp_for_LLM/000Y）"段（含 000X vs 000Y 决策树）+ "AI Daily Briefing Cron Job 故障排查与模型切换（sp_for_LLM/005）"段；核心工具表加 deepseek-v4-flash + 故障排查方法条目
  - **MODIFY** `concepts/Hermes-Agent-Cronjob-Setup.md` — frontmatter 加 `AI-Daily-Briefing-Brotli-Fix-Investigation` related；sources 加 005；`updated` → 2026-06-09；模型选型段加 2026-06-09 切换注释；关键陷阱加"Brotli 流截断 bug"小节
  - **MODIFY** `concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md` — frontmatter 加 `VuePress-Theme-Hope-Hermes-Multi-Session-Merger` related；概述加 000Y 多会话融合姊妹方案引用；新增"与多会话融合 Merger 的关系"对比表 + 决策树
  - **MODIFY** `sources/PostMortem.md` — sources 加 000Y/005（004 路径同步重命名）；`lastUpdated` → 2026-06-09；LLM Prompt & Skill 节加 000Y mention + 005 mention；关联加 Multi-Session-Merger + Brotli-Fix 概念
  - **MODIFY** `index.md` — Concepts/LLM Prompt & Skill 小节加 `VuePress-Theme-Hope-Hermes-Multi-Session-Merger` + `AI-Daily-Briefing-Brotli-Fix-Investigation` 链接；Concepts/AI Agent 小节加 Brotli-Fix 链接；header `Last updated: 2026-06-09`
  - **MODIFY** `log.md` — 本条目
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ Step 0 已完成（fork master force-sync from diverged to identical）
  - ✅ entities vs concepts 分工：000Y META Prompt 方法论 → concepts（新页）；005 故障排查方法论 → concepts（新页）；实体页只加工作流段摘要 + wikilink，不复制概念页内容
  - ✅ 实体页只引用概念页（不复制内容）；概念页通过 `related:` back-link 到实体页
  - ✅ YAML description 字段全部加引号（含中文冒号 / 中文括号）
  - ✅ 9 个目标文件均通过 fork SHA-first PUT 写入（2 CREATE 不带 sha 字段；7 MODIFY 用 fork SHA）
  - ✅ 路径变更：004_Hermes-report.md → 004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md（上游已重命名，wiki 引用同步更新）
- Self-check（待 PR 创建后跑 `verify-pr-noops.sh`）：
  - 待验证：所有 wiki 文件 PR_SHA 与 UP_SHA 对比，确保无 no-op 误标 added


## [2026-07-01] ingest | docs/postMortem/ — LeanCloud→Neon 迁移 + Edge DNS gotcha（2 篇新文章）
- Source articles:
  - `docs/postMortem/deploy/005_leancloud_migrate_neon_relate.md`（5888 bytes，2026-06-29 发布）— LeanCloud 2027 年停止服务后的 Waline 评论数据 4 步迁移：导出 JSONL → Vercel Neon 建表 → waline-data-import-tool 上传 → Redeploy；含 LeanCloud Date 字段格式转换 Python 脚本
  - `docs/postMortem/sp_for_LLM/2026_06_29.md`（1463 bytes，2026-06-23 发布）— Edge「使用安全的 DNS」选 Cloudflare DoH 后污染 curl DNS 缓存；TCP 三次握手成功但 ClientHello 后 RST；nslookup 与 curl 返回不同 IP 的诡异断网
- Pre-flight sync:
  - ✅ Step 0: Fork master 状态 `ahead:19, behind:0, total_commits:19`（commit-graph diverged）→ PATCH force=true 同步至 upstream HEAD `a8d948071b0debc6460dd4b56d6b7be5c91dc5a2`
  - ✅ Post-sync: fork master SHA = upstream HEAD（已对齐）
- Wiki pages created/updated (5 files total):
  - **CREATE** `concepts/LeanCloud-to-Neon-Migration.md` — Waline 数据迁移完整方法论（4 步顺序不可颠倒、LeanCloud Date 字段递归处理、waline.pgsql 建表、waline-data-import-tool 验证清单）；related → sources/PostMortem.md
  - **CREATE** `concepts/Edge-Secure-DNS-Gotcha.md` — Edge DoH 副作用与排查（DoH → curl 缓存污染机制、nslookup vs curl IP 不一致、跨网络环境触发条件、修复步骤）；related → sources/PostMortem.md
  - **MODIFY** `sources/PostMortem.md` — `lastUpdated` → 2026-07-01；tags 加 `DNS, Migrate, Network`；sources 加 2 篇新文章；部署节加迁移 mention；sp_for_LLM 节加 Edge DNS gotcha mention；关联加 2 个新概念链接
  - **MODIFY** `index.md` — header `Last updated: 2026-07-01`；Concepts 加新「DevOps / 部署」小节列 2 个新概念
  - **MODIFY** `log.md` — 本条目
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ Step 0 已完成（fork master force-sync from diverged to identical）
  - ✅ entities vs concepts 分工：两篇均为方法/现象/方法论 → concepts（新建）；无新 entity（无新 thing/product/library）
  - ✅ 概念页通过 `related:` back-link 到 sources/PostMortem.md（无对应 entity 实体页）
  - ✅ YAML description 字段全部加引号（含中文冒号 / 中文括号 / 英文冒号）
  - ✅ 5 个目标文件均通过 fork SHA-first PUT 写入（2 CREATE 不带 sha 字段；3 MODIFY 用 fork SHA）
- Self-check（待 PR 创建后跑 `verify-pr-noops.sh`）：待验证所有 wiki 文件 PR_SHA 与 UP_SHA 对比
