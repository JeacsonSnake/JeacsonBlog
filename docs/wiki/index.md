---
title: JeacsonBlog Wiki
---

# JeacsonBlog Wiki

> 基于 Karpathy LLM Wiki 模式构建的个人知识库。以博客原始笔记为 source of truth，由 LLM Agent 增量维护。
> Last updated: 2026-11-06

## Sources（知识域摘要）

按博客分类聚合的源笔记摘要，由 LLM 阅读对应 `docs/learningNote/` 下的笔记后生成/更新。

- [JavaScript 语言核心与 Web API 笔记](./sources/JavaScript.md)
- [ROS2 机器人操作系统，通信机制与工具](./sources/ROS2.md)
- [计算机网络协议与原理](./sources/Computer_Network.md)
- [Vue2 与 Vue3 框架笔记](./sources/Vue.md)
- [TypeScript 类型系统](./sources/TypeScript.md)
- [通用编码技术与 VSCode 技巧](./sources/Coding_Skill.md)
- [计算机组成原理](./sources/Computer_Composition.md)
- [自动控制原理与 S-Z 变换](./sources/Control_Theory.md)
- [踩坑心得与部署记录](./sources/PostMortem.md)

## Entities（实体/主题）

主题/领域级别的聚合页面，关联多个相关概念。

- [JavaScript 编程语言](./entities/JavaScript.md)
- [ROS2 机器人操作系统](./entities/ROS2.md)
- [Vue.js 前端框架](./entities/Vue.md)
- [Web 开发技术栈](./entities/Web.md)
- [计算机网络](./entities/Computer_Network.md)
- [TypeScript 类型系统](./entities/TypeScript.md)
- [LLM Prompt & Skill 工作流](./entities/LLM-Prompt-Skill.md)
- [Hermes Agent（Nous Research）AI Agent 框架](./entities/Hermes-Agent.md)
- [声子流体动力学](./entities/Phonon-Hydrodynamics.md)

## Concepts（具体概念）

具体知识点的深度页面，通常对应一篇或多篇源笔记的核心内容提炼。

### JavaScript
- [Array.reduce() 数组压缩方法](./concepts/Reduce方法.md)
- [Object.defineProperty：属性描述符与 Vue2 响应式劫持](./concepts/defineProperty.md)
- [ES6 Symbol 原始数据类型](./concepts/Symbol.md)
- [函数柯里化与函数组合](./concepts/函数柯里化.md)
- [函数形参与实参：点号访问与中括号访问的区别](./concepts/函数形参与实参.md)
- [JavaScript 语法速记：var/let、严格模式、eval、Object vs Map](./concepts/JavaScript语法速记.md)

### ROS2
- [Topic 发布/订阅通信模式](./concepts/话题通信.md)
- [Service 请求/应答通信模式](./concepts/服务通信.md)
- [Action 长期任务通信（支持取消 + 反馈）](./concepts/动作通信.md)
- [tf2 坐标变换系统](./concepts/坐标变换.md)
- [DDS 域ID跨设备通信](./concepts/分布式通信.md)
- [自定义消息接口（msg / srv / action 的编写与编译）](./concepts/自定义消息接口.md)
- [ROS2 参数服务：随节点走的键值配置](./concepts/ROS2参数服务.md)

### Vue
- [Vue3 数据响应式引擎：effect / track / trigger 与 Proxy + Reflect](./concepts/数据响应式.md)
- [Vuex：state / getters / mutations / actions 与模块化](./concepts/Vuex.md)
- [Vue Router：基本路由、传参、守卫与 hash/history 两种模式](./concepts/Vue-Router.md)
- [Vue3 与 Vue2 的渲染函数：h() 怎么变扁平的](./concepts/Vue3渲染函数.md)

### TypeScript
- [TypeScript 类型系统：从类型声明到 tsconfig 编译选项](./concepts/TypeScript类型系统.md)
- [TypeScript 工程化：webpack + ts-loader 与 Babel](./concepts/TypeScript工程化.md)
- [TypeScript 面向对象：类、封装、继承、接口与泛型](./concepts/TypeScript面向对象.md)

### 计算机组成原理
- [机器数与 IEEE-754：浮点数是怎么存进 32 位的](./concepts/机器数与IEEE-754.md)

