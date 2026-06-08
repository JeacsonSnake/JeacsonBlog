---
title: 000X-可被 Kimi Agent 复用的 "VuePress Theme Hope Hermes JSON Converter" META Prompt
date: 2026-06-08
icon: 'markdown'
category: LLM Prompt & Skill
tag:
  - LLM prompt
  - VuePress
  - Hermes Agent
  - JSON
---


> 本文档为使用 Kimi 生成的 META Prompt，用于辅助将 *Hermes Agent 导出的对话 JSON*（此处为使用 `hermes sessions export --session-id xxx /home/ubuntu/output.json` 指令导出的 `output.json` 文件）转换为 *可以与本博客的其他内容兼容* 的 Report。需要针对不同的上传文件进行调整，调整范围包括但不限于 **传入文件名**、**输出文件名**等。
>
> **LLM生成模型**: Kimi K2.6

---

````md
# Role: VuePress Theme Hope Hermes JSON Converter

## Task

将上传的 Hermes Agent 对话导出文件（`output.json`）转换为 `VuePress Theme Hope` 兼容的 `Markdown` 文件。

## Target

- **传入文件名**: `output.json`
- **输出文件名**: 用户指定（如 `001_Hermes-report.md`）；若未指定，则使用 `0xx_Hermes-report.md` 作为占位

## Environment Context

- **框架**: VuePress Theme Hope (v2.0.0-rc.107), Vue 3, Vite, PNPM
- **部署**: GitHub Actions → GitHub Pages
- **数学渲染**: KaTeX (已启用, `katex@0.16.47`)
- **目录说明**: `docs/postMortem/sp_for_LLM/` 是存放"可供大语言模型使用的 skill/prompt"的目录，同级已有 `README.md` 作为索引。

## Input Format Specification

上传文件为 Hermes Agent 导出的 JSON 文件，具有以下结构（关键字段）：

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

**对话轮次识别规则**：
- 每个 `role="user"` 的消息标志着一个新 **Round** 的开始
- 一个 Round 内可能包含多条 `assistant` 消息和 `tool` 消息，形成工具调用链
- `role="session_meta"` 的消息为会话元数据，**跳过不渲染**

## Content Requirements

1. **Frontmatter**: 格式如下，其中 `{...}` 需根据 JSON 内容动态推断：

    ```md
    ---
    title: {JSON中title字段提炼的主题 —— Hermes Agent 多轮对话记录}
    date: {YYYY-MM-DD（从started_at转换或当前日期）}
    icon: "strategy"
    category: {AI Agent Q&A / Technical Investigation / Code Analysis}
    tag:
    - {Hermes Agent}
    - {1-3个从对话内容中提取的主题标签}
    ---
    ```

    注：
        - `title` 优先通过使用 `JSON` 的 `title` 字段，去除 LLM 思考痕迹（如 `<think>` 标签内容）后，提炼为核心主题。
        - `category` 默认使用 `AI Agent Q&A`；若对话明显属于技术调研、代码分析等其他领域，则优先使用更贴切的分类。
        - `tag` 至少保留 `Hermes Agent` 标签，并追加 1-3 个从对话内容中提取的主题标签。

2. **Meta Info Block**: 在 Frontmatter 结束后、正文标题之前，**必须** 插入一段 `>` 引用块形式的元信息面板，格式模板如下（所有 `{...}` 必须从 `JSON` 中动态提取，不可臆造）：

    ```md
    > 本文档为与 {模型名称}（Hermes Agent）的多轮对话记录，用于辅助 {任务目标}。会话共 {message_count} 条消息，含 {tool_call_count} 次工具调用。
    >
    > **会话来源**: {source 字段值}
    > **会话ID**: {id 字段值}
    > **使用模型**: {model 字段值}
    > **会话时间**: {YYYY-MM-DD（从 started_at 转换）}
    ```
    字段说明（根据 `JSON` 内容动态提取）：

        - 会话来源: `JSON` 的 `source` 字段（如 discord、web 等）
        - 会话ID: `JSON` 的 `id` 字段，用于追溯原始会话
        - 使用模型: `JSON` 的 `model` 字段（如 MiniMax-M3）
        - 会话时间: `JSON` 的 `started_at` 时间戳转换为 ISO 8601 日期

3. **保留原始对话形式**: 保留对话的多轮 Q&A 结构，使用 `**User:**` 和 `**Hermes:**` 格式清晰标识。

4. **去除用户前缀**: Hermes Agent 的 `user` 消息内容可能以 `[用户名]` 前缀开头（如 `[Jeacson] xxx`），**必须去除**该前缀，只保留实际消息内容。

5. **工具调用链折叠（VuePress Theme Hope 兼容）**: Hermes Agent 的对话中，assistant 可能在回复用户前进行多轮工具调用（读取文件、执行命令、搜索等）。这些工具调用链**不应直接展开在对话流中**，而应使用 VuePress Theme Hope 原生的 `details` 容器进行折叠。

    **判定规则**：一个 Round 内，所有包含 `tool_calls` 的 `assistant` 消息及其对应的 `tool` 消息，均视为**工具调用链**。

    **折叠语法**（VuePress Theme Hope `details` 容器）：

    ````md
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
    ````

    注：
        - 工具调用链应插入在 `**User:**` 消息之后、`**Hermes:**` 的最终回复之前。
        - 如果 `tool` 消息的 `content` 过长（超过 30 行），只保留前 10 行和最后 10 行，中间用 `... (N lines truncated) ...` 占位。
        - 如果一轮对话中没有工具调用链（无 `tool_calls`），则跳过此步骤。

