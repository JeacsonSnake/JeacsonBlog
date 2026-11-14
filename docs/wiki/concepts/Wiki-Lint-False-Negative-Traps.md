---
title: "Wiki Lint 的三个「没报」—— stem 覆盖、index 不入链与方括号标签"
description: "wiki-lint.sh 三次谎报 critical 0 的根因与修复，链接语法从 wikilink 迁到标准 Markdown 的迁移顺序，以及拆页按语义缝而不是按行数"
type: concept
tags: [Wiki, Lint, Markdown, VuePress, DevOps, Hermes Agent]
related:
  - ../entities/Hermes-Agent.md
  - ../sources/PostMortem.md
  - ./Blog-Bilingual-Translation-Pipeline.md
  - ./Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md
created: 2026-11-08
updated: 2026-11-09
article: false
author: 'Hermes_Agent_cRl1_bot'
confidence: high
sources:
  - docs/postMortem/sp_for_LLM/007_Hermes-Bilingual-Translation-and-Wiki-Pipeline-Decoupling-report.md
---

# Wiki Lint 的三个「没报」

这套 wiki 的 lint 曾经连续几个月报 `critical 0`，而它其实看不到关键页面。三次谎报都不是「报错报错了」，而是**该报的没报**——检查器对自己数据模型的假设错了。

## 一、202 处不能点的链接

`~/.hermes/wiki/` 里 38 个页面共 202 处 `[[…]]` 风格的链接。三条实测证据说明它在这个站上毫无收益：

| 检查 | 结果 |
|---|---|
| 部署页 HTML | 仍是 3 处 `[[../concepts/…md]]` 纯文本，指向 sources 的 `<a>` 数量是 0 |
| 同站另一页的标准 md 链接 | 被 VuePress 渲染成 `<a class="route-link" href="…html">`，可以点 |
| 这个 mirror 是不是 Obsidian vault | 不是，没有 `.obsidian/`，backlink/graph 的收益也拿不到 |

原因：VuePress 不带 wikilink 插件，`[[…]]` 原样进 HTML；而且原来那种「路径 + 破折号 + 标签」的写法连 Obsidian 的别名语法都不是。模板是根源——`AGENTS.md` 的 `related:` 与索引模板都在示范旧写法，所以每次 ingest 都把旧格式写回来。

| 结果 | 数量 |
|---|---|
| 转成标准 md 链接 | 199 处（其中 145 处用破折号后的文案、1 处别名、53 处改用目标页 `title:`） |
| 指向从未创建页面 → 降级为纯文本 | 4 处（`defineProperty`、`数据响应式`、`自定义消息接口`、`可靠数据传输`） |
| `log.md` 反引号内的旧写法保留 | 3 处（是当时的报错引用，不是链接） |

**迁移顺序是不变量**：先改 lint 的正则（两种语法都能解析）→ 再迁 202 处内容 → 最后改模板。反过来做，中间会有一段时间「断链检查静默失效」。落地后新增 `legacy_wikilink` 警告：谁再写回旧语法就报出来——这条规则以前只写在文档里没人校验，这正是它反复出现的原因。

## 二、三个 bug，一个共同点：没报

### bug 1 — `index.md` 不算入链，两个孤儿是假的

orphan 统计只遍历 `pages`（concepts / entities / sources），`index.md` 不在集合里。于是 `sources/Computer_Composition.md` 与 `sources/Control_Theory.md` 明明列在首页 Sources 段，却长期挂在 orphan 里。修法：把 `index.md` 的出链也计入 `inbound`（仍跳过行内代码与自链接）。

### bug 2 — 标签里带方括号，整条链接消失

`[函数形参与实参 [补充]](…)` 这种标签会在 Markdown 里被提前解析断掉：标签变成 `函数形参与实参`，后面跟着一段字面文本。后果是该条目被判 `missing_from_index`——看起来是「没进索引」，实际是「链接根本没被识别」。修法：改标题文字，让标签里不出现方括号。

### bug 3 — 用 `stem` 当键，五个实体页从未被检查过

`wiki-lint.sh` 收集页面时：

