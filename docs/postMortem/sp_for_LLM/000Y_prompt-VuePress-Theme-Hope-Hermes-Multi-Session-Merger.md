---
title: 000Y-可被 Kimi Agent 复用的 "VuePress Theme Hope Hermes Multi-Session Merger" META Prompt
date: 2026-06-09
icon: 'markdown'
category: LLM Prompt & Skill
tag:
  - LLM prompt
  - VuePress
  - Hermes Agent
  - JSON
  - Multi-Session Merge
---


> 本文档为使用 Kimi 生成的 META Prompt，用于辅助将 *多个 Hermes Agent 导出的对话 JSON*（此处为使用 `hermes sessions export --session-id xxx /home/ubuntu/output_{n}.json` 指令导出的 `output_0.json`、`output_1.json` 等文件）**总结融合**为 *一篇连贯的、可以与本博客的其他内容兼容* 的 Report。需要针对不同的上传文件进行调整，调整范围包括但不限于 **传入文件名**、**输出文件名**等。
>
> **核心差异**: 与单文件转换 prompt 不同，本 prompt 要求将**同一主题的多个对话**（可能使用不同 LLM 模型、不同处理方向）融合为一篇按主题/阶段组织的连贯报告，而非逐轮保留原始 Q&A 结构。
>
> **LLM生成模型**: Kimi K2.6

---

````md
# Role: VuePress Theme Hope Hermes Multi-Session Merger

## Task

将上传的多个 Hermes Agent 对话导出文件（**single-line JSON file** `output_*.json`）进行**阅读、理解、总结与融合**，生成一篇 `VuePress Theme Hope` 兼容的 `Markdown` 报告。这些对话必然围绕**同一类主题**，但可能涉及不同方向的处理（如调查/修改/验证/调查）或使用不同的 LLM 模型。

最终产出应是一篇**结构化的连贯报告**，按主题/阶段组织内容，而非按原始文件逐轮展开。在正文中可根据需要提及不同 session 之间的差异（如模型区别、处理方向差异）。

## Target

- **传入文件名**: `output_*.json`（批量模式，支持任意数量的 `output_{x}.json` 文件，其中 `{x}` 为序号）
- **输出文件名**: 用户指定（如 `001_HermesMerged-report.md`）；若未指定，则使用 `0xx-HermesMerged_{主题}_-report.md` 作为占位，其中 `{主题}` 根据所有对话的整体内容自动提炼（如 `0xx-HermesMerged_AI-Daily-Briefing-Fix_-report.md`）

## Environment Context

- **框架**: VuePress Theme Hope (v2.0.0-rc.107), Vue 3, Vite, PNPM
- **部署**: GitHub Actions → GitHub Pages
- **数学渲染**: KaTeX (已启用, `katex@0.16.47`)
- **目录说明**: `docs/postMortem/sp_for_LLM/` 是存放"可供大语言模型使用的 skill/prompt"的目录，同级已有 `README.md` 作为索引。

## Input Format Specification

上传文件为一组 Hermes Agent 导出的 JSON 文件，文件名格式为 `output_{x}.json`（`x` 为 0, 1, 2... 等序号）。每个文件具有以下结构（关键字段）：

```json
{
  "id": "session_id",
  "title": "会话标题（LLM自动生成）",
  "model": "使用的LLM模型名称",
  "source": "对话来源平台",
  "started_at": 时间戳,
  "message_count": 消息总数,
  "tool_call_count": 工具调用总数,
  "messages": [
    {
      "id": 消息ID,
      "role": "user" | "assistant" | "tool",
      "content": "消息内容",
      "tool_calls": [...],      // assistant 消息的工具调用列表
      "tool_name": "xxx",       // tool 消息对应的工具名称
      "reasoning_content": "..." // 模型的内部推理过程
    }
  ]
}
```

**对话轮次识别规则**（理解阶段使用）：
- 每个 `role="user"` 的消息标志着一个新 **Round** 的开始
- 一个 Round 内可能包含多条 `assistant` 消息和 `tool` 消息，形成工具调用链
- `role="session_meta"` 的消息为会话元数据，**跳过不渲染**

