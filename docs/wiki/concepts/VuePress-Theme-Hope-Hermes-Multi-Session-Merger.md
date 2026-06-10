---
title: Kimi META Prompt — VuePress Theme Hope Hermes Multi-Session Merger
description: "将多个 Hermes Agent 导出的会话 JSON（output_0.json, output_1.json, ...）融合为单一连贯报告的 META Prompt 模板"
type: concept
tags: [LLM Prompt, VuePress, Markdown, Hermes Agent, JSON, Multi-Session]
date: 2026-06-09
related:
  - docs/postMortem/sp_for_LLM/000Y_prompt-VuePress-Theme-Hope-Hermes-Multi-Session-Merger.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Hermes-JSON-Converter.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Markdown-Converter.md
  - docs/wiki/entities/Hermes-Agent.md
  - docs/wiki/entities/LLM-Prompt-Skill.md
---

# VuePress Theme Hope Hermes Multi-Session Merger

## 概述

Kimi K2.6 生成的 META Prompt，用于将**多个** Hermes Agent 通过 `hermes sessions export --session-id xxx /home/ubuntu/output_{n}.json` 导出的会话 JSON 文件（`output_0.json`、`output_1.json` 等）**总结融合**为**一篇连贯的、按主题/阶段组织**的 VuePress Theme Hope v2.0.0-rc.107 兼容 Markdown 报告。与 [[./VuePress-Theme-Hope-Hermes-JSON-Converter.md]]（单文件 converter）形成姊妹方案，专门处理"同一主题、多方向处理、可能跨模型"的会话合并场景。

## 核心差异（vs 单文件 converter）

| 维度 | JSON Converter（000X，单文件） | Multi-Session Merger（000Y，多文件） |
|---|---|---|
| 输入 | `output.json`（单文件） | `output_0.json`, `output_1.json`, ...（批量） |
| 结构 | 逐 Round 保留原始 Q&A | **按主题/阶段重新组织**，不按 Round 展开 |
| 多模型 | 单一模型 | **可混合**（如 MiniMax-M3 + deepseek-v4-flash） |
| 多方向处理 | 单一方向 | 可包含调查/修改/验证等多个方向 |
| 章节命名 | 用户消息标题 | **根据所有会话内容动态提炼** |
| 元信息 | 单个 session Meta Info Block | **Merged Meta Info Block**（汇总表格） |

## 输入输出

- **传入文件名**: `output_*.json`（批量模式，支持任意数量的 `output_{x}.json`，`{x}` 为序号）
- **输出文件名**: 用户指定（如 `005_HermesMerged-report.md`）；若未指定则使用 `0xx-HermesMerged_{主题}_-report.md` 占位（`{主题}` 从所有对话整体内容自动提炼）
- **生成模型**: Kimi K2.6（已嵌入 META Prompt 中）

## 输入格式关键字段

每个 `output_{x}.json` 文件结构与 [[./VuePress-Theme-Hope-Hermes-JSON-Converter.md]] 的单文件输入完全一致，核心字段：

```json
{
  "id": "session_id",
  "title": "会话标题（LLM自动生成）",
  "model": "使用的LLM模型名称",
  "source": "对话来源平台",
  "started_at": "时间戳",
  "message_count": "消息总数",
  "tool_call_count": "工具调用总数",
  "messages": [
    {
      "id": "消息ID",
      "role": "user | assistant | tool | session_meta",
      "content": "消息内容",
      "tool_calls": [...],
      "tool_name": "工具名",
      "reasoning_content": "..."
    }
  ]
}
```

**多文件理解策略**：
- 将所有文件视为**同一主题下的不同处理分支**
- 读取所有文件的 `title` / `model` / `messages`，建立全局理解
- 按时间线（`started_at`）排序各会话，确定处理顺序

## 核心功能

### 1. Frontmatter（多会话动态推断）

