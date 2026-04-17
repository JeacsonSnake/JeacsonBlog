# JeacsonBlog Wiki — AGENTS.md

这是 JeacsonBlog 个人知识库的 schema 文件。本仓库同时托管两个系统：

1. **VuePress 博客** (`docs/`) — 你亲手撰写的原始笔记，作为 source of truth
2. **LLM Wiki** (`wiki/`) — 由 LLM Agent 增量维护的知识层

---

## 仓库结构

```
JeacsonBlog/
├── docs/                          # VuePress 博客层（只读 source）
│   ├── wiki/                      # LLM Wiki 层（由 LLM 维护）
│   │   ├── index.md              # 维基总目录（LLM 维护）
│   │   ├── log.md                # 操作日志
│   │   ├── sources/              # 博客分类摘要（LLM 生成）
│   │   ├── entities/              # 实体页：主题/领域概览
│   │   └── concepts/              # 概念页：具体知识点
│   ├── learningNote/              # 学习笔记
│   │   ├── JSNote/               # JavaScript
│   │   ├── vueNote/              # Vue (VUE2 / VUE3)
│   │   ├── TypeScriptNote/       # TypeScript
│   │   ├── Computer_Network/     # 计算机网络
│   │   ├── Ros2_Note/            # ROS2 机器人操作系统
│   │   ├── coding_skill/         # 编码技术
│   │   ├── Principles_of_Computer_Composition/
│   │   └── Principles_of_Automatic_Control_Related/
│   ├── postMortem/               # 踩坑心得
│   └── complain_diary/           # 随笔
├── wiki/                          # LLM Wiki 层（由 LLM 维护）
│   ├── index.md                  # 维基总目录（LLM 维护）
│   ├── log.md                    # 操作日志
│   ├── sources/                  # 博客分类摘要（LLM 生成）
│   ├── entities/                  # 实体页：主题/领域概览
│   └── concepts/                  # 概念页：具体知识点
└── AGENTS.md                    # 本文件
```

---

## 三个层次

### Raw Sources (`docs/`)

你的原始笔记目录。只读——LLM 永远不修改这里的内容。

笔记 frontmatter 格式示例：

```yaml
---
title: Reduce 方法
category:
  - JavaScript
  - Web
tag:
  - JavaScript
  - advanced
---
```

**category** 目前包括：`JavaScript`、`Web`、`Computer`、`robot`、`ROS`、`Network`、`VUE`、`Skill` 等。

### The Wiki (`wiki/`)

LLM 全权负责的层。它在这里创建、更新、交叉引用。

**子目录职责：**

- `wiki/sources/` — 对应博客每个分类的摘要页。由 LLM 阅读对应 `docs/learningNote/<category>/` 下的所有笔记后生成/更新。每个文件代表一个知识域的整体概览。
- `wiki/entities/` — 实体页。主题/领域级别的聚合，如 `JavaScript.md`、`ROS2.md`、`Vue.md`。从对应的 source 页派生，关联多个相关概念。
- `wiki/concepts/` — 概念页。具体知识点的深度页面，如 `Reduce方法.md`、`话题通信.md`、`坐标变换.md`。通常对应一篇或多篇源笔记的核心内容提炼。
- `wiki/index.md` — 整个 wiki 的总目录。LLM 每次 ingest 后必须更新。
- `wiki/log.md` —  append-only 操作日志。格式：`## [YYYY-MM-DD] <action> | <description>`。

### Schema（本文件）

即 `AGENTS.md`，你正在读的这个文件。它告诉 LLM 如何维护 wiki——维护哪些文件、遵循什么约定、新增内容时怎么做。

---

## 核心操作

### Ingest（新笔记或更新）

当 `docs/` 下有新笔记或笔记有重要更新时：

1. **阅读源文件**：完整读取 `docs/learningNote/<category>/<file>.md`
2. **判断影响范围**：
   - 如果是全新领域 → 创建 `wiki/sources/<category>.md`
   - 如果是已有领域 → 更新对应的 `wiki/sources/<category>.md`