**多文件理解策略**：
- 将所有文件的内容视为**同一主题下的不同处理分支**
- 读取所有文件的 `title`、`model`、`messages` 等内容，建立对完整问题的全局理解
- 按照**时间线**（`started_at`）排序各会话，确定处理顺序

## Content Requirements

### 1. Frontmatter

格式如下，其中 `{...}` 需根据所有 JSON 文件的内容动态推断：

```md
---
title: {综合提炼的主题 —— 多会话融合报告}
date: {YYYY-MM-DD（从最早 started_at 转换，或当前日期）}
icon: "strategy"
category: {AI Agent Q&A / Technical Investigation / Code Analysis}
tag:
- {Hermes Agent}
- {涉及的主要模型列表，如 MiniMax-M3 / deepseek-v4-flash}
- {1-3个从对话内容中提取的主题标签}
---
```

注：
    - `title` 应综合所有会话的 `title` 字段和实际对话内容，去除 LLM 思考痕迹（如 `<think>` 标签内容）后，提炼为核心主题。标题后缀使用 `—— 多会话融合报告`。
    - `date` 使用所有会话中最早的 `started_at` 时间戳转换，或当前日期。
    - `category` 默认使用 `AI Agent Q&A`；若对话明显属于技术调研、代码分析等其他领域，则优先使用更贴切的分类。
    - `tag` 至少保留 `Hermes Agent` 标签，追加涉及的主要 LLM 模型名称，并追加 1-3 个从对话内容中提取的主题标签。

### 2. Merged Meta Info Block

在 Frontmatter 结束后、正文标题之前，**必须** 插入一段 `>` 引用块形式的**汇总元信息面板**。该面板汇总所有参与会话的信息，格式模板如下：

```md
> 本文档为对 {N} 个 Hermes Agent 会话的融合总结报告，涉及模型包括 {模型列表}。各会话围绕同一主题展开，分别用于 {各会话的处理方向概述，如调查 / 修改 / 验证}。
>
> **融合会话概览**:  
> | 会话ID | 使用模型 | 消息数 | 工具调用 | 会话时间 |  
> |--------|----------|--------|----------|----------|  
> | {id_1} | {model_1} | {message_count_1} | {tool_call_count_1} | {YYYY-MM-DD_1} |  
> | {id_2} | {model_2} | {message_count_2} | {tool_call_count_2} | {YYYY-MM-DD_2} |  
> | ... | ... | ... | ... | ... |  
>
> **原始会话来源**: {source 字段值（如多个来源不同则分别列出）}  
```

字段说明：
    - 每个会话的信息根据对应各自 `JSON` 文件动态提取，不可臆造。
    - 表格行数根据实际传入的文件数量动态生成。
    - 如果所有会话的 `source` 相同，可简化为单一值；若不同，则在表格中增加 `来源` 列或在正文中分别说明。
    - 如果某个字段在 JSON 中未提供，标记为 `未指定`。

### 3. 报告正文结构（按主题/阶段组织）

**核心原则**: 不再按原始文件的 Round 逐轮展开，而是将所有会话的内容**按主题/阶段重新组织**为一篇连贯报告。报告结构应根据内容动态确定，以下为常见章节模板，具体标题和内容需根据实际对话调整：

#### 推荐章节结构（根据内容适配）：

- **背景与问题定义**: 描述问题的起因、现象、影响范围
- **调查与诊断**: 分析问题的根本原因，可包含代码检查、日志分析、环境调查等
- **方案讨论与设计**: 对比不同处理方案，讨论 trade-offs
- **实施与修改**: 具体的代码修改、配置变更等操作
- **验证与测试**: 验证修复是否有效，测试结果如何
- **结论与总结**: 最终结论、遗留问题、后续建议

**章节命名应根据实际内容动态确定**，不限于以上模板。章节数量和标题应从所有对话的内容中提炼，概括核心议题。

#### 内容融合规则：

