---
title: Reverse Prompt Engineering & Prompt Compilation Pipeline
description: "反向提示词工程方法论与三 Session Prompt 编译管道 —— 从参考图片反推到风格可复用的最终图像 Prompt"
type: concept
created: 2026-06-05
updated: 2026-06-05
tags: [LLM, Prompt Engineering, Kimi, Multimodal, Image Generation, Architecture Diagram]
related:
  - docs/wiki/entities/LLM-Prompt-Skill.md
  - docs/wiki/concepts/VuePress-Theme-Hope-Markdown-Converter.md
sources:
  - docs/postMortem/sp_for_LLM/002_QA-inverse-prompt-engineering-report.md
---

# Reverse Prompt Engineering & Prompt Compilation Pipeline

## 概述

本概念页汇总 LLM 协助下的**反向提示词工程**（Reverse Prompt Engineering, RPE）方法论，以及将其工程化为**三 Session Prompt 编译管道**（Prompt Compilation Pipeline）的完整方案。核心问题：给定一张参考技术架构图，如何从中提取**风格不变量**，再与任意文献的方法论内容嫁接，生成同风格但内容可换的最终图像生成 Prompt？

适用场景：博客插图、研究步骤可视化、技术架构图复用。

## 核心方法论：四阶段反向提示词工程

### 第一阶段 — Image-to-Prompt（结构化反推）

上传参考图片给多模态 LLM（GPT-4o、Claude 3.5 Sonnet、LLaVA-1.6），要求**分层拆解**而非简单反推：

| 维度 | 反推内容 |
| --- | --- |
| 视觉风格 | Hand-drawn sketch / 数字 / 摄影 / 3D |
| 色彩方案 | 主色、辅色、背景色（指定 hex 值） |
| 构图布局 | 层级关系、模块划分、数据流向 |
| 元素类型 | 方框、箭头、字体、公式标注 |
| 内容结构 | 标题、分支命名、标注习惯 |
| 技术参数 | 分辨率、比例、渲染引擎 |

### 第二阶段 — Deconstruction（三层解耦）

将反推出的 prompt 拆为三层，**这是反向提示词工程的核心**：

```text
原始 Prompt = 风格层 (Style Layer) + 结构层 (Structure Layer) + 内容层 (Content Layer)
```

| 层级 | 处理方式 | 关键变量 |
| --- | --- | --- |
| **风格层** | 写死，不允许更改 | 笔触、配色、字体、风格关键词 |
| **结构层** | 保留框架，使用占位符变量 | `{TITLE}`、`{INPUT_NAME}`、`{STAGE_N_MODULES}`、`{FORMULA_BOX}`、`{OUTPUT_NAME}` |
| **内容层** | 完全替换为目标文献内容 | 研究主题、模块名称、公式、输出定义 |

### 第三阶段 — Content Grafting & Prompt 重组

将目标文献的方法论内容映射到结构层占位符中。生成重组后的 Prompt 文本时必须**显式标注映射理由**（即 `[JUSTIFICATION]` 标签），让每处填充都可审计。

### 第四阶段 — Verification & Iteration（风格一致性控制）

用 VLM 作为评判器反向验证：
1. **笔触风格**：手绘 vs 数字清晰？
2. **配色匹配**：蓝色色调是否一致？
3. **布局保真**：是否遵循原图的双阶段 pipeline？
4. **元素一致性**：方框、箭头、公式框是否同款风格？

常见偏差的修正方法：
- 生成图过于数字/扁平 → 在 Style Layer 加 `imperfect hand-drawn lines, slight wobble, paper texture`
- 颜色不对 → 指定具体色值 `#2E5C8A for borders, #1A1A1A for text`
- 布局混乱 → 坐标级描述 `Stage 1 top 40%, Stage 2 bottom 40%`
- 公式丢失 → 明确要求 `LaTeX-style handwritten formula in a rounded rectangle on the right side`

## Prompt 编译管道：三 Session 架构