3. **提炼概念**：从源文件中提取关键概念，检查 `wiki/concepts/` 是否有对应页面：
   - 有 → 更新，补充新信息，标注矛盾
   - 无 → 创建 `wiki/concepts/<concept-name>.md`
4. **更新实体**：检查 `wiki/entities/` 中的相关实体页，更新关联
5. **更新 index.md**：将新页面加入总目录
6. **记录 log**：在 `wiki/log.md` 追加 `## [YYYY-MM-DD] ingest | <source file>`

### Query（查询）

当需要结合博客知识回答问题时：

1. 先读 `wiki/index.md` 找到相关页面
2. 深入阅读相关 source、entity、concept 页面
3. 如需更深细节，再去 `docs/` 读对应源笔记
4. 给出回答，并询问是否需要将回答沉淀为新的 concept 页

### Lint（健康检查）

定期（当你要求时）执行：

1. 检查 `wiki/concepts/` 中是否有孤立页面（无 inbound link）
2. 检查是否有页面引用了已删除/移动的源笔记
3. 检查 `wiki/sources/` 和对应 `docs/` 是否还有同步（源删了但 summary 没更新）
4. 检查 index.md 是否与实际页面一致
5. 将问题汇报给你

---

## 文件格式约定

### Wiki 页面 frontmatter

```yaml
---
title: <页面标题>
description: <简短描述，1-2句话>
type: source | entity | concept
tags: [<topic1>, <topic2>]
sources: [<相关的 docs/ 路径>]   # 仅 entity 和 concept
related:
  - "[[../concepts/xxx]]"
  - "[[../entities/xxx]]"
lastUpdated: <YYYY-MM-DD>
---
```

### index.md 格式

```markdown
---
title: JeacsonBlog Wiki Index
---

# JeacsonBlog Wiki

## Sources（知识域摘要）
- [[./sources/JavaScript.md]] — JavaScript 核心概念与 API 笔记
- [[./sources/ROS2.md]] — ROS2 机器人操作系统笔记
...

## Entities（实体/主题）
- [[./entities/JavaScript.md]] — JavaScript 语言
- [[./entities/ROS2.md]] — ROS2
...

## Concepts（具体概念）
- [[./concepts/Reduce方法.md]] — Array.reduce() 详解
- [[./concepts/坐标变换.md]] — 坐标变换原理与 ROS2 实现
...

## 最近更新
<!-- 引用 log.md 最后 5 条 -->
```

### log.md 格式

```markdown
---
title: Wiki Log
---

## [2026-04-17] ingest | docs/learningNote/JSNote/Reduce方法.md
## [2026-04-17] lint | 健康检查完成，无矛盾
```

---

## 与 VuePress 的关系

Wiki 目录 (`wiki/`) 会被 VuePress 作为普通 Markdown 页面渲染，所以：

- `wiki/index.md` → 访问 `/wiki/` 或 `/wiki/index.html`
- `wiki/sources/JavaScript.md` → `/wiki/sources/JavaScript.html`
- 内部链接使用标准 Markdown：`[text](./sources/JavaScript.md)`

Sidebar 已配置好，会显示 wiki 的目录结构。

---

## 关键原则

1. **docs/ 是只读的**。LLM 永远不修改 `docs/` 下的任何文件。
2. **Wiki 是增量维护的**。每次 ingest 不要重写整个文件，要做增量更新。
3. **Log 是 append-only 的**。不要删除或修改历史 log 条目。
4. **Ingest 前先读 index.md 和 log.md**，了解 wiki 当前状态。
5. **Wiki 页面要有 inbound links**。创建新 concept 时，检查相关 entity 和 source 是否需要添加 link。
6. **当 docs/ 有笔记被删除时**，同步清理 wiki 层中 orphaned 的页面或引用。

---

*本文件由 LLM 和你共同维护。随着 wiki 演化，你可能会调整本 schema 的内容。*