```python
for sub in ("entities", "concepts", "sources", "queries", "comparisons"):
    for f in sorted((WIKI / sub).iterdir()):
        if f.suffix == ".md":
            pages[f.stem] = f      # 键是 "JavaScript"
```

`entities/JavaScript.md` 与 `sources/JavaScript.md` 的 stem 相同，先后写进同一个键；循环里 entities 在前、sources 在后，于是 source 永远赢，entity 页直接从 `pages` 里消失。本站恰好有五对同名域：JavaScript、Vue、ROS2、TypeScript、Computer_Network。

后果不是「少算一点」，而是这五个文件不参与任何一项检查：断链不报、`missing_from_index` 不报、frontmatter／页大小／陈旧日期从未检查、它们链出去的页面拿不到入链、`total_pages` 报 64 而实际 69。**最硬的证据**：链接迁移时剩下的 4 处死链，全部位于 `entities/Computer_Network.md`、`entities/JavaScript.md`、`entities/ROS2.md`、`entities/Vue.md`——四个都在被吞掉的实体页里。

修法三件事分开：`pages` 改按相对路径当键；另建 `stem -> [路径]` 映射专做链接解析；同名对不再静默取一个，而是输出 `stem_collision` info。

修完之后数字反而变差，这是对的：

| 指标 | 修前 | 修后 |
|---|---|---|
| `total_pages` | 64（少报 5） | **69**（entities 9 / concepts 51 / sources 9） |
| `partial_frontmatter` | 23 | **28** |
| `stale` | 26 | **29** |
| `critical` | 0 | 0 |

多出来的 5 个 partial、3 个 stale 全是那五个 entity 页——不是新问题，是**第一次被看见**。

> 教训：一个检查器长期报绿，要先枚举它到底遍历了哪些文件；改完检查器之后，最便宜的验证是造一个能触发的缺陷，看它会不会响。

## 三、拆页：按语义缝，不按行数

`wiki-lint.sh` 把超过 200 行标为 `oversized_page`（warning）。但行数只是**信号**，判据是「这条缝切开之后，两页能否各自独立回答一个问题」。

| 页 | 处理 | 理由 |
|---|---|---|
| `Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update`（247 行） | 拆：修复决策 132 行 + 新页 `Mihomo-IP-Pool-Drift-Diagnosis` 173 行 | 一次性取证过程 vs 可复用方案 |
| `AI-Daily-Briefing-Brotli-Fix-Investigation`（182 行） | 拆：修复页 78 行 + 新页 `Brotli-Stream-Truncation-Root-Cause` 129 行 | 处置动作 vs 五层根因 |
| `LeanCloud-to-Neon-Migration`（181 行） | 不拆 | 体量来自必须内联的约 65 行转换脚本，挪走会让读者两页来回跳 |
| `Ubuntu-gdm3-Disk-Full-Troubleshooting`（140 行） | 不拆 | 急救 8 步与根治 7 步是连读关系，切开等于把手册撕成两半 |

判错的代价是链接通胀：wiki 从 63 页推到 85+ 页、其中一半是人为切出来的碎片，检索反而更难定位。拆完要 grep 原文的标识符、数字、报错串在两页都能找到，再重跑 lint（`oversized` 归零、页数 +1）。

## 四、规范冲突时，先问哪一边更晚

收尾时发现 `AGENTS.md` 写 `sources` 与 `created` 可选，而 lint 按六项全必填检查。第一反应是「检查器比项目规范更严」，于是改 lint 让步；用户的澄清把因果翻了过来：

> 六项全必填是之后才定义的，草创时期（2026 年四五月）确实没考虑到那么多，后来才真正落实。现在这个修改也没问题，之后新加入的 blog 要遵守，之前的照原样就行。

所以不是检查器太严，而是**文档旧、代码对**。最终口径：新页必须六项齐全；老页不回改；`type: source` / `type: entity` 聚合页豁免 `sources`（一个领域上百篇笔记，硬填只能是编造）。

## 五、遗留

- `cross_folder` 38 处：wiki 页指向博客原文的跨目录链接，lint 只统计不校验。
- `stale` 34 页：`updated` 回填后反而变多——它们本来就很旧，只是第一次有值可算。
- `stem_collision` 5 条：现在是 info，若以后出现同名跨目录链接指错，需升级成 warning。
