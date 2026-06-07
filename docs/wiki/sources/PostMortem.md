---
title: 踩坑心得知识域摘要
description: "部署与开发中的实际问题记录与解决方案"
type: source
tags: [DevOps, Deploy, Markdown, AI Agent]
lastUpdated: 2026-06-08
sources:
  - docs/postMortem/sp_for_LLM/003_think-Initial-notes-on-using-Hermes_Agent.md
---

# 踩坑心得知识域

本目录对应 `docs/postMortem/`，记录实际开发和部署中遇到的问题及解决方案。

## 主要内容

### 部署 (deploy)
- VuePress 博客部署流程
- GitHub Pages / VPS 部署
- 环境配置问题

### Markdown 渲染 (markdown_render)
- markdown-it 渲染器配置
- 自定义插件
- VuePress 中的 Markdown 扩展

### LLM Prompt & Skill (sp_for_LLM)
- Kimi / ChatGPT 等 LLM 的 META Prompt 模板
- 将 `.docx` 对话记录转换为 VuePress 兼容 Markdown 的工作流
- 文献报告（Literature Report）的跨尺度物理批判框架
- 反向提示词工程与 Prompt 编译管道（sp_for_LLM/002）— 从参考图片反推生成可复用的图像 Prompt
- Hermes Agent 部署与 RSS 每日简报 cronjob（sp_for_LLM/003）— VPS 安装、多模型选型、gateway 多路互备、衔尾蛇问题规避
- 核心参考书：Kaviany《Heat Transfer Physics》/ Reif《Fundamentals of Statistical and Thermal Physics》/ Gang Chen《Nanoscale Energy Transport》

## 关联

- [[../entities/Web.md]] — Web 开发
- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体
- [[../entities/Hermes-Agent.md]] — Hermes Agent 实体
- [[../concepts/Reverse-Prompt-Engineering.md]] — 反向提示词工程方法论
- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — Hermes Agent 部署与 cronjob 配置方法论