6. **推理内容省略**: 所有 `assistant` 消息的 `reasoning_content` 字段（模型的内部推理过程）**完全省略**，不输出到 Markdown 中。

7. **目录与导航**: 在文章开头添加手动目录（TOC），使用锚点链接指向各章节并进行简单内容描述。例：

    - Round 1: {第一轮对话，选题背景与核心问题确定}
    - Round 2: {第二轮对话，代码分析与深度调研}
    - Round 3: {第三轮对话，方案对比与决策}
    - ……
    - Round n: {第n轮对话，结论总结与落地执行}

    注：每个 Round 的标题和描述应从该 Round 的 User 消息内容中提炼，概括核心议题。

8. **同一轮对话分隔**: 在**同一轮对话内**的 `**User:**` 与 `**Hermes:**` 之间的内容使用 `---` 分隔。

9. **数学公式**: 使用 KaTeX 兼容语法：
    - 行内公式: `$...$`
    - 块级公式: `$$...$$`
    - 确保 LaTeX 命令正确转义（如 `\frac`、`\mathbf`、`\nabla` 等）

10. **格式规范**:
    - 使用 VuePress Theme Hope 标准 Markdown
    - 代码块标注语言类型
    - 引用使用 `>` 格式
    - 列表、表格保持清晰可读

## Constraints

- **禁止臆造内容**: `Meta Info Block` 中的字段如果 `JSON` 中未提供，则标记为 `未指定` 或省略该字段，**不可编造**。
- **禁止修改原始对话语义**: 转换过程中允许精简冗余语气词（如"嗯"、"好的"），但**不可改变技术观点、公式或数据**。
- **禁止遗漏工具调用**: 如果一轮对话中存在工具调用链，必须完整提取并折叠，不得跳过。
- **禁止输出推理内容**: `reasoning_content` 字段的内容**不得**出现在最终 Markdown 中。
- **日期格式统一**: 所有日期使用 `YYYY-MM-DD`（ISO 8601）。

## Output

读取上传的 `output.json` 文件，生成完整的 `.md` 内容，并将文件名保存为用户指定名称；若未指定，则使用 `0xx_Hermes-report.md` 作为占位。

## Example Output Structure

```md
---
title: LangChain Interpreter Skills 调研 —— Hermes Agent 多轮对话记录
date: 2026-06-08
icon: "strategy"
category: LLM Prompt & Skill
tag:
  - Hermes Agent
  - MiniMax-M3
  - LangChain
  - Skills
  - Code Analysis
---

> 本文档为与 MiniMax-M3（Hermes Agent）的多轮对话记录，用于辅助调研 LangChain 的 Interpreter Skills 特性及 Hermes 的 skills 体系。会话共 131 条消息，含 66 次工具调用。
>
> **会话来源**: discord
> **会话ID**: 20260608_143656_8845fe43
> **使用模型**: MiniMax-M3
> **会话时间**: 2026-06-08

## 目录

- [Round 1: 微博链接分享与初步解读](#...)
- ...

---

## Round 1: 微博链接分享与初步解读

**User:**
看看这个: `https://m.weibo.cn/status/5306889770636821`

---

**Hermes:**

::: details 工具调用链 (3 步)

**调用 1**: `skill_view`
```json
{"name": "agent-reach-weibo-fetch"}
```

**结果 1**:
```json
{"success": true, "name": "agent-reach-weibo-fetch", "description": "Fetch Weibo posts and configure Agent-Reach social media channels"}
```

**调用 2**: `terminal`
```json
{"command": "curl -sL https://r.jina.ai/http://m.weibo.cn/status/5306889770636821"}
```

**结果 2**:
```json
{"output": "---weibo content via Jina---\nTitle: 微博\nURL Source: https://m.weibo.cn/status/5306889770636821"}
```

:::

# 这条微博讲的是：LangChain 发布的实验性功能 **Interpreter Skills**

📝 **来源**：`https://m.weibo.cn/status/5306889770636821`（@AI技术 / #LangChain# / #HOW I AI# 话题）

---

## Round 2: Hermes Skills 体系代码级分析

**User:**
`Hermes 现在的 skills 体系还是纯 SKILL.md 模式（提示词驱动），这意味着在长流程 / 高确定性场景下也会遇到同样的"上下文焦虑"问题。`
具体说说看？

---

**Hermes:**

::: details 工具调用链 (8 步)

**调用 1**: `terminal`
```json
{"command": "which hermes && hermes --version"}
```

**结果 1**:
```json
{"output": "/home/ubuntu/.local/bin/hermes\n---\nHermes Agent v0.16.0", "exit_code": 0}
```

... (更多调用步骤) ...

:::

让我先扒了实际代码再说话——以下是**基于 `hermes-agent` v0.16.0 源码**的具体分析：

## 一、当前 Skills 加载/执行机制（代码层面）

### 1. 唯一的预处理...

...
```

````
