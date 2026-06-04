---
title: LLM Prompt & Skill
description: "可供大语言模型使用的 prompt 模板与 skill 工作流"
type: entity
tags: [LLM, Prompt Engineering, Kimi, VuePress]
related:
  - docs/wiki/concepts/VuePress-Theme-Hope-Markdown-Converter.md
  - docs/wiki/concepts/Heat-Transfer-Literature-Report.md
---

# LLM Prompt & Skill

## 概述

本实体汇总与 LLM（Kimi、ChatGPT 等）协作生成的工作流、Prompt 模板与 skill 方法论。核心场景是将 LLM 多轮对话的 `.docx` 记录转换为 VuePress 博客兼容的 Markdown 格式，并生成可直接复用的 META Prompt。

## 主要工作流

### VuePress Markdown 转换工作流

将 LLM 对话导出的 `.docx` 文件，通过 Kimi K2.6 生成的 META Prompt，转换为 VuePress Theme Hope v2.0.0-rc.107 兼容的 Markdown。

相关文档：
- [[../concepts/VuePress-Theme-Hope-Markdown-Converter.md]] — META Prompt 模板说明
- [[../sources/PostMortem.md]] — sp_for_LLM 目录知识域摘要

### 文献报告写作工作流

基于课程 *Intermediate Heat and Mass Transfer* 的 Literature Report 写作框架，通过 7 轮递进式提问引导，建立"宏观 CFD 优化 → 微观声子 BTE → 跨尺度批判"的叙事结构。

相关文档：
- [[../concepts/Heat-Transfer-Literature-Report.md]] — 批判框架概念页
- [[../entities/Phonon-Hydrodynamics.md]] — 声子流体动力学实体（关联）

## 核心工具

- **LLM 模型**: Kimi K2.6
- **博客框架**: VuePress Theme Hope v2.0.0-rc.107
- **数学渲染**: KaTeX 0.16.47
- **部署方式**: GitHub Actions → GitHub Pages
- **目录规范**: `docs/postMortem/sp_for_LLM/` 存放 skill/prompt 文档