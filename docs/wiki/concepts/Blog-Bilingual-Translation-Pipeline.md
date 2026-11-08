---
title: "博客全站英译与 EN 自动翻译链路 —— 可判定性、双闸门与状态推进"
description: "167 页英译工作量盘点、三轮样稿冻结口径、锚点 slugify 对齐、结构校验与渲染层双闸门，以及 state.json 驱动的每日翻译 cron"
type: concept
tags: [Translation, VuePress, Git, GitHub Actions, Cron Job, Idempotency, Hermes Agent]
related:
  - ../entities/Hermes-Agent.md
  - ../sources/PostMortem.md
  - ./Blog-Change-Detection-Layer.md
  - ./Briefing-Archive-Auto-Merge-Topology.md
created: 2026-11-08
updated: 2026-11-09
confidence: high
sources:
  - docs/postMortem/sp_for_LLM/007_Hermes-Bilingual-Translation-and-Wiki-Pipeline-Decoupling-report.md
---

# 博客全站英译与 EN 自动翻译链路

把「全站中文博客翻成英文」从一次性体力活，变成每天自己跑、失败不推进状态的 cron。真正的难点不在翻译本身，而在**可判定性**：只有能被脚本判定的规范才允许批量执行。

> 判断原话：「只要不把『写完中文顺手写 en』固化进内容流程，这次清完 167 篇之后还会继续积压。」

## 一、工作量盘点（不是估的）

基于 master `3ea10bb`（2026-11-05）的实际扫描：

```txt
docs/ 共 260 个 md
  ├─ 2 篇明确转载（isOriginal: false + source:）      → 排除
  ├─ 已有英文 91 个（88 篇 AI 简报 + about + 2 README）→ 不重做
  └─ 待译 167 页
```

| 分区 | 待译页数 | 中文字数 | 代码块 | 图片引用 |
|---|---|---|---|---|
| learningNote/Ros2_Note | 44 | 56,662 | 397 | 83 |
| postMortem | 27 | 55,998 | 236 | 36 |
| wiki | 47 | 26,935 | 43 | 0 |
| learningNote/vueNote | 14 | 17,205 | 131 | 4 |
| learningNote/Computer_Network | 11 | 14,328 | 2 | 35 |
| 其余（计组 / TypeScript / complain_diary / JSNote / coding_skill / 自控） | 24 | 16,527 | 102 | 10 |
| **合计** | **167** | **187,655** | **911** | **168** |

其中 17 篇是少于 80 字的索引页，真正的正文是 150 篇；清理掉不需要翻译的部分后口径为 **114 页 / 156,563 字 / ≈9.7 万英文词 / 868 个代码块**，最终实际落盘 115 篇。

真正影响工期的是翻译之外的四件事：

| 项目 | 规模 | 为什么麻烦 |
|---|---|---|
| 代码块 | 911 块 | 必须逐字节保留，只翻注释与给人看的字符串 |
| 图片 | 168 处 / 144 资产 / 72.5 MB | 复制、回指、搬 `public/` 三种方案各有代价 |
| 站内链接 | 275 条相对链接、152 处 `.html` | en 页照抄会把读者带回中文页 |
| 导航缺口 | 2 个 TS 文件 | `enSidebar.ts` / `enNavbar.ts` 里没有 postMortem，属代码改动 |

## 二、三轮样稿：每轮挑上一轮没覆盖的最难形态

样稿不是挑最容易的，而是刻意换难点，目的是把「口径」在批量之前钉死。

| 轮次 | 覆盖的难点 |
|---|---|
| 第一轮（3 篇） | 术语最密集 + 12 张图 + admonition + 跨页链接；步骤类长文 + 4 种语言代码块 + 页内锚点；纯论述引教科书 |
| 第二轮（3 篇） | 官方文档改英文原标题、`gif` 图、中文 fence 信息串；7 张截图 + 表格内全角括号链接；中文锚点跨页跳转 + 原文 API 拼写错误 |
| 第三轮（3 篇） | 四反引号嵌套 md 代码块；列表内缩进式代码块；数学 `$…$` ＋上下标密集，用行号映射脚本保证 token 字节不变 |

### 冻结下来的口径

| 项 | 定稿 |
|---|---|
| 文件树 | `docs/en/` 下同路径同名（中文文件名保留），相对链接因此自动生效 |
| frontmatter | 只译 `title`；中文 tag 保留原文不译；其余键原样（`icon/date/category/article/feed` 即使含中文也不动） |
| 代码块 | 翻注释 / docstring / 打印给人看的字符串 / fence 信息串；标识符、命令、路径、配置键、逻辑不动 |
| 图片 | 复制到 `docs/en/` 对应目录 |
| 术语表 | `.csv`，列 `term_zh,term_en,scope,status,note,source_page,updated`，`status` 分 `locked`/`draft`，**只在本机维护，不进仓库** |
| 语体 | 不作「去口语化」，保留原口癖与梗 |

