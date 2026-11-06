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


## [2026-07-21] ingest | docs/postMortem/deploy/006_Ubuntu_gdm3_cannot_activate.md
- Source article:
  - `docs/postMortem/deploy/006_Ubuntu_gdm3_cannot_activate.md`（2026-07-20 发布）— Ubuntu 24.04 VMware 虚拟机某次重启后卡在 tty1，gdm3 无法启动的根因排查与修复：磁盘空间耗尽（≥95%）导致 APT 缓存写不进 → gdm3 服务启动失败 → systemd 自动降级为 multi-user.target；包含 8 步紧急清理 + 7 步 VMware 虚拟硬盘扩容完整流程
- Architecture (post 2026-07-13):
  - ✅ 直接 push 到上游 `JeacsonSnake/JeacsonBlog` 的 `wiki-ingest-2026-07-21` 分支（不再使用 ZectaHurbo fork）
  - ✅ SSH Deploy Key 认证（PAT 架构已废弃）
  - ✅ 上游 `.github/workflows/docs.yml` 已修复 fact_id=58：`on.push.branches` 现包含 `master` + `wiki-ingest-*`，本次 push 会自动触发 `Create_Wiki_Ingest_Pr` job 开 PR
- Pre-flight sync:
  - ✅ Mirror fetch：upstream master `eabe0345` → `df607590`（SHA 变了但 37 个 wiki 文件全部 unchanged）
  - ✅ Pull master：`df607590 docs: 更新：Ubuntu 24.04 在某次重启后...` —— 新博客文章 `006_Ubuntu_gdm3_cannot_activate.md` 已是 master HEAD commit
- Wiki pages created/updated (4 files total):
  - **CREATE** `concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md` — 完整故障排查方法论（核心结论"gdm3 启动失败先 df -h" + 3 层根因链路 APT/服务/系统 + 8 步紧急清理 + 7 步 VMware 扩容 + 6 步排查清单）；related → sources/PostMortem.md
  - **MODIFY** `sources/PostMortem.md` — `lastUpdated` → 2026-07-21；tags 加 `Ubuntu, Disk, Troubleshooting`；sources 加 `deploy/006_Ubuntu_gdm3_cannot_activate.md`；部署节加 gdm3 故障排查 mention；关联加新概念链接
  - **MODIFY** `index.md` — header `Last updated: 2026-07-21`；Concepts/DevOps 小节加 `Ubuntu-gdm3-Disk-Full-Troubleshooting` 链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循（per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"）：
  - ✅ entities vs concepts 分工：单篇方法/现象/方法论 → concepts（新建）；无新 entity（无新 thing/product/library，Ubuntu 是 OS 而非"新增实体"）
  - ✅ 概念页通过 `related:` back-link 到 sources/PostMortem.md（无对应 entity 实体页）
  - ✅ YAML description 字段全部加引号（含中文破折号" — "、英文连字符 "gdm3"、特殊符号"≥95%"）
  - ✅ 4 个目标文件通过 git push 到 `wiki-ingest-2026-07-21` 分支，由 GitHub Actions `Create_Wiki_Ingest_Pr` 自动开 PR（无需手动）
- Self-check: 待 PR 创建后跑 `scripts/verify-pr-noops.sh` 验证所有 wiki 文件 PR_SHA 与 UP_SHA 对比


## [2026-07-27] ingest | wiki-lint B-1 — fix 3 broken wikilinks
- Source: not a blog post — this is a **wiki self-heal** triggered by `wiki-lint.sh` lint run (commit `wiki-lint.sh` + 12-step analysis, 2026-07-27).
- Trigger: `wiki-lint.sh` first run on 2026-07-27 surfaced 3 critical broken-wikilink issues:
  - `concepts/话题通信.md:46` → `[[../concepts/服务通信.md]]` (page missing)
  - `concepts/话题通信.md:47` → `[[../concepts/动作通信.md]]` (page missing)
  - `sources/Coding_Skill.md:27` → `[[../concepts/代码片段.md]]` (page missing)
- Architecture (post 2026-07-13):
  - ✅ SSH Deploy Key authentication (ZectaHurbo fork + PAT 已废弃, per fact_id=57)
  - ✅ Force-push to existing wiki-ingest-* branch bug **discovered and fixed** (fact_id=67): `Warn if push contains multiple commits` step in `.github/workflows/docs.yml` previously failed on `before: None` / invalid range. Fixed in `d0d38cc5` (master HEAD on 2026-07-27) with `git cat-file -e` detection + HEAD-count fallback + `::warning::` annotation
  - ✅ 这次 push 用**新分支** `wiki-ingest-2026-07-27-fix-broken-links-v2`（首次 push, BEFORE=0000...0, 走版本 C 的 if 分支），避免 force-push 路径
