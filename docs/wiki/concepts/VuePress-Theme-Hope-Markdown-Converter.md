---
title: Kimi META Prompt — VuePress Theme Hope Markdown Converter
description: "将 Kimi LLM 多轮对话的 .docx 记录转换为 VuePress Theme Hope 兼容 Markdown 的 META Prompt 模板"
type: concept
tags: [LLM Prompt, VuePress, Markdown, Kimi]
date: 2026-06-03
related:
  - docs/postMortem/sp_for_LLM/000_prompt-VuePress-Theme-Hope-Markdown-Converter.md
  - docs/postMortem/sp_for_LLM/001_QA-intermediate-heat-transfer-literature-report.md
---

# VuePress Theme Hope Markdown Converter

## 概述

Kimi K2.6 生成的 META Prompt，用于将 LLM 多轮对话的 `.docx` 文件转换为 VuePress Theme Hope v2.0.0-rc.107 兼容的 Markdown 格式。

## 输入输出

- **传入文件名**: `A.docx`（LLM 对话导出的 Word 文档）
- **输出文件名**: 用户指定（如 `001_QA-report.md`）；若未指定则以 `0xx_QA-report.md` 占位

## 核心功能

1. **Frontmatter 生成**: 自动推断 `title`、`date`、`category`、`tag`
2. **Meta Info Block**: 插入课程/项目/生成模型等元信息引用块
3. **对话格式保留**: 使用 `**User:**` / `**LLM:**` / `___` 分隔符保持多轮结构
4. **手动目录**: 文章开头添加锚点 TOC
5. **Final Prompt 提取**: 若文档末尾存在完整 Prompt，提取至独立章节 `## Final Prompt emitted in Q&A`
6. **数学公式**: KaTeX 兼容（行内 `$...$`，块级 `$$...$$`）

## 适用场景

用于将 LLM 辅助撰写课程文献报告（Literature Report）的多轮对话记录结构化地迁移到博客，支持批量处理与格式统一。