## 三、可判定性：三条能跑 0 差异的规则

**1. 锚点用官方 `slugify` 对齐。** 先抓线上页面的 12 个 `id=` 实测校准，再装 `@mdit-vue/shared` 用它跑全站 1,255 个标题，与自研实现 **0 处不一致**。规则随之确定：

```txt
空格 / . / ? / ' / 全角标点 → -
em dash — 保留          ## X — Y  →  x-—-y
连续 -     折叠
标题以数字开头时前缀 _   1.Reflect → _1-reflect
```

**2. 术语表可增量维护。** 初期 150–250 条，浏览原文之后再定；同一术语出现三种译法就是因为没先定表。低置信或表外术语翻译后回写 `draft` 行。

**3. 容器句式按整句匹配。** 翻译声明容器的路径被批量替换破坏过一次（`)` 落到句号后、`)` 丢失、`at[here]` 少空格渲染成 "athere"），此后校验改成按整句式匹配：反引号、`[here]`、路径后必须紧跟 `).`，且路径先 URL 解码再查存在性。

## 四、结构校验全绿之后仍然崩的三类

115 / 115 篇过 `translation_check.py`（frontmatter 键、YAML 可解析、标题数、围栏数、图片存在、数学结构、残留中文、链接目标、锚点、容器路径）之后，仍然崩了三次：

| 崩法 | 现象 | 为什么结构校验看不见 | 修法 |
|---|---|---|---|
| YAML 冒号 | 23 个英文标题里的 `:` 未加引号，`js-yaml` 直接崩 | 脚本只查「键齐全」，不查值能否被 YAML 解析 | 整体加引号 |
| Vue 当成未闭合标签 | `Array<type>`、`"<type>variable"` 三处 ASCII 占位符让编译失败 | 源站用中文占位符，`.md` 层面完全合法 | 转义为 `Array\<type>`，并新增「正文出现 `<小写标签>` 就报错」的规则 |
| 数学宏丢失 | `compute_and_simutation.md` 丢了 `\it` | 旧的「数学令牌逐字节一致」规则把 `\text{中文}` 也判错，被迫放宽 | 判据改为「数学跨度数量 + LaTeX 命令集合一致」，`\text{}` 内散文允许翻译 |

> 教训：`✓ 115/115` 只证明「结构对得上」，不证明「能编译」。三个崩点全在「`.md` 合法、渲染层不合法」的缝里，所以闸门必须分两层——结构层（脚本）与渲染层（构建），而 1.9 GB 的机器上第二层只能由合并后的仓库 CI 兜底。

## 五、EN Translation Sync 的链路

```txt
monitor（en-sync-monitor.py）→ en-sync.py status（fetch + sha256 对比 state.json）
  → 输出不变 = idle → agent 不唤醒，零 token、零消息
  → 有变化 = 清单注入 prompt
      → 翻译 → en-sync.py finish
          → translation_check.py 闸门
          → 单 commit 推 wiki-ingest-<日期>-en
          → 成功才推进 state.json

exit 0 = 成功 / 3 = 结构校验失败（0 提交、state 不推进）/ 4 = push 失败（state 不推进）
```

`translation_check.py` 与 `en-sync.py` 的规则目前是两份实现（容器句式、锚点、图片路径各写一遍），是这套链路最容易漂移的地方。

## 六、两个「永久哑掉」的静默 bug

```txt
① en-sync.py status 只 git fetch，而 fetch 只更新 FETCH_HEAD，工作树仍停在前一天的 commit
   → 哈希是对旧树算的 → 永远报 idle
   修法：fetch 后 reset --hard FETCH_HEAD + clean -qfd docs/en

② sync_tree() 用不带 --verify 的 git rev-parse FETCH_HEAD
   → fetch 失败时把字面量 "FETCH_HEAD" 打到 stdout
   → 被当成合法 SHA 传给 reset --hard → unknown revision，整个 run 死掉
   修法：--verify --quiet + SHA 正则双校验；fetch 失败降级到当前工作树并输出 WARN
```

这两个 bug 的共同点是——**所有退出码都是 0**。无人值守链路的失效形态不是「报错」，而是「什么都没发生」，判据只能是「状态是否真的推进了」。同一族问题的完整分析见 [博客变更检测层](./Blog-Change-Detection-Layer.md)。

## 七、可复用的结论

1. 规范的价值不在「写得好不好」，而在「能否被脚本判定」；靠「我觉得对」的规范，批量之后都要逐篇返工。
2. 结构校验与构建验证是两层闸门，说「全部通过」时必须说清通过了哪一层。
3. 校验失败就 0 提交、状态不推进：闸门可以漏，但不能放行它没验证过的东西。
4. 推送凭据只有分支写权限，`gh pr create` 不可用，所以分支名必须落在仓库 Action 认的合法正则里（见 [AI 简报自动归档链路](./Briefing-Archive-Auto-Merge-Topology.md) 的同类约束）。