### 自动控制原理
- [S-Z 变换表：连续系统与离散系统的对照工具](./concepts/S-Z变换表.md)

### Coding Skill
- [VSCode 自定义 Snippet（以 ROS2 C++ Publisher 为例）](./concepts/代码片段.md)

### 计算机网络
- [DNS→TCP→HTTP→渲染全流程](./concepts/URL到页面显示.md)
- [TCP vs UDP 传输层协议对比](./concepts/TCP与UDP.md)
- [可靠数据传输：rdt 1.0 → 3.0 与 GBN / SR 流水线协议](./concepts/可靠数据传输.md)
- [UDP 校验和：反码求和、回卷进位与「全 1 即通过」](./concepts/UDP校验和.md)
- [TCP/IP 五层模型：每层解决什么问题](./concepts/TCP-IP五层模型.md)
- [VLAN：用 802.1Q 标签切开广播域](./concepts/VLAN.md)
- [SMTP：为什么发信是「推」而收信必须是「拉」](./concepts/SMTP.md)
- [PPP 与 PPPoE：点对点协议与宽带拨号](./concepts/PPP与PPPoE.md)
- [链路发现协议（LLDP）：只通告、不配置](./concepts/链路发现协议.md)
- [黑洞路由：出口指向 NULL0 的静态路由](./concepts/黑洞路由.md)

### LLM Prompt & Skill
- [Kimi META Prompt：VuePress 格式转换器（.docx 输入）](./concepts/VuePress-Theme-Hope-Markdown-Converter.md)
- [Kimi META Prompt：VuePress 格式转换器（Hermes .json 输入，单文件）](./concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md)
- [Kimi META Prompt：Hermes 多会话 JSON 融合（多文件，按主题/阶段重组）](./concepts/VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md)
- [热质传递文献报告批判框架](./concepts/Heat-Transfer-Literature-Report.md)
- [反向提示词工程与三 Session Prompt 编译管道](./concepts/Reverse-Prompt-Engineering.md)
- [Hermes Agent 部署与 RSS 每日简报 cronjob 配置](./concepts/Hermes-Agent-Cronjob-Setup.md)
- [AI Daily Briefing Cron Job Brotli 流截断故障排查与模型切换修复](./concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md)

### AI Agent
- [Hermes Agent 部署与 RSS 每日简报 cronjob 配置](./concepts/Hermes-Agent-Cronjob-Setup.md)
- [AI Daily Briefing Cron Job Brotli 流截断故障排查与模型切换修复](./concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md)
- [AI 简报自动归档两跳链路（merge-base 不变量 / GH013·GH006 双层保护 / step 级验证）](./concepts/Briefing-Archive-Auto-Merge-Topology.md)

### DevOps / 部署
- [Waline 评论数据从 LeanCloud 迁移至 Neon PostgreSQL 完整流程](./concepts/LeanCloud-to-Neon-Migration.md)
- [Edge「使用安全的 DNS」选项的副作用与排查（DoH 污染 curl DNS 缓存）](./concepts/Edge-Secure-DNS-Gotcha.md)
- [Ubuntu 24.04 gdm3 启动失败根因排查（磁盘空间耗尽 → APT 缓存失败 → systemd 降级）](./concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md)
- [Vite 构建 cssnano 去重 fit-content 致 Edge 样式失效（标准语法放 vendor prefix 后）](./concepts/Vue-CSS-Fit-Content-Vite-cssnano-Dedupe-Bug.md)
- [mihomo 代理全挂修复（订阅自动化三层架构 + URLTest 自动选择组）](./concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md)
- [mihomo 12 节点全挂诊断实录（5 步取证与 5 个坑）](./concepts/Mihomo-IP-Pool-Drift-Diagnosis.md)
- [WiFi 5GHz DFS 信道雷达避让致社交平台图片加载慢（关闭 DFS + Channel Finder 修复）](./concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- [Nintendo Switch 5GHz 搜不到：区域固件信道白名单（仅 36/40/44/48）与路由器手动选频](./concepts/Switch-5GHz-Channel-Whitelist.md)
- [双屏 DPI 缩放不一致致 DWM 重采样振铃（GIF 蓝黄斑纹 / 分层排除法）](./concepts/Per-Monitor-DPI-DWM-Resampling-Ringing.md)

## 最近更新
详见 [Wiki Log](./log.md)