---
title: 踩坑心得知识域摘要
description: "部署与开发中的实际问题记录与解决方案"
type: source
tags: [DevOps, Deploy, Markdown, AI Agent, DNS, Migrate, Network, Ubuntu, Disk, Troubleshooting]
lastUpdated: 2026-08-10
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
  - docs/postMortem/sp_for_LLM/000X_prompt-VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/postMortem/sp_for_LLM/000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/postMortem/sp_for_LLM/004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
  - docs/postMortem/sp_for_LLM/2026_06_29.md
  - docs/postMortem/deploy/005_leancloud_migrate_neon_relate.md
  - docs/postMortem/deploy/006_Ubuntu_gdm3_cannot_activate.md
  - docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md
---

# 踩坑心得知识域

本目录对应 `docs/postMortem/`，记录实际开发和部署中遇到的问题及解决方案。

## 主要内容

### 部署 (deploy)
- VuePress 博客部署流程
- GitHub Pages / VPS 部署
- 环境配置问题
- **LeanCloud → Neon PostgreSQL Waline 评论数据迁移**（deploy/005 新增）— LeanCloud 2027 年停止服务后的 4 步迁移：导出 JSONL → Vercel 创建 Neon + 建表 → waline-data-import-tool 上传 → Redeploy；含 LeanCloud Date 字段格式转换 Python 脚本
- **Ubuntu 24.04 gdm3 启动失败根因排查**（deploy/006 新增）— VMware 虚拟机磁盘空间耗尽（≥95%）导致 APT 缓存写不进 → gdm3 无法启动 → systemd 自动降级为 multi-user.target；包含 8 步紧急清理 + 7 步 VMware 扩容完整流程
- **Mihomo 代理全挂排查：GSLB IP 池漂移 + 订阅自动化**（deploy/007 新增，2026-08-10）— 走代理连 github/google 也全超时，根因不是目标站点被封而是 mihomo 静态订阅配置 4 个月未更新、机场 GSLB IP 池漂移后旧 IP 全部不可达；含 7 步诊断（测无关站点→节点层→境外裸连→dig IP 池→看 config 时间）+ 三层分离架构（`.env` URL + `update-subscription.sh` + `type: file` provider）+ URLTest 自动选择组（`gstatic.com/generate_204` 健康检查，5min 间隔）+ 每周三 04:40 cron 自动更新；自举失败陷阱（关闭 mihomo 后 `hermes update` 因 `insteadOf` 死锁）

### Markdown 渲染 (markdown_render)
- markdown-it 渲染器配置
- 自定义插件
- VuePress 中的 Markdown 扩展

### LLM Prompt & Skill (sp_for_LLM)
- Kimi / ChatGPT 等 LLM 的 META Prompt 模板
- 将 `.docx` 对话记录转换为 VuePress 兼容 Markdown 的工作流
- 将 Hermes Agent 导出的 `.json` 会话记录转换为 VuePress 兼容 Markdown 的工作流（sp_for_LLM/000X）— 处理 `tool_calls` 折叠、`reasoning_content` 丢弃、用户名前缀剥离等 Hermes 特有场景
- 将多个 Hermes Agent 导出的 `.json` 会话融合为单一连贯报告的工作流（sp_for_LLM/000Y 新增）— 适用于跨会话、跨模型、多方向处理的复合任务（如故障调查 + 修复验证）
- 文献报告（Literature Report）的跨尺度物理批判框架
- 反向提示词工程与 Prompt 编译管道（sp_for_LLM/002）— 从参考图片反推生成可复用的图像 Prompt
- Hermes Agent 部署与 RSS 每日简报 cronjob（sp_for_LLM/003）— VPS 安装、多模型选型、gateway 多路互备、衔尾蛇问题规避
- LangChain Interpreter Skills vs Hermes Skills 调研（sp_for_LLM/004）— 多轮对话调研 Skills 体系对比、Memory 三层架构（built-in ↔ Holographic ↔ disk-level 验证）、冲突指令处理纪律
- AI Daily Briefing Cron Job Brotli 流截断故障排查与模型切换修复（sp_for_LLM/005 新增）— `brotlicffi==1.2.0.1` + `httpx==0.28.1` + MiniMax API 启 brotli 的 5 层叠加 bug；执行模型从 MiniMax-M3 切换至 deepseek-v4-flash；深层源码级根因分析与网络相似案例
- **Edge 浏览器「使用安全的 DNS」选项的副作用**（sp_for_LLM/2026_06_29 新增）— DoH 选 Cloudflare 后污染 curl DNS 缓存；TCP 三次握手成功但 ClientHello 后 RST；nslookup 与 curl 返回不同 IP 的诡异断网；跨网络环境切换后特别容易触发
- 核心参考书：Kaviany《Heat Transfer Physics》/ Reif《Fundamentals of Statistical and Thermal Physics》/ Gang Chen《Nanoscale Energy Transport》

## 关联

- [[../entities/Web.md]] — Web 开发
- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体
- [[../entities/Hermes-Agent.md]] — Hermes Agent 实体
- [[../concepts/Reverse-Prompt-Engineering.md]] — 反向提示词工程方法论
- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — Hermes Agent 部署与 cronjob 配置方法论
- [[../concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md]] — Hermes JSON → VuePress Markdown 转换器 META Prompt（单文件）
- [[../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md]] — Hermes 多会话 JSON 融合 META Prompt（多文件，按主题重组）
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — AI Daily Briefing Cron Job Brotli 故障排查与修复
- [[../concepts/LeanCloud-to-Neon-Migration.md]] — Waline 评论数据从 LeanCloud 迁移至 Neon PostgreSQL 完整流程（4 步）
- [[../concepts/Edge-Secure-DNS-Gotcha.md]] — Edge「使用安全的 DNS」选项的副作用与排查（DoH 污染 curl DNS 缓存）
- [[../concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md]] — Ubuntu 24.04 gdm3 启动失败根因排查（磁盘空间耗尽 → APT 缓存失败 → systemd 降级）
- [[../concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md]] — Mihomo 代理全挂 7 步排查与订阅自动化三层分离架构（GSLB 漂移 + `.env` + URLTest 自动选择 + 每周 cron）