将四阶段方法论工程化为可落地的**三 Session 编译管道**：

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  Session A  │───→│  Session B  │───→│   Session C     │───→│  Image Gen  │
│  风格模板器  │    │  内容编译器  │    │   最终优化器     │    │(DALL-E/SD)  │
│  Extractor  │    │  Compiler   │    │   Refiner       │    │  Renderer   │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
```

### Session A — Style Template Extractor（风格模板提取器）

**输入**：参考图片 + 反推指令
**输出**：带占位符的 **META Prompt**

关键约束：
- 风格层（Style Layer）必须写死，使用绝对化描述（"必须"、"只能"）
- 内容层（Content Layer）全部替换为 `{VARIABLE_NAME}` 占位符
- 结构层（Structure Layer）保留原图布局逻辑
- 加入 `[NEGATIVE CONSTRAINTS]` 防止图像模型生成装饰性元素

**反 LLM 幻觉指令**：
> "只描述你确实在图中看到的元素，不要推测。如果某个区域看不清，标注为 `[UNCLEAR]`。"

### Session B — Content Compiler（内容编译器）

**输入**：文献全文 + META Prompt + 研究方向约束
**输出**：**justified_prompt**（已填充 + 每处填充的合理性说明）

关键设计：`[JUSTIFICATION]` 标签让 LLM 做**语义对齐**而非简单字符串替换 —— 解释为什么这个文献概念对应这个视觉位置。

**阶段不匹配处理**：如果文献有 3 个阶段但 META Prompt 只有 2 个阶段，Session B 必须**重构结构**。META Prompt 可设计弹性占位符：
```text
{STAGE_N_MODULES}     // N 由 Session B 根据文献动态决定
{STAGE_DESCRIPTION}   // 解释阶段划分逻辑
```

**可选拆分**（文献过长时）：
- **Session B1（提取器）**：只读文献 → JSON 格式关键实体
- **Session B2（填充器）**：只读 JSON + META Prompt → justified_prompt
- 避免文献全文占用过多 token，挤掉风格模板

### Session C — Prompt Refiner（最终优化器）

**输入**：justified_prompt + 文献关键段落（用于校验准确性）
**输出**：**final_render_prompt**（直接喂给 DALL-E 3 / Midjourney / SD）

**注意边界**：Session C 输出的是**文本指令，不是图片本身**。真正的图像生成需另接渲染通道。

任务要求：
1. **内容保真**：不得修改任何文献概念、模块名称、公式
2. **风格强化**：追加风格锚点（Stylistic Anchor）如 `Hand-drawn marker sketch, slight stroke wobble`
3. **构图强化**：追加空间约束（Stage 1 top 40%, Stage 2 bottom 40%）
4. **负面提示词**：追加 `No photorealistic rendering, no 3D effects, no gradients`
5. **长度控制**：final_render_prompt 不超过 350 词

**模型适配**：
- **DALL-E 3**：保持自然语言描述，使用完整句子
- **Midjourney**：追加 `--style raw --ar 16:9 --v 6.1`，拆分为短标签
- **Stable Diffusion / FLUX**：保留标签化短句，逗号分隔

## 形式化总结：MVC 视角

该三 Session 管道本质上是软件工程中的 **MVC 架构**：

| 角色 | 类比 | 说明 |
| --- | --- | --- |
| **META Prompt** | View（视图模板） | 决定图片"长什么样" |
| **文献内容** | Model（数据模型） | 决定图片"是什么" |
| **justified_prompt** | Controller（控制器） | 决定内容"怎么放" |

## 工具链建议

| 步骤 | 推荐工具 |
| --- | --- |
| 反推 Prompt | GPT-4o / Claude 3.5 Sonnet / Kimi（多模态） |
| 生成新图 | Midjourney v6 (`--style raw`)、DALL-E 3、Excalidraw + AI 插件 |
| 保持风格 | Midjourney `--sref`（Style Reference）功能，上传原图作为风格参考 |
| 文献内容提取 | GPT-4o 文档解析，提取研究步骤、输入输出、核心公式 |

## 关键陷阱

1. **Session A 的幻觉**：LLM 可能添加图中没有的细节（"阴影效果"、"网格背景"）。务必手动删除。
2. **Session B 的阶段不匹配**：三阶段文献需合并为两阶段，单阶段需拆分预处理与核心计算。JUSTIFICATION 必显式说明映射逻辑。
3. **Session C 的公式截断**：DALL-E 3 对长 LaTeX 渲染能力有限。建议简化为概念性描述：
   - 长公式：`Attention(Q,K,V) = softmax(QK^T/sqrt(d_k))V`
   - 可简化：`handwritten formula: softmax attention equation with scaling factor`
4. **Midjourney 特殊语法**：长句理解较弱，必须拆分为短标签。

## 使用流程速查

| 步骤 | 操作 |
| --- | --- |
| 1 | 打开 LLM Session A → 粘贴 Session A Prompt + 上传参考图片 |
| 2 | 保存 Session A 输出 → 复制 `meta_prompt` 内的全部文本 |
| 3 | 打开 LLM Session B → 粘贴 Session B Prompt，将 META Prompt 和文献填入 |
| 4 | 保存 Session B 输出 → 复制 `justified_prompt` 全文 |
| 5 | 打开 LLM Session C → 粘贴 Session C Prompt，填入 `justified_prompt` |
| 6 | 获取 `final_render_prompt` |
| 7 | 喂给 DALL-E 3 / Midjourney / FLUX 生成图片 |

## 关联

- [[../entities/LLM-Prompt-Skill.md]] — LLM Prompt & Skill 实体（父级主题）
- [[../concepts/VuePress-Theme-Hope-Markdown-Converter.md]] — 同系列：VuePress 格式转换的 META Prompt
- [[../sources/PostMortem.md]] — sp_for_LLM 目录知识域摘要

## 核心文献

- *Prompt Inversion using chat-based multimodal LLMs* (2023)
- *CapRecover: Cross-Modality Feature Inversion Attack on VLMs* (2025)
- *Safety at Scale: A Comprehensive Survey of Large Model Safety* (2025)

## 关键心法

> 反向提示词工程不是"复制粘贴 prompt"，而是**建立风格与内容的解耦层**：
> 1. **先冻结风格层**（手绘、蓝色、双阶段布局）
> 2. **再注入内容层**（文献的研究步骤、公式、术语）
> 3. **最后用结构层作为胶水**（确保新内容适配原图的视觉语法）