- Pre-flight sync:
  - ✅ Mirror fetch：upstream master `40a4188e` (PR #16 merged) → `d0d38cc5` (workflow 修复)
  - ✅ 新分支基于 `d0d38cc5` 创建，commit parent 链可被 Action 调度
- Wiki pages created/updated (5 files total):
  - **CREATE** `concepts/服务通信.md` — ROS2 Service 通信方法论 (52 行); related → 话题通信, 动作通信, entities/ROS2
  - **CREATE** `concepts/动作通信.md` — ROS2 Action 通信方法论 (50 行); related → 话题通信, 服务通信, entities/ROS2
  - **CREATE** `concepts/代码片段.md` — VSCode Snippet 配置 (73 行, 含 ROS2 C++ Publisher 示例); related → sources/Coding_Skill, entities/ROS2
  - **MODIFY** `index.md` — header `Last updated` → 2026-07-27; `### ROS2` 段加 2 行; 新增 `### Coding Skill` 段加 1 行
  - **MODIFY** `log.md` — 本条目
- 纪律遵循 (per `vuepress-wiki-integration` skill "Ingest — mandatory workflow"):
  - ✅ entities vs concepts 分工：3 个新页都是**方法/通信模式** (concept) 而非**实体/产品** (entity), 全部归 `concepts/`. ROS2/Snippet 这些是已有 entity 范畴, 没必要新建 entity 页
  - ✅ Concept 页通过 `related:` frontmatter back-link 到 entity 页 (服务通信/动作通信 → entities/ROS2.md; 代码片段 → entities/ROS2.md)
  - ✅ YAML `description:` 字段全部加引号 (含 Service/Action/Publisher 等英文术语)
  - ✅ 5 个目标文件通过 git push 到 `wiki-ingest-2026-07-27-fix-broken-links-v2` 分支, **首次 push 路径** (BEFORE=0000...0, 走版本 C 的 if 分支)
- 同期改动 (不属于 B-1 PR 但相关):
  - master `d0d38cc5` "Improve handling of force-push in docs workflow" — `.github/workflows/docs.yml` line 142-159 升级, 修复 force-push 时 `before: None` 失败. 由用户在 GitHub UI 手 edit + commit. workflow 文件 204 → 209 行
- Self-check: 待 Action 自动开 PR 后跑 `wiki-lint.sh` 验证 critical 从 3 → 0 (broken wikilinks 修好 + index.md 同步), 跑 `verify-pr-noops.sh` 验证 PR_SHA vs UP_SHA 一致


## [2026-09-08] ingest | Vue 项目 CSS fit-content 生产构建被错误优化
- Source article: `docs/postMortem/tiny_tips/2026_09_07.md`（2026-09-07 发布）— 博饼网站欢迎页按钮在 Edge(Chromium) 下 `height: fit-content` 样式失效；根因 = Vite 生产构建 cssnano 把 `fit-content` 与 `-moz-fit-content` 视为重复声明、去重后只保留后写的 `-moz-fit-content`；修复 = 标准语法置于 vendor prefix 之后（副作用：放弃 2021 前 Firefox）；`cssMinify: 'lightningcss'` 尝试无效
- Architecture: 2026-07-13 起 SSH Deploy Key + Actions 自动开 PR；本次为 **wiki-ingest.sh manifest 化（C-phase）首次实战**——脚本 5 处硬编码归零，改读 ~/.hermes/wiki/.ingest-manifest.json
- Wiki pages created/updated (5 files):
  - **CREATE** `concepts/Vue-CSS-Fit-Content-Vite-cssnano-Dedupe-Bug.md` — 独立方法论页（现象/根因/修复/无效方案/陷阱）；related → entities/Vue.md + sources/PostMortem.md
  - **MODIFY** `entities/Vue.md` — `lastUpdated` → 2026-09-08；新增「构建与踩坑」小节 + wikilink（不抄正文）
  - **MODIFY** `sources/PostMortem.md` — sources 加 `tiny_tips/2026_09_07.md`；tags 加 CSS, Vite；`lastUpdated` → 2026-09-08；新增 tiny_tips 小节 + 关联链接
  - **MODIFY** `index.md` — header `Last updated` → 2026-09-08；DevOps/部署 小节加概念页链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循: entities vs concepts 分工（单篇方法/方法论 → concepts；无新 entity，Vue 已有 entity 页）；entity 页只加 1-3 行引用不抄正文；YAML description 加引号；index/log 同 commit
- Self-check: 待 Action 自动开 PR 后跑 `verify-wiki-pr-tree.py audit <N>` 验证树结构与 PR body 一致


## [2026-09-09] ingest | 补录 2 篇漏抓 postMortem：deploy/007 代理全挂（redo）+ tiny_tips/2026_09_08 WiFi 5GHz DFS
- Source articles:
  - `docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md`（2026-08-10 发布）— 腾讯云广州 mihomo 代理 12 节点全挂排查：走代理连 github/google 也超时 = 节点层故障；境外裸连节点可达 → 根因 = GSLB IP 池漂移 + 静态订阅 4 个月未更新；修复 = .env + file provider + 每周更新 cron + URLTest 自动选择组（gstatic 健康检查 300s）
  - `docs/postMortem/tiny_tips/2026_09_08.md`（2026-09-08 发布）— 5GHz 信道 100 属 DFS 频段，雷达避让机制不定时挂起客户端传输 → 社交平台图片加载慢（小请求敏感，视频有缓冲可掩盖）；Velop 不支持手动指定信道 → 关 DFS + Channel Finder 落回信道 161
- 补录背景（为什么这两篇之前没进 wiki）:
  - 007：2026-08-10 当天 ingest 撞 sparse-commit 事故（PR #19/#20 关闭、从未合并）；事后 blogwatcher read-all 已消费 unread 标记 → cron 永不自动重试（runbook「read-all 消费 unread 信号」pitfall）
  - 2026_09_08：发布于 09-08 12:45（晚于当日 06:35 cron）；09-09 cron 的 scan 已发现（db id 8400）但路径过滤误判为"无 postMortem 文章" → 手动补录
- Wiki pages created/updated (6 files, manifest 流程 wiki-ingest.sh):
  - **CREATE** `concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` — 复用 2026-08-10 事故当天已写好的草稿（248 行，与原文逐节对应），删除尾部「关键陷阱（写入 entities/Hermes-Agent.md）」注记节（该内容已并入本次 entity 更新）；created/updated 保持 2026-08-10
  - **CREATE** `concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md` — 现象/分层排查表/根因=DFS 雷达避让/解法=关 DFS + Channel Finder/经验；related → entities/Computer_Network + sources/PostMortem
  - **MODIFY** `entities/Hermes-Agent.md` — related + sources frontmatter 增 007 文；`updated` → 2026-09-09；主要工作流新增「mihomo 代理链路故障排查与订阅自动化」小节（3 行 + wikilink，不抄正文）；关键陷阱新增「mihomo 静态订阅 = 慢性死亡」1 条（指向概念页）
  - **MODIFY** `sources/PostMortem.md` — sources frontmatter 增 2 篇；部署段增 007 条目、tiny_tips 段增 09_08 条目；关联增 2 概念页链接；tags 增 Proxy/GSLB/WiFi/DFS；lastUpdated → 2026-09-09
  - **MODIFY** `index.md` — Last updated → 2026-09-09；DevOps/部署段增 2 条概念页链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循: entities/concepts 分工（单篇方法论 → concepts；无新 entity）；entity 页只加小节引用 + wikilink 不抄正文；YAML description 全部加引号；index/log/sources 与 create 同 commit
- Self-check: 待 Action 自动开 PR 后跑 `verify-wiki-pr-tree.py audit <N>` 验证树结构与 PR body 一致

## [2026-10-20] ingest | 006-AI 日报自动归档链路打通 —— merge-base 不变量、双重分支保护与 GitHub App bypass
- Source article: `docs/postMortem/sp_for_LLM/006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.md`（2026-10-19 发布）— 把「归档 job 推分支 → 人工 Squash & Merge」改造成 hop-1（归档分支 → PR 白名单预检 → 自动 squash 进 `daily`）+ hop-2（`workflow_dispatch` 三点 diff 守卫 → `git merge --no-ff` → push master）；三期踩中三类结构性问题：merge-base 不变量、master 双层分支保护、GitHub App ruleset bypass
- 触发：2026-10-20 scan 发现 JeacsonBlog 新增 `/postMortem/sp_for_LLM/006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.html`（db id 10324），步骤 6 机械 grep 命中共 1 篇
- Wiki pages created/updated (5 files, manifest 流程 wiki-ingest.sh):
  - **CREATE** `concepts/Briefing-Archive-Auto-Merge-Topology.md` — 拓扑设计（为什么 hop-2 必须 dispatch、--ref master、environment secret、App 不给 Workflows 权限）+ 核心不变量 merge-base/三点 diff + 三种「同步」方式对照 + GH013/GH006 双层保护与个人仓库 bypass 限制 + step 级验证纪律 + hop-2 失败速查表 + schedule best-effort 实测迟到 4~5h
  - **MODIFY** `entities/Hermes-Agent.md` — related/sources 增 006 文；`updated` → 2026-10-20；主要工作流新增「AI 简报自动归档链路」小节（2 句 + wikilink，不抄正文）；关键陷阱新增「merge-base 不会被内容同步移动」1 条（指向概念页）
  - **MODIFY** `sources/PostMortem.md` — sources 增 006；tags 增 GitHub Actions/Git/Branch Protection；`lastUpdated` → 2026-10-20；sp_for_LLM 段增 006 条目；关联增概念页链接
  - **MODIFY** `index.md` — header `Last updated` → 2026-10-20；`### AI Agent` 段增概念页链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循: entities/concepts 分工（单篇方法论 → concepts；无新 entity，Hermes-Agent 已有 entity 页）；entity 页只加小节引用 + wikilink 不抄正文；YAML description 加引号；index/log/sources 与 create 同 commit
- Self-check: wiki-ingest.sh 的 fail-fast 校验（manifest 合法 / source 存在 / master 全量树 / diff shape = +1 ~4 -0）通过后才 push

## [2026-11-02] ingest | 双屏 GIF 蓝黄斑纹排障记录
- Source article: `docs/postMortem/tiny_tips/2026_11_01.md`（2026-11-01 发布，category tiny_tips）— Windows 10 双屏（内屏 LG LP156WFG 1080p144 缩放 125% / 副屏 兰利浦 HC-L156A HDMI 1080p60 缩放 100%，RTX 2060）显示特定 GIF 出现蓝黄相间斑纹；截图亦带斑纹 → 异常在像素层；分层排除像素格式/带宽、HDR-WCG、NVIDIA 颜色覆盖、EDID 后定位到 per-monitor DPI 不一致（`Win8DpiScaling=0` + `DpiScalingVer=4096`）→ DWM 跨屏合成按不同比例重采样低色深位图，硬色度边缘产生过冲/振铃；统一两屏缩放即消失、还原即复现（A/B/A 三步闭环）
- 触发：2026-11-02 scan 发现 JeacsonBlog 新增 `/postMortem/tiny_tips/2026_11_01.html`（db id 10924），步骤 6 机械 grep 命中 1 篇
- Wiki pages created/updated (5 files, manifest 流程 wiki-ingest.sh):
  - **CREATE** `concepts/Per-Monitor-DPI-DWM-Resampling-Ringing.md` — 现象与关键判据（截图自带斑纹 = 排除物理层）+ 6 层分层排除表（含 `Win8DpiScaling` / `DpiScalingVer` 核对陷阱）+ 机理 + A/B/A 验证实验 + 处置与同类症状优先级
  - **MODIFY** `sources/PostMortem.md` — sources 增 2026_11_01；tags 增 Windows/Display/DPI；`updated` → 2026-11-02；tiny_tips 段增条目；关联增概念页链接
  - **MODIFY** `index.md` — header `Last updated` → 2026-11-02；DevOps/部署 段增概念页链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循: entities vs concepts 分工（单篇方法论 → concepts；**无对应 entity**——现有 entities 里没有 Windows/显示硬件实体，按 precedent（Ubuntu-gdm3 概念页）不硬造 entity，`related:` 只指向 sources/PostMortem.md，正文横向链接 2 个同域概念页）；YAML description 加引号；index/log/sources 与 create 同 commit
- Self-check: wiki-ingest.sh fail-fast 校验（manifest 合法 / source 存在 / master 全量树 / diff shape）通过后才 push

## [2026-11-05] ingest | Switch OLED 搜不到 5GHz WiFi 信道排障
- Source article: `docs/postMortem/tiny_tips/2026_11_04.md`（2026-11-04 发布，category tiny_tips）— Switch 全系（含 OLED）5GHz 网卡受区域固件白名单限制，仅支持 UNII-1 的 36/40/44/48；路由器（Linksys MBE7000）自动选频落到信道 153（80MHz 占 149–161）→ SSID 扫描阶段即不可见，主机静默回退 2.4GHz。实测排除 WPA2/WPA3 混合与 ax-only 因素；修复 = 本地 Web UI 的 CA 隐藏入口（页脚小字）把 5GHz 固定为 36，且**先关 Auto Channel Finder**（默认每 5 天覆盖手动设置）；附 Beacon 被动扫描取证、同 OUI 多 SSID 合并计干扰源、`RSSI ≈ 百分比/2 − 100` 换算、4 条踩坑与有线/2.4G 兜底
- 触发：2026-11-05 scan 发现 JeacsonBlog 新增 `/postMortem/tiny_tips/2026_11_04.html`（db id 11088），步骤 6 机械 grep 命中 1 篇
- Wiki pages created/updated (6 files, manifest 流程 wiki-ingest.sh):
  - **CREATE** `concepts/Switch-5GHz-Channel-Whitelist.md` — 现象指纹分诊表（搜不到 vs 搜到连不上 vs 搜到但卡）+ Switch 白名单表 + CA 隐藏入口与 Auto Channel Finder 前提 + 改前后实测对比 + Beacon/RSSI 取证原理 + 4 条踩坑 + 兜底方案
  - **MODIFY** `entities/Computer_Network.md` — tags 增 WiFi/Channel；`updated` → 2026-11-05；新增「无线链路排障（WiFi / 802.11）」小节（两条 1–2 行鉴别要点 + wikilink，不抄正文）
  - **MODIFY** `concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md` — related + 关联 增本文概念页（同域前作「搜得到但间歇卡」，与本文「完全搜不到」互为鉴别对照）
  - **MODIFY** `sources/PostMortem.md` — sources 增 2026_11_04；tags 增 Channel；`updated` → 2026-11-05；tiny_tips 段增条目；关联增概念页链接
  - **MODIFY** `index.md` — header `Last updated` → 2026-11-05；DevOps/部署 段增概念页链接
  - **MODIFY** `log.md` — 本条目
- 纪律遵循: entities vs concepts 分工（单篇排障方法论 → concepts；Computer_Network 已有 entity 页，只挂聚合引用不抄正文）；YAML description 加引号；index/log/sources 与 create 同 commit
- Self-check: wiki-ingest.sh fail-fast 校验（manifest 合法 / source 存在 / master 全量树 / diff shape = +1 ~5 -0）

## [2026-11-06] maintenance | wiki 链接语法统一为 Markdown（站点可点）
- 触发：用户审查发现 `[[./sources/JavaScript.md]] — 标签` 这类 wikilink 在部署站点上是纯文本（实测 `/wiki/concepts/Switch-5GHz-Channel-Whitelist.html` 里 3 处原样输出，无 `<a>`），而同行手写的 `[标签](X.md)` 被 VuePress 渲染为 `class="route-link" href="/wiki/concepts/X.html"`。该 wiki 不在 Obsidian vault 里（无 `.obsidian/`），`[[...]]` 拿不到 backlink/graph 收益，只剩不可渲染
- 变更：37 个页面共 199 处 `[[路径]] — 标签` / `[[路径|别名]]` → `[标签](路径)`；标签取破折号后的说明文字（145 处）、别名（1 处）或目标页 title（53 处）
- 4 处指向从未创建的页面，降级为纯文本而非留下 404 链接：`entities/JavaScript.md` → `concepts/defineProperty`、`entities/Vue.md` → `concepts/数据响应式`、`entities/ROS2.md` → `concepts/自定义消息接口`、`entities/Computer_Network.md` → `concepts/可靠数据传输`
- `log.md` 里作为历史记录、包在反引号内的 3 处 `[[...]]` 原文保留（属于当时的报错引用）
- 工具侧同步：`wiki-lint.sh` 的 orphan（#1）与断链（#2）检查改为 `link_targets()` 同时解析 `[[...]]` 与 `[标签](...)`，跳过图片/外链/锚点；`AGENTS.md` 模板同步改为此写法，防止下次 ingest 写回旧格式
- Self-check: 迁移前后 lint 对比 critical 0→0、orphan 6→6、partial frontmatter 24→24（未因换写法产生新的误报）；17 KB lint 脚本 `bash -n` 通过

## [2026-11-06] ingest | 补齐 4 个被文本化的概念页（阶段 A）
- 触发：2026-11-06 链接语法迁移时，4 处 `[[concepts/...]]` 指向的页面从未创建，被降级为纯文本；用户要求按原文重建，并确认这些主题的笔记在 repo 里都在（无草创期丢数据）
- Wiki pages created (4)：
  - **CREATE** `concepts/可靠数据传输.md` — rdt1.0→3.0 五版本「每加一种故障补一种机制」表 + 停等的滑动窗口解释 + GBN（累计确认/丢弃乱序/回退重传）vs SR（单独确认/缓存乱序/只重传出错包）对比 + 与 TCP 的对照；源 `Computer_Network/可靠数据的传输原理.md`
  - **CREATE** `concepts/defineProperty.md` — 属性描述符四项及默认全 false 的坑 + get/set 劫持最小样例 + Vue2 三个限制（嵌套属性/新增/删除，数组靠重写 7 方法）+ Proxy 为何取代；源 `JSNote/defineproperty方法.md`
  - **CREATE** `concepts/数据响应式.md` — effect/track/trigger 三板斧 + `WeakMap→Map→Set` 三级依赖表 + Proxy/Reflect handler + activeEffect 修「不读也重跑」与「effect 串味」+ ref 用对象访问器实现 + computed = ref + effect + Vue2/Vue3 对照表；源 VUE3 响应式上/中/下/补 4 篇
  - **CREATE** `concepts/自定义消息接口.md` — msg/srv/action 三种接口文件 + 四步流程 + `package.xml` 差异（action 用 `buildtool_depend` + `action_msgs`）+ `rosidl_generate_interfaces` 单次调用列全部 + `ros2 interface show` 验证 + IDE extraPaths；源 `Ros2_Note/co_me/2024_09_25.md`、`2024_10_03_002.md`、`2024_10_15_002.md`
- Wiki pages modified (8)：
  - **MODIFY** `entities/Computer_Network.md` — 「rdt 协议演化」纯文本 → 概念页链接
  - **MODIFY** `entities/JavaScript.md` — 概念表 `defineProperty` 行末列 `—` → 概念页链接
  - **MODIFY** `entities/ROS2.md` — 「接口定制」纯文本 → 概念页链接
  - **MODIFY** `entities/Vue.md` — 「数据响应式」纯文本 → 概念页链接
  - **MODIFY** `index.md` — 新增 Vue 段落；JavaScript / ROS2 / 计算机网络 三段各增 1 条；`Last updated` → 2026-11-06
  - **MODIFY** `concepts/话题通信.md` — 「相关」增自定义消息接口链接（消息接口一节直接对应）
  - **MODIFY** `concepts/TCP与UDP.md` — 「相关」增可靠数据传输链接（对比表的"可靠性"一行由此展开）
  - **MODIFY** `log.md` — 本条目
- 纪律遵循：先有笔记再建页（4 页全部对应 repo 中已存在的笔记，无凭空生成）；内链一律 `[标签](相对路径.md)`；页面 `related` 用相对 `.md` 路径（与 PR #78 后的 AGENTS.md 模板一致）；源笔记链接指向 blog 的 `learningNote/...` 原文
- Self-check: `wiki-lint.sh --json` 检查 critical 0；orphan 数 +0（4 新页均被 entity/index 引用）

## [2026-11-06] maintenance | `related:` 路径统一为页内相对路径（阶段 B）
- 问题：21 个页面的 `related:` 里混用三种写法 —— 仓库根路径 `docs/wiki/concepts/X.md`、漏写 `wiki/` 的 `docs/entities/X.md`、以及指向不存在的 `VuePress-Theme-Hermes-JSON-Converter.md`（真名含 `Hope`）。frontmatter 不会被 lint 检查，所以长期静默存在
- 变更：57 条 `docs/wiki/...` + 2 条漏 `wiki/` 的 `docs/entities/...` 全部改写为相对当前页面的 `.md` 路径（同目录 `./X.md`、跨目录 `../concepts/X.md`），与 AGENTS.md「`related` 用相对当前页面的 `.md` 路径」一致；`entities/LLM-Prompt-Skill.md` 的那条同时修正文件名 → `VuePress-Theme-Hope-Hermes-JSON-Converter.md`
- 变更：`concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md` 正文 2 处 `../../../postMortem/...`（多退一级，只靠站点根目录兜底才成立）改为 `../../postMortem/...`，目标文件经 repo 树核对存在
- 未动：`related:` 里指向博客原文的 `docs/postMortem/...`（属"关联原始报告"，不是 wiki 页，保持仓库根写法）；`sources:` 字段（AGENTS.md 规定用相对 `docs/` 的路径）
- Self-check: 改写脚本逐个校验目标文件存在（不存在的只报告不写，实际 0 条 unresolved）；lint critical 0→0、orphan 6→6、partial frontmatter 24→24；全库 `docs/wiki/` 前缀在 frontmatter 中已清零

## [2026-11-06] ingest | 补齐 18 个缺页主题（阶段 C）
- 触发：覆盖率审计列出 22 个「wiki 提到但从未建页」的主题；阶段 A 已补 4 页（可靠数据传输 / defineProperty / 数据响应式 / 自定义消息接口），本阶段补其余 18 页
- Wiki pages created (18)，全部以 repo 中已存在的笔记为 source：
  - **计算机网络 7**：`UDP校验和`（伪首部 + 反码求和 + 回卷进位 + 全 1 校验）、`TCP-IP五层模型`（逐层职责 + 同网段/跨网段两条转发路径 + 三层转发）、`VLAN`（802.1Q 标签结构 + Access/Trunk/Hybrid 收发规则 + VLANIF）、`SMTP`（六步传递 + 中继重试 + 为何收信必须换 POP3/IMAP）、`PPP与PPPoE`（点对点 → 以太网隧道 + MTU 1492）、`链路发现协议`（802.1ab，只通告不配置）、`黑洞路由`（NULL0 三类用途）
  - **JavaScript 2**：`函数形参与实参`（object[prop] vs object.prop）、`JavaScript语法速记`（var/let、严格模式、IIFE、eval 三缺点、Object vs Map、七种原始类型、位运算替代 2 的幂乘除）
  - **Vue 3**：`Vuex`（四属性 + 四个 map 辅助函数 + namespaced 模块化）、`Vue-Router`（12 节骨架：嵌套/两种传参/命名路由/props 三写法/replace/keep-alive/三层守卫/hash vs history）、`Vue3渲染函数`（h() 属性对象扁平化与 on 前缀）
  - **ROS2 1**：`ROS2参数服务`（挂在节点内部的键值对、六个 CLI 命令、只读参数为什么 set 失败、--params-file 启动加载的差别）
  - **TypeScript 3**：`TypeScript类型系统`（类型声明/13 种类型/断言/tsconfig 全量）、`TypeScript工程化`（webpack 七包 + config + ts-loader vs babel-loader）、`TypeScript面向对象`（三档访问控制/存取器/继承/抽象类/接口/泛型与约束）
  - **计算机组成原理 1**：`机器数与IEEE-754`（三段结构、双向换算含大数估算法、特殊值与范围、机器精度 2^-23、真误差与舍入规则）
  - **自动控制原理 1**：`S-Z变换表`（22 行四列对照表 + 四条记忆线索 + Z 变换四种求法 + 差分方程法完整例题）
- Wiki pages modified (13)：`index.md`（新增 TypeScript / 计算机组成原理 / 自动控制原理 三个段落，原四段各补条目）、`entities/{JavaScript,ROS2,Vue,TypeScript,Computer_Network}.md`（新增概念页链接）、`sources/{Computer_Network,JavaScript,Vue,TypeScript,Computer_Composition,Control_Theory}.md`（新增「概念页」索引段）、`log.md`（本条目）
- 顺带修正两处 source 页面的错标（也是「缺页主题」清单部分失真之源）：
  - `sources/JavaScript.md`：`简单记忆.md` 原标「记忆化相关」→ 实际内容是 var/let、严格模式、eval 等零散语法速记（并不存在 memoization 笔记）
  - `sources/TypeScript.md`：笔记表原标 第二天「接口与泛型」、第三天「高级类型」、第四天「装饰器」、第五天「综合应用」→ 实为「编译选项」「webpack & Babel」「面向对象（上）」「面向对象（下：接口与泛型）」，按实际内容更正
- 纪律遵循：先有笔记再建页（18 页全部对应 repo 原文，未凭空生成主题）；内链一律 `[标签](相对路径.md)`；`related` 用相对 `.md` 路径；源笔记链接指向 blog 的 `learningNote/...` 原文；图片未搬运（原文附图在 blog 侧 `assets/`，wiki 不复制二进制）
- Self-check: `wiki-lint.sh --json` critical 0；新页全部获得入链（orphan 不增）

## [2026-11-06] maintenance | orphan 归零：index 的链接计入入链
- 现象：`sources/Computer_Composition.md` 与 `sources/Control_Theory.md` 长期被判 orphan，但它们其实就列在 `index.md` 的 Sources 段里
- 根因：`wiki-lint.sh` 的入链统计只遍历 `pages`（concepts/entities/sources），`index.md` 不在其中，于是「只被首页链到」的页面一律算孤儿
- 修复：`wiki-lint.sh` 把 `index.md` 的出链也计入 `inbound`（仍跳过行内代码 span 与自链接）；回归测试用临时 wiki 验证——只在 index 里出现的页不再报 orphan，无人链接的页与仅被代码 span 引用的页仍报
- 顺带补两条正文入链：`concepts/机器数与IEEE-754.md` → `../sources/Computer_Composition.md`、`concepts/S-Z变换表.md` → `../sources/Control_Theory.md`（「知识源」行，让两页与各自 source 摘要双向可达）
- Lint 结果：critical 0、orphan 2 → 0、partial frontmatter 24、oversized 1

## [2026-11-06] maintenance | 拆分 oversized 页：mihomo 修复 / 诊断 两页
- 触发：`wiki-lint.sh` 报 `oversized_page`（>200 行）1 处 —— `Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` 247 行
- 拆分原则：**按「取证过程」与「修复决策」切**，不按长度平均切。过程是一次性史料（7 步取证、12 节点逐个切换、`dig` 取证、自举死锁插曲），结论是可复用知识（选型、三层架构、URLTest、cron、验证、经验）
- 结果：
  - `concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` 247 → 143 行：核心结论 + 故障现象 + 根因一段 + 方案选型（A/B 对比、`${VAR}` 不支持所以要 file provider）+ 三层分离架构 + URLTest 组 + 每周三 04:40 订阅 cron + 修复侧三个陷阱 + 验证 + 5 条经验 + 相邻故障
  - 新页 `concepts/Mihomo-IP-Pool-Drift-Diagnosis.md` 148 行：适用场景 + 五步速查表 + Step 1~4 完整取证 + 自举失败插曲（含 `hermes update` 死锁日志）+ 5 个坑 + 交接段
- 内容保全：原文关键串（`UDP 53`、`24.53 GB`、`v951-zj.71edge.work`、`context deadline exceeded`、`--noproxy`、`伪节点`、`cp.cloudflare.com`、`SAFE_PATHS`、`orcaterm`、`20260810-031752-pre-update`、`base64 校验`、`每周三 04:40`）逐条 grep 确认仍在两页之一，无删减
- 双页互链：两页 `related:` 互指 + 正文显式交接段；`index.md` 的旧条目改标签为「修复」并新增诊断页条目
- 敏感信息：`hermes update` 日志里的 `ghp_…` token 在拆分时替换为 `«redacted»`

## [2026-11-06] maintenance | 拆分 AI Daily Briefing 页：修复与根因分家
- 触发：`AI-Daily-Briefing-Brotli-Fix-Investigation.md` 182 行，接近 lint 的 200 行阈值，且「一次性排查叙事」与「可复用技术结论」混在一页
- 拆分原则同 mihomo 页：过程/史料归诊断页，可复用结论归主页面
- 结果：
  - 主页 182 → 78 行：核心结论（换 Provider 只止血、长期要禁 br）+ 故障现象 + 修复动作 + 6 项指标对比表 + 为什么换模型能止住 + 关键结论 + 后续建议
  - 新页 `concepts/Brotli-Stream-Truncation-Root-Cause.md` 129 行：五层叠加图 + 08:15→08:23 故障时间线 + brotlicffi `_decompress()` 守卫源码 + httpx 为何不检查 + 为何 retry 必在同位置失败 + 四家 Provider 的 Content-Encoding 对比 + urllib3 #3734 同类回归 + `skills_hub.py` 规避为何没盖住 Provider 调用
- frontmatter 顺手规范化：原页用 `date: 2026-06-09`（旧 schema，属 partial_frontmatter 24 之一），改为 `created: 2026-06-09` + `updated: 2026-11-06`，并补 `sources:`（原页只把 005 报告写在 `related:` 里）
- index.md：该页在「LLM Prompt & Skill」与「AI Agent」两段重复出现两次（历史遗留），本次改为一段放修复页、另一段放根因页，顺带消掉重复项
- 未拆的两页（读完全文后改变初判，见对话说明）：`LeanCloud-to-Neon-Migration` 181 行的体量来自必须内联的转换脚本；`Ubuntu-gdm3-Disk-Full-Troubleshooting` 140 行是 runbook，急救 8 步与扩容 7 步必须连读
