---
title: Kimi META Prompt — VuePress Theme Hope Hermes JSON Converter
description: "将 Hermes Agent 导出的会话 JSON（output.json）转换为 VuePress Theme Hope 兼容 Markdown 的 META Prompt 模板"
type: concept
tags: [LLM Prompt, VuePress, Markdown, Hermes Agent, JSON]
date: 2026-06-09
related:
  - docs/postMortem/sp_for_LLM/000X_prompt-VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Markdown-Converter.md
  - docs/wiki/entities/Hermes-Agent.md
  - docs/wiki/entities/LLM-Prompt-Skill.md
---

# VuePress Theme Hope Hermes JSON Converter

## 概述

Kimi K2.6 生成的 META Prompt，用于将 Hermes Agent 通过 `hermes sessions export --session-id xxx /home/ubuntu/output.json` 导出的会话 JSON 文件，转换为 VuePress Theme Hope v2.0.0-rc.107 兼容的 Markdown 格式。与 [[./VuePress-Theme-Hope-Markdown-Converter.md]]（`.docx` 输入）形成姊妹方案，专门处理 Hermes 导出格式。

## 输入输出

- **传入文件名**: `output.json`（Hermes Agent 导出会话 JSON）
- **输出文件名**: 用户指定（如 `004_Hermes-report.md`）；若未指定则使用 `0xx_Hermes-report.md` 占位
- **生成模型**: Kimi K2.6（已嵌入 META Prompt 中）

## 输入格式关键字段

Hermes 导出的 JSON 具有以下结构：

```json
{
  "id": "session_id",
  "title": "会话标题（LLM 自动生成）",
  "model": "使用的 LLM 模型名称",
  "source": "对话来源平台（discord / web）",
  "started_at": "ISO 8601 时间戳",
  "message_count": "消息总数",
  "tool_call_count": "工具调用总数",
  "messages": [
    {
      "id": "消息 ID",
      "role": "user | assistant | tool | session_meta",
      "content": "消息内容",
      "tool_calls": [...],
      "tool_name": "tool 消息对应的工具名称",
      "reasoning_content": "模型内部推理（须丢弃）"
    }
  ]
}
```

**轮次识别**：每个 `role="user"` 消息标志一个新 **Round** 的开始；一个 Round 内可能有多条 `assistant` / `tool` 消息形成工具调用链；`role="session_meta"` 消息**跳过不渲染**。

## 核心功能

1. **Frontmatter 自动推断**: 从 JSON 的 `title`、`started_at`、对话内容动态生成 `title` / `date` / `category` / `tag`
2. **Meta Info Block**: 在 Frontmatter 后插入 `>` 引用块，包含会话来源、session ID、模型、日期
3. **多轮对话保留**: 使用 `**User:**` / `**Hermes:**` / `---` 分隔符保持多轮结构，**去除用户名前缀**（如 `[Jeacson] xxx`）
4. **工具调用链折叠**: 使用 VuePress Theme Hope 原生 `::: details` 容器折叠 `tool_calls` 与对应 `tool` 消息；当工具结果 > 30 行时只保留前后 10 行 + `... (N lines truncated) ...` 占位
5. **手动 TOC**: 在文章开头添加锚点目录，标题从各轮 User 消息提炼
6. **推理内容丢弃**: 所有 `assistant` 消息的 `reasoning_content` 字段**完全不输出**到 Markdown
7. **数学公式**: KaTeX 兼容（行内 `$...$`，块级 `$$...$$`），LaTeX 命令正确转义

## 关键约束

- **禁止臆造**: JSON 中未提供的 Meta Info 字段标记为 `未指定`，不编造
- **禁止改语义**: 可精简冗余语气词，但不改变技术观点、公式、数据
- **禁止遗漏工具调用**: 任何 `tool_calls` 必须完整提取并折叠，不得跳过
- **禁止输出推理**: `reasoning_content` 不得出现
- **日期统一**: 全部使用 ISO 8601（`YYYY-MM-DD`）

## 与 .docx 转换器的关系

| 维度 | Markdown Converter（000） | Hermes JSON Converter（000X） |
|---|---|---|
| 输入 | `.docx`（LLM 对话导出的 Word） | `.json`（Hermes Agent `sessions export`） |
| 轮次识别 | Word 文档结构推断 | `role="user"` 标记识别 |
| 工具调用 | 无（Word 无 tool_call 字段） | `tool_calls` 数组 + `tool` 消息配对 |
| 折叠语法 | 不需要 | 必须用 `::: details` 折叠 |
| 推理内容 | 无（Word 不含） | `reasoning_content` 必须丢弃 |
| 用户名前缀 | 偶尔出现 | 高频出现（如 `[Jeacson] xxx`） |
| 元信息 | 手动填写 | 从 JSON `source` / `id` / `model` / `started_at` 动态提取 |

两者配合使用：日常 Q&A 用 `.docx` 转换器；Hermes Agent 多轮对话记录用 JSON 转换器。

## 适用场景

- 将 Hermes Agent 的多轮对话（含工具调用链、代码分析）记录结构化发布到 VuePress 博客
- 保留技术对话的完整上下文与工具调用细节
- 在折叠工具调用链的同时，让读者能聚焦于对话结论