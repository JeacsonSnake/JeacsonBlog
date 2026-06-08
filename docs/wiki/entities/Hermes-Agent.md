---
title: Hermes Agent
description: "Hermes Agent — Nous Research 开发的可自我调整 skills 的 AI Agent，本博客核心使用对象"
type: entity
tags: [AI Agent, Hermes, NousResearch, LLM]
related:
  - docs/wiki/concepts/Hermes-Agent-Cronjob-Setup.md
  - docs/wiki/entities/LLM-Prompt-Skill.md
created: 2026-06-08
updated: 2026-06-08
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
---

# Hermes Agent

## 概述

Hermes Agent 是 Nous Research 开发的 AI Agent 框架，核心特性是**可自我调整各个 skill 以及它们之间的联系**。本博客的 LLM Wiki 架构、RSS 简报推送、LLM 对话记录转 Markdown 等工作流均基于此 Agent。本实体汇总与 Hermes Agent 相关的部署配置、工作流和踩坑记录。

## 主要工作流

### VPS 部署 + RSS/Agent-Reach 每日简报 cronjob

在腾讯云入门型 VPS（2 CPU / 2 GB RAM / Ubuntu 24.04 LTS）上部署 Hermes Agent，配置每日 7:00 触发的 cronjob，通过 FOLO + Agent-Reach 聚合 RSS、GitHub、微博、arXiv 信源并推送日报。

相关文档：
- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — 部署流程、模型选择、gateway 多路互备完整方法论
- [[../sources/PostMortem.md]] — 踩坑心得摘要

### LLM Wiki 维护工作流

由 Hermes Agent 读取原始博客笔记，通过 fork + Pull Request 的方式增量维护 `docs/wiki/` 知识层。配套使用 `vuepress-wiki-integration` skill 强制 GitHub-API 操作纪律。

相关文档：
- [[./LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体（含 wiki ingest workflow）
- [[../concepts/VuePress-Theme-Hope-Markdown-Converter.md]] — LLM 对话→VuePress Markdown 转换

## 核心配置

- **主模型**: MiniMax-2.6 → MiniMax-2.7 → MiniMax-M3
- **Fallback 模型**: kimi-k2.5 / kimi-k2.6 / Deepseek-V4-flash
- **多模态（图像生成占位）**: qwen/qwen3-vl-8b-instruct via OpenRouter
- **Memory**: built-in → holographic memory（迁移完成）
- **Gateway 互备**: 微信（ilink API）/ Discord / 飞书 — 同时下发确保 cronjob 日志可送达
- **部署环境**: 腾讯云入门型 VPS，Ubuntu 24.04 LTS

## 关键陷阱

- **衔尾蛇问题**: wiki 自身的更新被 RSS 扫描捕获并触发新一轮 wiki ingest，必须用 fork + PR 隔离避免。
- **Gateway 选择**: 微信对 cronjob 批量推送限流严重；Discord 移动端懒加载；飞书是当前最稳定通路但偶发 session 合并。
- **Prompt 不可复现**: skill 中的描述性 prompt 无法保证跨运行一致性，需配合显式文件结构与 schema。