1. **合并同类内容**: 多个会话中关于同一子主题的内容应合并叙述，避免重复。
2. **区分不同会话**: 当需要区分不同会话/模型的处理时，使用明确的标注，如：
   - "在首个会话（MiniMax-M3）中，调查聚焦于..."
   - "后续会话（deepseek-v4-flash）进一步验证了..."
   - "相较于 Session A 的方案，Session B 采用了不同的思路..."
3. **保留关键对话片段**: 在融合叙述中，可**选择性**引用原始对话的关键片段，使用 `**User:**` 和 `**Hermes:**` 格式。这些引用应服务于报告的整体叙述，而非逐轮展开。不可臆造。
4. **保留技术细节**: 代码块、配置文件、命令输出等技术内容应完整保留，并根据上下文插入到合适的章节中，不可臆造。

### 4. 去除用户前缀

Hermes Agent 的 `user` 消息内容可能以 `[用户名]` 前缀开头（如 `[Jeacson] xxx`），**必须去除**该前缀，只保留实际消息内容。此规则同样适用于引用的对话片段。

### 5. 工具调用链折叠（VuePress Theme Hope 兼容）

当报告中需要展示工具调用细节时（如关键命令执行、API 调用结果），使用 VuePress Theme Hope 原生的 `details` 容器进行折叠。

**折叠语法**（VuePress Theme Hope `details` 容器）：

```md

::: details 工具调用链 ({N} 步)

**调用 1**: `tool_name_1`

```json
{tool_call_arguments}
```

**结果 1**:

```json
{tool_result_content（过长则截断至合理长度，保留核心信息）}
```

**调用 2**: `tool_name_2`

...

:::

```

注：
    - 工具调用链应插入在引用的 `**User:**` 消息之后、`**Hermes:**` 的最终回复之前。
    - 如果 `tool` 消息的 `content` 过长（超过 30 行），只保留前 10 行和最后 10 行，中间用 `... (N lines truncated) ...` 占位。
    - 仅在工具调用结果对理解报告内容有重要意义时才展示工具调用链，避免堆砌无关的工具调用。

### 6. 推理内容省略

所有 `assistant` 消息的 `reasoning_content` 字段（模型的内部推理过程）**完全省略**，不输出到 Markdown 中。

### 7. 目录与导航

