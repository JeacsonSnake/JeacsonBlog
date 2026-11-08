---
title: 踩坑心得知识域摘要
description: "部署与开发中的实际问题记录与解决方案"
type: source
tags: [DevOps, Deploy, Markdown, AI Agent, DNS, Migrate, Network, Ubuntu, Disk, Troubleshooting, CSS, Vite, Proxy, GSLB, WiFi, DFS, Channel, GitHub Actions, Git, Branch Protection, Windows, Display, DPI, Translation, Lint, State Machine, RSS]
created: 2026-04-17
updated: 2026-11-09
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
  - docs/postMortem/sp_for_LLM/000X_prompt-VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/postMortem/sp_for_LLM/000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/postMortem/sp_for_LLM/004_Hermes-LangChain-Interpreter-Skill-Investigation-report.md
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
  - docs/postMortem/sp_for_LLM/006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.md
  - docs/postMortem/sp_for_LLM/007_Hermes-Bilingual-Translation-and-Wiki-Pipeline-Decoupling-report.md
  - docs/postMortem/sp_for_LLM/2026_06_29.md
  - docs/postMortem/deploy/005_leancloud_migrate_neon_relate.md
  - docs/postMortem/deploy/006_Ubuntu_gdm3_cannot_activate.md
  - docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md
  - docs/postMortem/tiny_tips/2026_09_07.md
  - docs/postMortem/tiny_tips/2026_09_08.md
  - docs/postMortem/tiny_tips/2026_11_01.md
  - docs/postMortem/tiny_tips/2026_11_04.md
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
- **mihomo 代理全挂根因排查**（deploy/007 新增）— 腾讯云广州 12 节点全挂：不是 x.com 被封，是机场 **GSLB IP 池漂移 + 静态订阅 4 个月未更新**（节点活着、本地→节点链路失效）；走代理连 github/google 也挂 = 节点层故障；修复 = 订阅自动化（.env + file provider + 每周更新 cron）+ URLTest 自动选择组

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
- **AI 简报自动归档链路打通**（sp_for_LLM/006 新增）— hop-1（归档分支 → PR 白名单预检 → 自动 squash 进 `daily`）+ hop-2（`workflow_dispatch` 三点 diff 守卫 → `git merge --no-ff` → push master）两跳拓扑；核心不变量 = `merge-base`（squash 只同步内容、不建立祖先关系）；master 双层保护 GH013（ruleset）/ GH006（classic，个人仓库无 bypass 名单）→ 删 classic 只留 ruleset；`success` 必须拆到 step 级核对
- **博客全站英译与 wiki 检测层解耦**（sp_for_LLM/007 新增）— 167 页盘点 → 三轮样稿冻结口径 → 115 篇批量翻译（156,563 字 / 868 代码块 / 168 图）；难点是可判定性：锚点对齐 `@mdit-vue/shared` 的 slugify、术语表 `.csv`、容器句式整句匹配；结构校验全绿后仍崩 YAML 冒号 / `Array<type>` / 数学宏丢失三类，故闸门分结构层与渲染层；同时把「读博客」从简报 job 拆成一个 detector + wiki/en 两个 consumer，并修掉 `wiki-lint.sh` 的三个「没报」（index 不入链、方括号标签、stem 当键）与 202 处不可点链接
- **Edge 浏览器「使用安全的 DNS」选项的副作用**（sp_for_LLM/2026_06_29 新增）— DoH 选 Cloudflare 后污染 curl DNS 缓存；TCP 三次握手成功但 ClientHello 后 RST；nslookup 与 curl 返回不同 IP 的诡异断网；跨网络环境切换后特别容易触发
- 核心参考书：Kaviany《Heat Transfer Physics》/ Reif《Fundamentals of Statistical and Thermal Physics》/ Gang Chen《Nanoscale Energy Transport》

