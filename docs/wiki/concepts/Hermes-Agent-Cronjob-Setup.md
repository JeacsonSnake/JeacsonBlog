---
title: Hermes Agent 部署与 RSS 每日简报 cronjob
description: "在入门型 VPS 上部署 Hermes Agent 并接入 FOLO/Agent-Reach 做每日 7:00 简报推送的完整方法论"
type: concept
tags: [AI Agent, Hermes, Cronjob, RSS, VPS, Agent-Reach]
related:
  - docs/wiki/entities/Hermes-Agent.md
  - docs/wiki/concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md
created: 2026-06-08
updated: 2026-06-09
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
  - docs/postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.md
---

# Hermes Agent 部署与 RSS 每日简报 cronjob

## 概述

本文档整理在 VPS 上部署 Hermes Agent 并通过 cronjob 接入 RSS/Agent-Reach 实现每日简报推送的完整流程。基于 [sp_for_LLM/003 — Hermes Agent 初步食用记录](../../postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md) 的实测经验，覆盖安装、模型选择、gateway 多路互备、避免「衔尾蛇」问题等关键决策。

**2026-06-09 更新**：执行模型从 MiniMax-M3 切换至 deepseek-v4-flash（详见 [[./AI-Daily-Briefing-Brotli-Fix-Investigation.md]] sp_for_LLM/005 多会话融合报告）。切换根因是 MiniMax-M3 触发的 brotli 流截断 bug 导致简报连续 4 天生成失败。

## 适用场景

- 个人博客作者希望用 AI Agent 自动聚合 AI/LLM 相关 RSS 源
- VPS 配置入门级（2 CPU / 2 GB RAM / 40 GB SSD / 3 Mbps）
- 需要稳定 cronjob 推送通道（不依赖单一 IM 平台）

## 部署流程

### 1. 基础环境

| 资源 | 值 |
|---|---|
| 云厂商 | 腾讯云（广州机房） |
| CPU | 2 核 |
| 内存 | 2 GB |
| 系统盘 | SSD 40 GB |
| 带宽 | 3 Mbps / 200 GB/月 |
| OS | Ubuntu Server 24.04 LTS |
| 快照策略 | **必须做**（作者到写文章时才发现没做快照） |

### 2. 安装步骤

腾讯云官方提供的 Hermes Agent 构建模板**会钉死部分配置**，自定义困难。推荐做法：

1. 在干净 Ubuntu 24.04 LTS 上手动安装（作者重装 3 次后确认）
2. 参考官方文档安装步骤：[hermes-agent.nousresearch.com/docs/zh-Hans/](https://hermes-agent.nousresearch.com/docs/zh-Hans/)
3. 旧版中文文档可作辅助：[hermes-doc.aigc.green](https://hermes-doc.aigc.green/)

### 3. 模型选型

- **主模型**: MiniMax-2.6 → MiniMax-2.7 → MiniMax-M3（持续跟随官方升级）
- **2026-06-09 变更**: Cron Job 执行模型切换至 **deepseek-v4-flash**（消除 brotli 流截断 bug）— 详见 [[./AI-Daily-Briefing-Brotli-Fix-Investigation.md]]
- **Fallback**: kimi-k2.6、Deepseek-V4-flash
- **避免冲突**: 如果实验室也在用某模型（如 kimi-k2.5），把 Agent 模型换成另一家的，避免 token 额度互相抢占

### 4. cronjob 简报推送

- **触发时间**: 每天早上 7:00
- **信源聚合**:
  - FOLO 提供 RSS 订阅源
  - Agent-Reach（[GitHub](https://github.com/Panniantong/Agent-Reach)）统一封装 Twitter/X、Reddit、GitHub、微博、arXiv 等 17 个平台
  - 两者作为**共享信源**合并去重
- **输出**: AI/LLM 相关日报 + GitHub Trending Top 3 + 新文章摘要

## Gateway 多路互备（核心方法论）

**核心问题**：单个 IM gateway 都有致命缺陷，必须至少配置 2 路互备。

### 各平台缺陷对比

| Gateway | 致命缺陷 | 影响 |
|---|---|---|
| 微信（ilink API） | cronjob 批量推送被限流拦截 | 简报直接收不到 |
| Discord | 移动端懒加载严重 | 早晨起床时只能看到 1/3~1/4 内容（需等 10min~2h 完整加载） |
| 飞书 | 偶发 session 无法单分 | 偶发但不致命 |

### 推荐配置

**同时下发到 2~3 个 gateway**：

1. 微信 + Discord（基础互备）
2. 加飞书作为第三通路（应对 Discord 懒加载窗口）
3. 在 Discord 上通过 emoji 反应（✓）标记任务完成状态
4. 微信用「正在输入中...」做活体信号，但不能判断完成

### 微信文本/图片发送缺陷

- 微信是**并发两个包**而非打包成一个，导致 Hermes Agent 无法把图片与后续文字关联
- 必须**改用支持文本+图片合并发送的 gateway**（如 Discord）

## 关键陷阱

### 1. 衔尾蛇问题（Ouroboros）

**症状**: Agent 把 wiki 自身的更新当作新博客文章反刍，再写回 wiki，导致循环。

**解决方案**:
- 给 Agent 创建**独立的 GitHub 账号**
- 该账号 fork 博客源码
- 修改后通过 Pull Request 提交
- 人工 review 后合并

### 2. Prompt 不可复现

**症状**: skill 中的描述性 prompt 越宽泛，结果越趋于"中庸"。

**解决方案（计划中）**: 把 skill 输出固化为显式文件架构，后续更新时按结构填字段，而非重新生成。

### 3. Discord 配置 `delivery` 字段易写错

作者实测：把"字符串写成数组时未改数值类型"导致第二天两边都收不到简报。务必写完后跑一次手工触发确认。

### 4. Brotli 流截断 bug（sp_for_LLM/005 新增）

**症状**: Cron Job 从某天起连续失败，错误信息 `RuntimeError: Response remained truncated after 3 continuation attempts`，输出文件中 `## Response` 段为空 `[RESPONSE_PLACEHOLDER]`。

**根因**: `brotlicffi==1.2.0.1` + `httpx==0.28.1` + 启用 brotli 压缩的 API Provider（如 MiniMax）在大型 SSE 流式响应（>500KB 压缩后）下必抛 `decoder process called with data when 'can_accept_more_data() is False`。

**短期解决**: 切换到不启用 brotli 的 Provider（如 deepseek-v4-flash 返回 identity 编码）。

**长期修复**: 在 Hermes Provider 配置层统一禁用 brotli（类似 `skills_hub.py:1410-1415` 的做法）。

详细排查过程、源码级根因分析（5 层技术栈）、修复对比详见 [[./AI-Daily-Briefing-Brotli-Fix-Investigation.md]]。

## 关联文档

- [[../entities/Hermes-Agent.md]] — Hermes Agent 实体聚合页（含 sp_for_LLM/005 workflow section）
- [[./AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — Cron Job 故障排查与模型切换修复
- [[../sources/PostMortem.md]] — 踩坑心得知识域摘要
- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体（含 wiki ingest 流程）
- 原文：[[../../postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md]]
- 故障原文：[[../../postMortem/sp_for_LLM/005_HermesMerged-AI-Daily-Briefing-Brotli-Truncation-Fix_-report.html]]