```md
---
title: {综合提炼的主题} —— 多会话融合报告
date: {YYYY-MM-DD（最早 started_at 或当前日期）}
icon: "strategy"
category: {AI Agent Q&A / Technical Investigation / Code Analysis}
tag:
- Hermes Agent
- {涉及的主要模型列表，如 MiniMax-M3 / deepseek-v4-flash}
- {1-3 个主题标签}
---
```

### 2. Merged Meta Info Block（汇总元信息面板）

在 Frontmatter 后、正文标题前**必须**插入 `>` 引用块，汇总所有会话信息：

```md
> 本文档为对 {N} 个 Hermes Agent 会话的融合总结报告，涉及模型包括 {模型列表}。
> 各会话围绕同一主题展开，分别用于 {各会话处理方向概述}。
>
> **融合会话概览**:  
> | 会话ID | 使用模型 | 消息数 | 工具调用 | 会话时间 |  
> |--------|----------|--------|----------|----------|  
> | {id_1} | {model_1} | {message_count_1} | {tool_call_count_1} | {YYYY-MM-DD_1} |  
> | {id_2} | {model_2} | {message_count_2} | {tool_call_count_2} | {YYYY-MM-DD_2} |  
> | ... | ... | ... | ... | ... |  
>
> **原始会话来源**: {source 字段值}  
```

### 3. 报告正文结构（按主题/阶段重新组织）

**核心原则**：**不再按原始 Round 逐轮展开**，而是将所有会话的内容按主题/阶段重新组织为一篇连贯报告。

推荐章节结构（根据内容适配）：
- **背景与问题定义**: 描述问题起因、现象、影响范围
- **调查与诊断**: 分析根本原因（日志、代码、环境）
- **方案讨论与设计**: 对比方案、trade-offs
- **实施与修改**: 具体代码修改、配置变更
- **验证与测试**: 修复验证、测试结果
- **结论与总结**: 最终结论、遗留问题、后续建议

**内容融合规则**：
1. **合并同类内容**: 多个会话中关于同一子主题的内容合并叙述，避免重复
2. **区分不同会话**: 必要时显式标注，如「在首个会话（MiniMax-M3）中...」「后续会话（deepseek-v4-flash）进一步验证了...」
3. **保留关键对话片段**: 选择性引用原始对话片段，使用 `**User:**` / `**Hermes:**` 格式服务于整体叙述，不可臆造

### 4. 工具调用链折叠

与单文件 converter 一致，使用 `::: details` 容器折叠 `tool_calls` 与对应 `tool` 消息。

### 5. 推理内容丢弃

所有 `assistant` 消息的 `reasoning_content` 字段**完全不输出**到 Markdown。

## 关键约束

- **禁止臆造**: JSON 中未提供的 Meta Info 字段标记为 `未指定`，不编造
- **禁止跨会话臆造**: 不在合并叙述中加入任何会话中不存在的对话片段
- **禁止按 Round 展开**: 必须按主题/阶段重新组织，不逐轮保留原始 Q&A 结构
- **禁止遗漏工具调用**: 任何 `tool_calls` 必须完整提取并折叠
- **模型差异必须标注**: 不同模型/Provider 的处理需显式说明（如模型名括号标注）

## 适用场景

- Hermes Agent 跨会话的**调查 + 修复验证**类任务（先用模型 A 定位问题，再用模型 B 验证修复）
- 同一主题的**多方向研究**（如同时包含代码审查、性能测试、用户调研）
- **跨模型对比研究**（验证不同 LLM 对同一问题的处理差异）
- 大型故障的**多阶段事后分析**（问题现象 → 根因定位 → 修复实施 → 长期建议）

## 典型用例

[[./AI-Daily-Briefing-Brotli-Fix-Investigation.md]]（sp_for_LLM/005）是本 META Prompt 的首个实战案例：将 2 个会话（MiniMax-M3 调查 + deepseek-v4-flash 修复验证）融合为单一 Brotli 流截断故障报告。