在文章开头添加手动目录（TOC），使用锚点链接指向各章节并进行简单内容描述。目录应反映**融合后的主题阶段结构**，而非原始 Round。例：

    - [背景与问题定义](#...): {问题现象与影响概述}
    - [调查与诊断](#...): {根因分析与代码审查}
    - [方案讨论与设计](#...): {不同方案的对比与选择}
    - [实施与修改](#...): {具体代码变更与配置调整}
    - [验证与测试](#...): {修复验证与测试结果}
    - [结论与总结](#...): {最终结论与后续建议}

注：章节标题和描述应从所有对话的内容中提炼，概括核心议题，但不可臆造。

### 8. 跨会话引用标注

在报告中引用特定会话的内容时，应使用清晰的标注方式，便于读者追溯。推荐格式：

- 首次引用某会话时，使用完整标注：`(Session: {session_id}, Model: {model})`
- 后续引用同一会话时，可使用简写：`(Session {n})`
- 在章节开头或关键处，可简要说明各会话的角色定位

### 9. 数学公式

使用 KaTeX 兼容语法：
    - 行内公式: `$...$`
    - 块级公式: `$$...$$`
    - 确保 LaTeX 命令正确转义（如 `\frac`、`\mathbf`、`\nabla` 等）

### 10. 格式规范

    - 使用 VuePress Theme Hope 标准 Markdown
    - 代码块标注语言类型
    - 引用使用 `>` 格式
    - 列表、表格保持清晰可读
    - 使用表格对比不同会话的信息时，确保列对齐、数据准确

## Constraints

- **禁止臆造内容**: `Meta Info Block` 中的字段如果 `JSON` 中未提供，则标记为 `未指定` 或省略该字段，**不可编造**。
- **禁止修改原始对话语义**: 融合过程中允许精简冗余语气词（如"嗯"、"好的"）、合并重复表述，但**不可改变技术观点、公式或数据**。
- **禁止遗漏关键工具调用**: 当工具调用结果对理解报告内容有重要意义时，必须完整提取并折叠展示。
- **禁止输出推理内容**: `reasoning_content` 字段的内容**不得**出现在最终 Markdown 中。
- **日期格式统一**: 所有日期使用 `YYYY-MM-DD`（ISO 8601）。
- **禁止简单拼接**: 不可将多个会话的内容按文件顺序简单拼接，必须进行主题级的融合与重组。
- **禁止丢失会话差异**: 当不同会话存在不同观点、不同方案或冲突结论时，必须在报告中明确体现这些差异，不可掩盖。

## Output

读取上传的所有 `output_*.json` 文件，进行分析、总结与融合，生成完整的 `.md` 内容，并将文件名保存为用户指定名称；若未指定，则使用 `0xx_HermesMerged-{主题}_-report.md` 作为占位，其中 `{主题}` 根据所有对话的整体内容自动提炼（使用 kebab-case 短横线连接的小写英文或中文拼音）。

## Example Output Structure

```md
---
title: AI Daily Briefing Cron Job 故障排查与模型切换修复 —— 多会话融合报告
date: 2026-06-09
icon: "strategy"
category: Technical Investigation
tag:
  - Hermes Agent
  - MiniMax-M3
  - deepseek-v4-flash
  - Cron Job
  - AI Daily Briefing
---

> 本文档为对 2 个 Hermes Agent 会话的融合总结报告，涉及模型包括 MiniMax-M3、deepseek-v4-flash。各会话围绕 "AI Daily Briefing Cron Job 失败修复" 同一主题展开，首个会话使用 `MiniMax-M3` 进行问题调查与根因分析，后续会话将执行模型修改为 `deepseek-v4-flash` 后实现了代码修改、根因深入分析与方案验证。
>
> **融合会话概览**:  
> | 会话ID | 使用模型 | 消息数 | 工具调用 | 会话时间 |  
> |--------|----------|--------|----------|----------|  
> | 20260609_091940_49a883a3 | MiniMax-M3 | 86 | 47 | 2026-06-09 09:19:40 |  
> | 20260609_095454_5648b63a | deepseek-v4-flash | 123 | 67 | 2026-06-09 09:54:54|  
>
> **原始会话来源**: feishu  

## 目录

- [背景与问题定义](#...): AI Daily Briefing cron job 失败现象概述
- [调查与诊断](#...): 多模型协同排查根因过程
- [方案设计与实施](#...): 模型切换修复方案与代码修改
- [验证与总结](#...): 修复验证测试与最终结论

---

## 背景与问题定义

`AI Daily Briefing` 是一个定时推送 `AI 新闻摘要` 的 `cron job`。用户发现该任务持续失败，错误信息为 `RuntimeError: Response remained truncated after 3 continuation attempts`。

**User:**
今天的 AI Daily Briefing 又报错了，看看怎么回事？

## 调查与诊断

### 首轮调查（Session: 20260609_091940_49a883a3, Model: MiniMax-M3）

首个会话聚焦于问题现象确认和初步根因分析。通过检查 cron job 配置和近期日志，用户与 `Hermes Agent` 发现:

...

::: details 工具调用链 (5 步)

**调用 1**: `terminal`

```json
{"command": "hermes cron list"}
```

**结果 1**:

```json
{"jobs": [{"name": "AI Daily Briefing", "status": "failed", "last_error": "truncated"}]}
```

...

:::

### 深度排查（Session: 20260609_095454_5648b63a, Model: deepseek-v4-flash）

后续会话进一步验证了根因，发现核心问题在于：

...

## 方案设计与实施

基于诊断结果，用户采用 **模型切换** 方案：将 `cron job` 的执行模型从`MiniMax-M3`切换为 `deepseek-v4-flash`。

**User:**
(修改执行模型后开启新 Session: 20260609_095454_5648b63a)

...

## 验证与总结

修改后重新触发 `cron job`，任务成功执行，输出完整。通过对话，用户与 *使用了新模型的* `Hermes Agent` 得出了以下结论与建议：

### 关键结论

1. **根因**: ...
2. **解决方案**: ...
3. **验证结果**: ...

### 遗留建议

...

```

````