### 前端构建 / 小技巧 (tiny_tips)
- **Vue 项目 CSS fit-content 生产构建被错误优化**（tiny_tips/2026_09_07 新增）— cssnano 把 `fit-content` 与 `-moz-fit-content` 视为重复声明去重、只保留后写的前缀 → Edge 失效；解法：标准语法置于 vendor prefix 之后
- **WiFi 5GHz DFS 信道下社交平台图片加载缓慢**（tiny_tips/2026_09_08 新增）— 信道 100（5500 MHz）属 DFS 频段（52~140），触发雷达避让 → 客户端传输不定时挂起；图片小请求对抖动敏感（视频有缓冲可掩盖）；Velop 不支持手动指定信道 → 关闭 DFS + Channel Finder 落到非 DFS 信道（161）
- **双屏 GIF 蓝黄斑纹**（tiny_tips/2026_11_01 新增）— 截图也带斑纹 → 排除面板/线缆；分层排除色域、HDR、NVIDIA 颜色覆盖、EDID 后定位到 per-monitor DPI 不一致（内屏 125% / 副屏 100%）→ DWM 跨屏合成按不同比例重采样，硬色度边缘产生过冲/振铃；统一两屏缩放即消失，还原即复现
- **Switch 搜不到 5GHz WiFi**（tiny_tips/2026_11_04 新增）— Switch 全系 5GHz 仅支持 36/40/44/48（UNII-1），路由器自动选频落到 153（UNII-3）→ SSID 扫描阶段即不可见并静默回退 2.4G；先排除加密/协议，再走本地 Web UI 的 CA 隐藏入口把信道固定为 36，且**必须先关 Auto Channel Finder**（约每 5 天自动覆盖手动设置）；附 Beacon 被动扫描取证与 RSSI 换算

## 关联

- [Web 开发](../entities/Web.md)
- [LLM Prompt & Skill 实体](../entities/LLM-Prompt-Skill.md)
- [Hermes Agent 实体](../entities/Hermes-Agent.md)
- [反向提示词工程方法论](../concepts/Reverse-Prompt-Engineering.md)
- [Hermes Agent 部署与 cronjob 配置方法论](../concepts/Hermes-Agent-Cronjob-Setup.md)
- [Hermes JSON → VuePress Markdown 转换器 META Prompt（单文件）](../concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md)
- [Hermes 多会话 JSON 融合 META Prompt（多文件，按主题重组）](../concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md)
- [AI Daily Briefing Cron Job Brotli 故障排查与修复](../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md)
- [Waline 评论数据从 LeanCloud 迁移至 Neon PostgreSQL 完整流程（4 步）](../concepts/LeanCloud-to-Neon-Migration.md)
- [Edge「使用安全的 DNS」选项的副作用与排查（DoH 污染 curl DNS 缓存）](../concepts/Edge-Secure-DNS-Gotcha.md)
- [Ubuntu 24.04 gdm3 启动失败根因排查（磁盘空间耗尽 → APT 缓存失败 → systemd 降级）](../concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md)
- [Vite 构建 cssnano 错误去重 fit-content 的排查（标准语法置于 vendor prefix 后）](../concepts/Vue-CSS-Fit-Content-Vite-cssnano-Dedupe-Bug.md)
- [mihomo 代理全挂排查（GSLB IP 池漂移 + 订阅自动化三层架构）](../concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md)
- [WiFi 5GHz DFS 信道雷达避让致图片加载缓慢（关闭 DFS 修复）](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- [AI 简报自动归档两跳链路（merge-base 不变量 + 双层分支保护 + step 级验证）](../concepts/Briefing-Archive-Auto-Merge-Topology.md)
- [双屏 DPI 缩放不一致致 DWM 重采样振铃（GIF 蓝黄斑纹）](../concepts/Per-Monitor-DPI-DWM-Resampling-Ringing.md)
- [Switch 5GHz 搜不到：区域固件信道白名单（仅 36/40/44/48）与路由器手动选频](../concepts/Switch-5GHz-Channel-Whitelist.md)
- [博客全站英译与 EN 自动翻译链路（可判定性、双闸门与状态推进）](../concepts/Blog-Bilingual-Translation-Pipeline.md)
- [博客变更检测层（一个 detector、两个 consumer 与各自的 cursor）](../concepts/Blog-Change-Detection-Layer.md)
- [Wiki Lint 的三个「没报」（stem 覆盖、index 不入链、方括号标签）](../concepts/Wiki-Lint-False-Negative-Traps.md)
