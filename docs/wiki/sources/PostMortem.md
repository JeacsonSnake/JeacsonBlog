---
title: 踩坑心得知识域摘要
description: "部署与开发中的实际问题记录与解决方案"
type: source
tags: [DevOps, Deploy, Markdown]
lastUpdated: 2026-06-05
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
- Kimi / ChatGPT / GPT-4o / Claude 等 LLM 的 META Prompt 模板
- 将 `.docx` 对话记录转换为 VuePress 兼容 Markdown 的工作流
- 文献报告（Literature Report）的跨尺度物理批判框架
- **反向提示词工程**（Reverse Prompt Engineering）四阶段方法论：从参考图片反推 → 三层解耦 → 文献嫁接 → 风格一致性验证
- **三 Session Prompt 编译管道**：Style Template Extractor → Content Compiler → Prompt Refiner，输出 META Prompt / justified_prompt / final_render_prompt
- 核心参考书：Kaviany《Heat Transfer Physics》/ Reif《Fundamentals of Statistical and Thermal Physics》/ Gang Chen《Nanoscale Energy Transport》

## 文章列表

| 标题 | 路径 | 摘要 |
| --- | --- | --- |
| 000 - VuePress Theme Hope Markdown Converter | `sp_for_LLM/000_prompt-VuePress-Theme-Hope-Markdown-Converter.md` | Kimi K2.6 生成的 VuePress Markdown 转换 META Prompt |
| 001 - 中级热质传递文献报告 | `sp_for_LLM/001_QA-intermediate-heat-transfer-literature-report.md` | 7 轮递进式提问的 Literature Report 写作框架 |
| 002 - 反向提示词工程与 Prompt 编译管道 | `sp_for_LLM/002_QA-inverse-prompt-engineering-report.md` | 四阶段 RPE 方法论 + 三 Session 编译管道（含完整 Session Prompt 模板） |

## 关联

- [[../entities/Web.md]] — Web 开发
- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体
- [[../concepts/Reverse-Prompt-Engineering.md]] — 反向提示词工程概念页
