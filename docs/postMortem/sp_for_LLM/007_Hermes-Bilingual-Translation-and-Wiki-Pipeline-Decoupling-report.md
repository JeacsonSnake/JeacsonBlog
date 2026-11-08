---
title: 007-把博客翻译交给自动化链路 —— 盘点、检测层与一直在说「没事」的检查
date: 2026-11-08
icon: "diagram-next"
category: Technical Investigation
tag:
  - AI Agent
  - Hermes Agent
  - VuePress
  - 翻译管线
  - Cron Job
  - GitHub Actions
  - Wiki
  - Lint
  - 幂等与状态机
---

> 本文档是对 2026-11-05 15:03 至 2026-11-06 21:21（约 30 小时、两个连续会话）工作的完整复盘：把"全站中文博客翻成英文"从一次性体力活变成每天自己跑的 cron，再把"读博客"这件事从原先的 RSS简报 job 里拆成一个独立检测层，最后用它测试时顺带做了一次 wiki 知识库的覆盖治理。
>
> 三条主线看起来是三件事，其实是同一个问题的三个面：**当一条链路开始无人值守地写东西时，用户需要的不一定是一个"最聪明的模型"，而是一个可判定的状态、可回归的闸门，以及一个不会静默失败的检测器。**
>
> ---
> 大部分内容由 Hermes Agent 基于会话整理，我只做事实性的核查与修改，因此存在前后人物名称指代不一的情况【例如 “我/用户”指的是同一个人在不同叙述逻辑/视角（笔者自己/ Hermes Agent）下的称呼】。读者亦可以使用 AGENT 读取反刍后再阅读。本文中不保证一定不存在逻辑前后不一的现象，还请读者注意（鞠躬）
>
> ---
> **参与会话概览**:
>
> | 会话 | 使用模型 | 会话时间（CST） | 消息数 | 角色 |
> |------|----------|----------|--------|------|
> | 会话A | deepseek-flash | 11-05 15:03 → 11-06 11:14 | 815 | 全站英译：盘点、样稿、批量翻译、构建修复、自动化与交接 |
> | 会话B | deepseek-flash | 11-06 11:29 → 11-06 21:21 | 1220 | 检测层解耦、链接语法迁移、wiki 覆盖治理与三处 lint 谎报 |
>
> **原始会话来源**: Hermes Agent
>
> **主题关键词**: 全量翻译, 术语表, 锚点 slugify, 构建闸门, sha256 状态清单, 检测层, consumer, cursor, 幂等, lint, stem 冲突, 页面拆分

## 目录

- [背景与问题定义](#背景与问题定义): 两个需求、目标拓扑与作业对象
- [第一阶段：英译工作量盘点](#第一阶段英译工作量盘点): 页面盘点与翻译之外的真实工作量
- [第二阶段：三轮样稿与口径冻结](#第二阶段三轮样稿与口径冻结): 九篇样稿与三次拍板
- [第三阶段：批量翻译与构建级失败](#第三阶段批量翻译与构建级失败): 校验全绿之后的三种崩法
- [第四阶段：交付与自动化的静默失败](#第四阶段交付与自动化的静默失败): 三个 PR、一个 cron、一个永远 idle 的 bug
- [第五阶段：检测层解耦](#第五阶段检测层解耦): 一个检测器、两个消费者与四个 job
- [第六阶段：链接语法与知识库覆盖](#第六阶段链接语法与知识库覆盖): 死文字与缺口
- [第七阶段：三个谎报的检查与页面拆分](#第七阶段三个谎报的检查与一个页面的拆分): lint 脚本看不见的文件
- [第八阶段：口径之争与收尾](#第八阶段口径之争与收尾): 当规范与代码不一致时
- [深度技术分析](#深度技术分析): 不变量、静默失败、闸门边界与可见性
- [结论与后续建议](#结论与后续建议): 关键结论与遗留债
- [附录：关键对象索引](#附录关键对象索引): PR、commit、job、脚本、指标

---

## 背景与问题定义

我的博客 `blog.jeacsonsnake.com` （就是你现在在访问的这个）是一套 VuePress 站点，中文树 `docs/` 下有wiki（一个基于 Karpathy 式的 LLM Wiki）、 learningNote（ROS2、Vue、计网、计组、TypeScript、JS等学习内容）、postMortem（部署、踩坑、基于 LLM 的问答/汇报等长报告内容）等分区。虽然我做了中英文双语的分列，但是有好几年的时间其并没有实际相关内容产出，仅存在引导至中文页面的相关描述。之前通过改造唯一存在的英文内容是从十月份开始的 AI 日报归档区（88 篇，由既有的 bilingual 归档 cron 每天维护），其余全是中文。

::: note
关于 AI 日报归档区，你可以参考[之前的文章：006-AI 日报自动归档链路打通 —— merge-base 不变量、双重分支保护与 GitHub App bypass 的多坑排查](./006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.md)
:::

因此我希望把文档补上，也就是将原来的文章做下翻译：

> **User:** 我需要将我博客里面所有的文章（除了转载的文章以外）翻译为英文。帮我评估下在目前的工作流下具体的工作量，包括翻译文章总数等。

当然"翻译"这件事如果只做这么一次，它就会再次积压，所以 Hermes Agent 在评估阶段写下了这个判断：

> 只要不把"写完中文顺手写 en"固化进内容流程，这次清完 167 篇之后还会继续积压。

换句话说，这两天所做的事情，目标是"在把原来的博客翻译完之后，还要有一个每天自己跑的自动化链路"：

> **User:** 现在我需要你将上述做的内容固化为一个 cronjob，希望该 job 做到：当 wiki-ingest 发现有相关更新时，如果更新的博客在上述规定路径下，就将其翻译并推送至“/en/” 路径下。当出现了特定术语时，需参照术语表进行翻译；当术语不存在于术语表，或者该术语在术语表中的描述与实际含义的重叠程度为低置信度时，需要将其翻译并记录至术语表进行维护。请你评估并作出方案。

等到隔天上午，我意识到如果时间相近的每一个JOB做一次都需要同步一次信息的话，实际是会产生资源浪费的。于是我将需求又向前推了一步：

> **User对会话A:** 我实际更建议看能不能一个监控触发两个job，一个做 wiki-ingest，另一个做翻译。不（是说）需要放在一个PR里面传，只是说这样的触发更符合工程直觉。试着评估下？
>
> **整理会话A相关信息后，User汇总给会话B:** 我需要你解耦 blog 的读取，使得 wiki-ingest 和 en-translate 可以同时在 blog 变化时做出修改。因为之前是使用 RSS 进行读取的，现在希望亦能适用 RSS，针对不同的部分适应不同的规则以作 wiki-ingest 和翻译。

也就是说，我希望**同一份**"博客变了"的信号，能够同时喂给**两个**规则并不相同的下游。

### 目标拓扑（最终形态）

```txt
06:35  RSS News Scan (1a35ce6480fe)      只出新闻简报 → discord + feishu（每天必跑，无门控）
06:45  Wiki Mirror Sync (88f4438fe179)   只同步 ~/.hermes/wiki/ 镜像，静默，成功零输出
06:50  Wiki Ingest Sync (60c0fa9fb699)   monitor 门控 → 取原文 → 写 wiki → lint 脚本闸门 → push → ack
07:25  EN Translation Sync (a28fbd4255a2) monitor 门控 → 翻译 → 结构校验 → push → state 推进

                 ┌──────────────────────────────────────────┐
                 │           blog-change-detector           │             唯一读取层
                 │        tree(gh api) + rss(sqlite)        │
                 └───────────────────────┬──────────────────┘
                             ┌───────────┴───────────┐
                  consumer=wiki                 consumer=en
                  docs/wiki/**                  docs/en/**                两个执行 job / consumer
                  wiki-ingest-<日期>-x          wiki-ingest-<日期>-en
                  → PR ①（等 User merge）       → PR ②（等 User merge）
                             └───────────┬───────────┘
                       master push → Build_and_Deploy → 站点              同一套部署方式
```

### 几个"看着可以简化、其实不能动"的设计点

| 设计点 | 设计思路 |
|---|---|
| 使用 “一个 detector + 两个 consumer”，而不是“一个 monitor 触发两个 job” |  Hermes 的定时任务（cronjob）基于时间运行，使用 cronjob 做 monitor 无法启动别的 job，因此只能负责把关。收益不在省调度，而在统一检测口径 |
| 两个 consumer 各拿各的 cursor | wiki 用 `path→blob` ledger、`ack` 才推进；en 直接用 `state.json` 的 sha256、push 成功才推进。共用一个 cursor 会让两条链路互相吞掉对方的进度 |
| wiki 用 RSS + tree 合并，en 主源是 git | RSS 只能告"有新文"，看不见改稿、也不给全文；git tree 一次 `gh api` 就能看 new/modified/deleted。反过来 gh/代理一挂 git 就全瞎，而 RSS 不依赖它们 |
| 将 mirror 同步单独建为一个 job | ingest 受 monitor 门控，没有文章的日子它根本不醒；而 `~/.hermes/wiki/` 同时是"我以前写过 X 吗"的查询缓存，只挂在 ingest 里会变旧 |
| 检测用 sha256 清单，不用 `git diff old..new` | clone 是 `--depth 1`，上一轮的 SHA 不在本地，range diff 会直接失败 |
| 一次 push 只能有一个 commit | 仓库 `docs.yml` 的 PR 标题取 `git log -1 --format=%s`、正文取 `%b`；多 commit 会被 warning，且正文只反映 HEAD |
| 校验失败就 0 提交、state 不推进 | 分支上不跑构建（`Build_and_Deploy` 只在 master 上跑），PR 上没有任何 CI 绿灯；唯一的把关就是本机闸门 |

::: info 关于 RSS 的思考
之前定义使用 RSS 作为博客更新侦测器的意义在于不需要读取 git 也能知道新博客有没有发出，比较适合订阅了的朋友，但是没考虑到说，由于我的博客是一个网站，其实际上针对文本进行更新的便利程度会高于实际的文章杂志。如果是实际的文章杂志，一旦文章出现了错误是需要等待下一次出刊才可以通过新文章提出而进行修订，存在着延时性；但是我的博客结构是允许我在原博客文章基础上进行修改的，存在有“因为原文章修改但是没被 wiki 读取到” 的可能性。直接读取 git 和使用 RSS 两种方法到底孰优孰劣，以及这里是否要改造 “使用 RSS 读取博客文章” 这一方法以避免上述情况，皆还有待商榷。
:::

### 作业对象

| 属性 | 值 |
|---|---|
| 仓库 | `JeacsonSnake/JeacsonBlog`（public），VuePress 站点 `blog.jeacsonsnake.com` |
| 中文树 → 英文树 | `docs/**` → `docs/en/**`（**除多一层 `en/` 外树结构不变，中文文件名也不改**） |
| 推送凭据 | SSH deploy key（推分支）；上游 Action 的 `Create_LLM_Relate_Pr` 自动开 PR（作者 `github-actions[bot]`） |
| 本机 API 身份 | Hermes Agent `Hermes-cRl1` fine-grained PAT（**只读**：`gh pr create` 报 `Resource not accessible`） |
| 状态文件 | 一个 wiki。一个 en |
| 规则文件 | `rules.json`（改规则不用改代码） |
| 机器约束 | 1.9 GB 内存 / 2 核，全站 `docs:build` 必然 OOM |

---

## 第一阶段：英译工作量盘点

盘点基于 master `3ea10bb`（11-05 11:15）的实际扫描，不是估的：

```txt
docs/ 共 260 个 md
  ├─ 2 篇明确转载（isOriginal: false + source:）     → 排除
  ├─ 已有英文 91 个（88 篇 AI 简报 + about + 2 README）→ 不重做
  └─ 待译 167 页
```

| 分区 | 待译页数 | 中文字数 | 约合英文词数 | 代码块 | 图片引用 |
|---|---|---|---|---|---|
| learningNote/Ros2_Note | 44 | 56,662 | ≈35,100 | 397 | 83 |
| postMortem | 27 | 55,998 | ≈34,700 | 236 | 36 |
| wiki | 47 | 26,935 | ≈16,700 | 43 | 0 |
| learningNote/vueNote | 14 | 17,205 | ≈10,700 | 131 | 4 |
| learningNote/Computer_Network | 11 | 14,328 | ≈8,900 | 2 | 35 |
| learningNote/计组 | 2 | 4,800 | ≈3,000 | 1 | 6 |
| learningNote/TypeScriptNote | 6 | 4,699 | ≈2,900 | 65 | 0 |
| complain_diary | 6 | 4,157 | ≈2,600 | 0 | 0 |
| learningNote/JSNote | 7 | 2,401 | ≈1,500 | 36 | 0 |
| 其余（coding_skill、自控原理） | 3 | 470 | ≈290 | 0 | 4 |
| **合计** | **167** | **187,655** | **≈11.6 万词** | **911** | **168** |

其中 17 篇是少于 80 字的索引/README 页，真正的正文是 150 篇。

在清理一部分不需要翻译的文章之后，合计的口径最终变成：

```txt
114 页 / 156,563 字 / ≈9.7 万英文词 / 868 个代码块 / 168 处图片引用
```

（最终实际落盘 115 篇，差值见第三阶段。）

::: tip 真正影响工期的其实不是翻译

除翻译之外，以下列出了一些真正影响工期的部分：

| 项目 | 规模 | 为什么麻烦 |
|---|---|---|
| 代码块 | 911 块 | 必须逐字节保留，只能翻注释与外层说明——最容易出错，也最需要校验 |
| 图片 | 168 处 / 144 个资产 / 72.5 MB | 要么复制资产目录（仓库体积翻倍），要么回指中文目录（路径很丑），要么搬 `public/`（要改 111 篇中文页，并且之后的引用亦比较麻烦） |
| 站内链接 | 275 条相对链接、152 处 `.html` | en 页若照抄，会把读者带回中文页 |
| 导航缺口 | 2 个 TS 文件 | `enSidebar.ts` / `enNavbar.ts` 里**没有 postMortem**的导航，要让它们显示得先改配置——这是代码改动，不是翻译 |
| frontmatter | 167 份 | 只译 `title`；`icon/date/category/article/feed` 一律不动（即使存在中文） |
| 术语表 | 初期 150–250 条 | 在浏览原文之前不先定，因为同一术语会出现三种译法 |
| PR 拆分 | 3 个 | 167 个文件不可能一个 PR 塞完 |

工期：按"每批 8–12k 字、5–6 个 subagent 并发"算是 19 批、机器侧 1.5–3 小时。并且如果完全细看，真正耗时的是验收——假设抽样验收需要 2–3 天，而逐篇审阅需要 3–4 周（11.6 万词 ≈ 一本 350 页技术书，专业译者 2,500 词/天要约 46 人日）。

:::

---

## 第二阶段：三轮样稿与口径冻结

这一阶段我分三轮让 Hermes Agent 分别做了九篇样稿。这里用的方法值得单独说：**样稿不是挑最容易的，而是每轮都挑上一轮没覆盖到的最难形态。** 九篇样稿分三轮，每轮都换一批"难点"。

### 第一轮：三种最难的形态

| 样稿 | 来源 | 为什么选它 |
|---|---|---|
| 01 | [来源一](../../learningNote/Ros2_Note/co_me_2/2025_04_13.md)（790 字） | 术语最密集 + 12 张图 + 3 个 admonition + 跨页链接 + 存在个人口癖 |
| 02 | [来源二](../deploy/005_leancloud_migrate_neon_relate.md)（751 字） | 步骤类长文 + 4 个不同语言的代码块 + 页内锚点 |
| 03 | [来源三](../../learningNote/Computer_Network/什么是SMTP.md)（1,510 字） | 纯论述、无代码、引教科书，最考验如何翻译得"读起来像人写的" |

自检不是目测：三篇的代码块数、图片路径、标题层级、frontmatter 键全部与中文版比对；02 的 diff 显示只动了注释、docstring 和 `print()` 里的中文，逻辑零改动。

三个拍板点被提出：代码块内中文要不要翻、图片怎么处理、特定情境下的术语翻译。用户的回答把口径钉死了：

> **User:** 节点表 译成 node graph, 这里的节点表是由 rqt_graph 内 Plugins → Introspection → Node Graph 的选项卡翻译而来；图片复制一份到 docs/en/ 的对应文件夹下，除了多出 en/ 之外文件树结构不作大变化；代码块里的中文要翻。翻注释 + 翻会打印给人看的字符串；标识符、命令、路径、配置键一律不动。

同一轮还追加了四条长期规则：

 1. 引用中文教材/文献时**若有英文原文则直接用原文**（例：`'Computer Networking: A Top-Down Approach' (James F. Kurose and Keith W. Ross, Seventh Edition, 2017)`）；
 2. 术语表用可增量维护的 `.csv`；
 3. 不作"去口语化"、保留原有口癖；
 4. 每篇文末加翻译声明用的提示容器。

::: info 关于翻译声明用的提示容器
在统一格式之后，其最终确认的格式如下：

> This article was translated by `Hermes Agent`; the original text can be found at [here]({{original_Chinese_blog_file_relative_location}}). The translation is for reference only.
> Translation time: {{YYYY-MM-DD}}

:::

### 第二轮：换三种新难点

| 样稿 | 来源 | 覆盖到的新情况 |
|---|---|---|
| 04 | `Ros2_Note/coor_trans/2026_01_28.md`（676 字） | 引用官方文档时改用英文原标题；`gif` 图；fence 信息串是中文 |
| 05 | `postMortem/tiny_tips/2026_09_08.md`（768 字） | 7 张截图、表格里带全角括号的链接、纯叙述式排查文 |
| 06 | `vueNote/VUE3/VUE3的数据响应式_中.md`（2,613 字） | 中文锚点跨页跳转、原文 API 拼写错误、英文原文与中文译本重复出现 |

这一轮出现了第一个"故意不通过"：06 号原文有一段 ES6 英文注释块，紧接"译为中文就是："再加一份中文翻译块；en 版保留英文原块、把中文块改成一句英文转述，否则同一段内容出现两遍造成了语义重复。代价是代码块数 34 → 32，因此也使得`translation_check.py` 报错——当然这是有意为之，并非缺陷。

**锚点规则从"实测校准"升级为"源码对齐"**：先抓线上 `VUE3的数据响应式_中.html` 的 `id=` 属性比对，12/12 命中；后来又装了 `@mdit-vue/shared`，用它的 `slugify` 跑全站 **1,255 个标题**，与校验脚本的实现 **0 处不一致**。规则随之确定：

```txt
空格 / . / ? / ' / 全角标点 → -
em dash — 保留          ## X — Y  →  x-—-y
连续 -     折叠
标题以数字开头时前缀 _   1.Reflect → _1-reflect
```

> **教训 1**：翻译规范不是"写得好不好"的问题，是**可判定的问题**。一旦锚点规则能用官方 slugify 判定跑出 0 差异，108 篇就可以批量跑，不必人工抽查；反过来，任何靠"我觉得对"的规范，批量之后都要逐篇返工。

### 第三轮：再三种极端结构

| 样稿 | 来源 | 覆盖到的新情况 |
|---|---|---|
| 07 | `postMortem/sp_for_LLM/000_prompt-…Markdown-Converter.md` | 四反引号嵌套 md 代码块 |
| 08 | `learningNote/TypeScriptNote/第五天.md` | 列表内缩进式代码块 |
| 09 | `learningNote/Principles_of_Computer_Composition/README.md` | 数学 `$…$` / `~下标~` / `^上标^` 密集，用行号映射脚本 `build_ja_zu.py` 生成，保证 token 字节不变 |

第三轮用户定点：中文页里两条**本来就坏**的锚点不顺手修（不擅自动中文页）、给 LLM 的 META prompt 输入可以翻译、标题里的 `---` 统一成 em dash。

### 三轮后口径冻结清单

| 项 | 定稿 |
|---|---|
| 文件树 | `docs/en/` 下同路径同名（中文文件名保留），相对链接因此自动生效 |
| frontmatter | 只译 `title`；**中文 tag 保留原文不译**；其余键原样 |
| 代码块 | 翻注释 / docstring / 给人看的打印字符串 / fence 信息串；标识符、命令、路径、配置键、逻辑不动 |
| 图片 | 复制到 `docs/en/` 对应目录 |
| 术语表 | `.csv` 文件，列 `term_zh,term_en,scope,status,note,source_page,updated`，`status` 分 `locked`/`draft`，**只在本机维护，不进博客仓库** |
| 文末容器 | 依据上述定义书写 |
| 语体 | 不去口语化；梗与口癖保留 |

---

## 第三阶段：批量翻译与构建级失败

执行方案：105 篇按目录切 11 批（每批 8–13k 中文字），使用 max 10 个 subagent 并行，剩一批随后补上。每一篇在翻译结束后都要过 `translation_check.py`：frontmatter 键、YAML 可解析、标题数、围栏数、图片存在性、数学结构、残留中文、链接目标、锚点、容器路径。

结果是 **115 / 115 篇结构校验全绿**（learningNote 88 + postMortem 27；115 = 全站 117 篇候选减去 2 个本来就是英文的旧页面）。然后——

### 全绿之后仍然崩的三类

| 崩法 | 现象 | 为什么结构校验看不见 | 修法 |
|---|---|---|---|
| YAML 冒号 | 23 个英文标题里的 `:` 未加引号，`js-yaml` 直接崩 | 校验脚本只查"键齐全"，不查"值能否被 YAML 解析" | 整体加引号：`title: "ROS2-006-…: Action"` |
| Vue 当成未闭合标签 | `Array<type>`、`"<type>variable"`、`"<workspace>-<package name>"` 三处 ASCII 占位符让编译失败 | 源站用的是中文占位符（`数组<类型>`），从没暴露过；`.md` 层面完全合法 | 写成 `Array\<type>`；并新增一条规则：正文（代码块/行内代码之外）出现 `<[a-z][a-z0-9 _-]*>` 就报错 |
| 数学宏丢失 | `compute_and_simutation.md` 丢了 `\it`（`\text{where c}` → 应为 `\text{where {\it c}}`） | 旧的"数学令牌逐字节一致"规则本来会抓，但它把 `\text{中文}` 也判成错误，被迫放宽 | 判据改成"数学跨度数量 + LaTeX 命令集合一致"，`\text{}` 内的散文允许翻译 |

原来 `en/learningNote/README.md` 里那句"所有笔记只有中文"已经不成立，于是顺带修了，改成翻译版索引页。

### 由于校验脚本定死而出现的三条误判

- `\text{中文}` 内的散文必须译，但旧规则要求数学令牌逐字节一致 → 改成结构等价；
- 文件名含空格的页面（`Vue3 中 watcheffect 函数的使用.md`）容器路径正则匹配不到 → 放宽；
- `${VAR}` 被当作数学令牌 → 剔除后再比。

### 构建验证的边界

```txt
全站 build → 在 vite 阶段被 OOM 杀掉。因为部署 HERMES Agent 的机子只有 1.9 GB 内存，Node 堆调到 6 GB 也回天乏术（耸肩）
之后在 vuepress build 时使用 pagePatterns 临时限到 en/** → 292 页 / 285 个 html，通过
事后已把 pagePatterns 还原
```

> **教训 2**：`✓ 115/115` 只证明"结构对得上"，不证明"能编译"。这次的三个崩点全部发生在 `.md` 合法、但渲染层不合法的缝里。**所以闸门要有两层：结构层（脚本）与渲染层（构建）；而在这台机器上，渲染层只能在合并后由仓库 CI 兜底。**

---

## 第四阶段：交付与自动化的静默失败

做完上述操作之后，Hermes 分三批提交了 PR:

### 三个 PR，一次权限墙

| 批次 | 内容 | 分支 / commit | 规模 |
|---|---|---|---|
| ① | Ros2_Note 44 篇 + 英文导航（`enSidebar.ts` / `enNavbar.ts`） | `translation/en-learningNote-ros2` / `23da6b5` | 44 篇 + 2 个 ts |
| ② | learningNote 其余 44 篇 + `learningNote/README.md` | `translation/en-learningNote-rest` / `5d493e5` | 91 文件 / +7,670 |
| ③ | postMortem 27 篇 + `en/about` 越界链接修复 | `translation/en-postMortem` / `af5749d` | 64 文件 / +7,287 |

PR 全部由用户在 GitHub 上手点：Hermes Agent 的 fine-grained token 只有**读**权限，`gh pr create` 报 `Resource not accessible by personal API token`，`docs.yml` 在当时的设定在只给 `wiki-ingest-*` 自动开 PR。

### 用户改了两处句式，然后出现了第一个静默 bug

合并后用户要求将上述运行链路固化成 cronjob。Hermes Agent 在核对时抓到用户修改声明容器链接后出现的三处坏链，全是**批量 find-and-replace** 留下的：

| 文件 | 症状 |
|---|---|
| `postMortem/README.md` | `)` 落到句号后面 → 链接目标变成 `…README.md. The translation is for reference only` |
| `Ros2_Note/coor_trans/2026_01_29.md` | `)` 直接丢了 |
| `learningNote/Computer_Network/README.md` | `at[here]` 少一个空格，渲染成 "athere" |

**"批量替换是已知的破坏方式"** 这条规则因此写进了 skill：改完必须重跑全量校验——`translation_check.py` 随后改成按整句式匹配（反引号、`[here]`、路径后必须紧跟 `).`），路径先 URL 解码再查存在性。

### EN Translation Sync 的设计

```txt
monitor（~/.hermes/scripts/en-sync-monitor.py）
  → 调用 en-sync.py status（git fetch + sha256 对比 state.json）
  → 若输出不变 = idle → agent 根本不唤醒，零 token、零消息
  → 若有变化 = 清单注入 prompt
      → 翻译 → en-sync.py finish
          → translation_check.py 闸门
          → 单 commit 推 wiki-ingest-<日期>-en
          → 成功才推进 state.json

exit 0 = 成功 / 3 = 结构校验失败（0 提交、state 不推进）/ 4 = push 失败（state 不推进）
```

第一次真实运行是 `no_change (agent run suppressed)`，用户收不到输出，于是 Hermes Agent 去查了下，**查出一个会让它永远哑掉的 bug**：

```txt
en-sync.py status 只 git fetch，而 fetch 只更新 FETCH_HEAD，
工作树仍停在 9ff79f4；哈希是对着昨天的树算的 → 永远报 idle

HEAD before: 9ff79f4     ← master 已经是 2bf8127
HEAD after : 2bf8127     ← 改为 fetch 后 reset --hard FETCH_HEAD + clean -qfd docs/en
```

这类失败是最坏的一种：**不报错、不报警、只是默默地什么都不做。** 也正是在这里，用户提出了"一个 monitor 触发两个 job"的想法，而接下来的大半天就花在把它落地——以及落地过程中又抓到同一族的第二个 bug：

```txt
sync_tree() 用不带 --verify 的 git rev-parse FETCH_HEAD
fetch 失败时它把字面量 "FETCH_HEAD" 打到 stdout
→ 被当成合法 SHA 传给 git reset --hard
→ 「unknown revision」traceback，整个 EN run 直接死

修法：--verify --quiet + SHA 正则双校验；fetch 失败降级到当前工作树，
     输出带一行 WARN git fetch failed (...)
```

---

## 第五阶段：检测层解耦

### 为什么"一个 monitor 触发两个 job"做不到

Hermes 的 cron 是**时间驱动**的，monitor 的职责只是"输出与上次逐字节相同就不唤醒 agent"。它没有能力去启动另一个 job。所以能实现的形态是：

> **一个检测器 + 两个消费者。**

收益不在少一次调度，而在于：① 统一检测口径；② 把 ingest 从简报 job 里解耦出来：因为在此之前出现过一种状况，ingest 挂在 Blogwatcher 的第 6/7 步上，前面任何一个数据源（微博、Trending、Nature）出问题导致中断，当天的 ingest 就一起没了。

### 两条检测路径的旧差异

| | Blogwatcher（06:35） | EN Translation（07:25） |
|---|---|---|
| 判据 | `blogwatcher-scan.sh articles --blog JeacsonBlog` 再 `grep -E` 过滤 `/postMortem/` 与 `/learningNote/` | master 上文件的 sha256 清单 |
| 语义 | 只看"新发布"（RSS 条目） | 新增 + 修改都算 |
| 窗口 | 24h + unread 池**每轮清空** | 无窗口，幂等 |
| 失败模式 | 源延迟或池被清空 → 漏一篇就永久漏 | 漏了下一轮还在 |

### 落地的检测器

`blog-change-detector.py`（约 590 行），子命令 `status` / `seed` / `ack` / `verify`：

| 维度 | 取值 |
|---|---|
| source | `tree`（`gh api repos/…/git/trees/master?recursive=1`，一次约 1.5 s，不拉 78 MB）或 `rss` |
| consumer | `wiki` / `en` / `all` |
| kind | `new` / `modified` / `deleted` / `missing_en` / `rss_only` |
| 输出 | `--json` / `--report` / `--act-only`（只列可执行项）/ `--kinds`（白名单） |
| 规则 | `rules.json`，**改规则不用改代码** |

两个 consumer 的规则差异：

| | wiki-ingest | en-translate |
|---|---|---|
| 范围 | `postMortem/` `learningNote/` `complain_diary/` | `learningNote/` `postMortem/`（不含 complain_diary） |
| 数据源 | RSS + git tree **合并** | git（sha256）+ RSS **旁路核对** |
| 触发 kind | 只有 `new`；改稿、删除只作提示 | `new` / `modified` / `missing_en`；删除只报告 |
| cursor | 自己的 blob ledger，`ack` 才推进 | `en-sync.py` 的 `state.json`，push 成功才推进 |
| RSS 的作用 | 给发布时间；gh 挂掉时仍能出"新发布" | 只兜住一种静默失败：fetch 悄悄失败、工作树停在旧 commit 却报 idle |

`verify` 最终跑 **16/16**，覆盖：合并、路径排除、seed 后 idle、blob 变→改稿、树里消失→删除、只有 new 可执行、ack 生效、URL→path 三种形态、`''` 哨兵两条。另外做了几组真实注入：改 1 个 blob + 加 2 个新页 + 加 1 个 `docs/wiki/` 页 → 报 2 待处理 / 1 提示，`docs/wiki/` 正确忽略；en 侧真的投放一篇临时中文页 → `[新增] … 25 字`，删掉后回 idle、clone 保持 clean。

### monitor 的输出契约

```txt
idle                      → 不唤醒 agent
<path>\t<kind>\t…         → 注入 prompt
ERROR <reason>            → 显式失败，绝不冒充 idle
```

三道守卫：`cursor-not-seeded`（cursor 文件缺失）、`suspicious-volume`（cursor 被清空到只剩几条，避免一次误 ingest 灌爆 prompt）、`MAX_ITEMS=30`（体量上限）。单源失败只 `WARN` 并继续（rc=0），两源全挂才 `rc=3`。

### 接线：四个 job 与一条时间线

| job | 变化 | 证据 |
|---|---|---|
| `1a35ce6480fe` **RSS News Scan**（原 Blogwatcher） | 删 Step 0（mirror 同步）、删 Step 6（交叉核对）、删「Wiki 更新纪律」段；Step 1 固化为 `proxy-latency-check 5`；补「简报结构（固定）」段；技能从 `vuepress-wiki-integration + llm-wiki`（76 KB）换成 `rss-feed-monitoring + agent-reach-weibo-fetch`（44 KB） | prompt 8,143 → 5,694 → **4,644** 字符；`fetch-wiki-mirror` / `blog-change-detector` / `wiki-ingest.sh` 三个名字一个不剩 |
| `88f4438fe179` **Wiki Mirror Sync**（新） | 静默壳 `wiki-mirror-quiet.sh`（成功零输出、失败打全量日志 + exit 1），`timeout 180` 顺带保证不与 06:50 撞车 | `hermes cron run` 实测 `succeeded`，`stdout_bytes=0` |
| `60c0fa9fb699` **Wiki Ingest Sync**（新） | 独立 ingest：detector → `blog-article.py` → 写 `~/.hermes/wiki/` → manifest → `wiki-ingest.sh` → **push 成功后** `ack`；第 4 步插入 lint 脚本作硬闸门 | 空跑 `Status: no_change`、`monitor_last_output = idle`、`next_run 2026-11-07 06:50` |
| `a28fbd4255a2` **EN Translation Sync** | monitor 换成 `blog-en-monitor.py`（多 RSS 旁路 + `WARN` 透出），prompt 只改清单格式那一行 | `monitor_state` 哈希未变（新旧都输出 `idle`，不会误唤醒） |

其中两个细节值得记一笔：

- **正文必须走 contents API**：`raw.githubusercontent` 对 CJK 文件名偶发 HTTP 000；`gh api … | base64 -d` 属于 pipe-to-interpreter，在 cron 无人审批时会 `pending_approval`。于是有了 `blog-article.py`（79 行）。
- **lint 闸门真的会拦住推送**：造一个只有一条 `[[../concepts/Does-Not-Exist.md]]` 的临时 mirror，`wiki-lint.sh` 脚本返回 `rc=1`、critical 里有 `broken_link` 与 `missing_from_index`；真实 mirror 上是 `rc=0`、40 页、critical 空，不会卡住日常 ingest。

> **教训 3**：无人值守链路的失败模式不是"报错"，而是"什么都没发生"。本次一共抓到三个同一族的坑：`fetch` 只动 `FETCH_HEAD`、`rev-parse` 不打 `--verify` 会返回字面量、monitor 输出不变就不唤醒。**它们的共同点是：所有退出码都是 0。** 判据只能是"状态是否真的推进了"，且每个 monitor 都必须有一条只在失败时才出现的输出（`ERROR`/`WARN`），不能只有 `idle` 一种沉默。

---

## 第六阶段：链接语法与知识库覆盖

检测层接上去之后用它测试时我顺带发现了 wiki 侧的一些问题。因此接下来两件事都在 wiki 侧，而且都不是"写新内容"。

### 一、202 处不能点的链接

现状：`~/.hermes/wiki/` 里 38 个页面共 **202 处** `[[…]]`，写法还是自造的混合体，例如：

```txt
[[./sources/JavaScript.md]] — JavaScript 语言核心与 Web API 笔记
```

三条实测证据说明它在这个站上毫无收益：

| 检查 | 结果 |
|---|---|
| 部署页 HTML | 仍是 3 处 `[[../concepts/…md]]` **纯文本**，指向 sources 的 `<a>` 数量是 0 |
| 同站另一页的普通 md 链接 | 被 VuePress 渲染成 `<a class="route-link" href="…html">`，**可以正常点击** |
| `~/.hermes/wiki/` 是不是 Obsidian vault | 不是，没有 `.obsidian/`，连 backlink/graph 的收益也拿不到 |

所以能渲染的是**普通 md 链接**，不能渲染的才是 `[[ ]]`；而且标签写在括号外面，连 Obsidian 的 `[[path|alias]]` 也不是。agent 侧两种形式完全等价（都是可 grep 的确定路径，lint 脚本也两种都解析），换掉不损失任何能力，唯一代价是 lint 脚本在 orphan / 断链统计时只扫 `[[ ]]`，因此亦需要修改 `wiki-lint.sh`。

::: info 会这么写的原因
原本我在定该 `wiki` 的时候希望其后续能够接入 `Obsidian vault`，因此模板中写了该格式。但是后面意识到本来就没有使用 `Obsidian vault` 的习惯，只有写博客的习惯……于是上述格式之后并没有继续实现下去，因此该写法可以被认为是一个所谓“草创时期”的遗留项……
:::

| 结果 | 数量 |
|---|---|
| `[[路径]] — 标签` → `[标签](路径.md)` | 199 处（145 处用破折号后的文案、1 处用「别名」写法、53 处改用目标页 `title:`） |
| 指向从未创建过页面的链接 → 降级为纯文本 | 4 处（`defineProperty`、`数据响应式`、`自定义消息接口`、`可靠数据传输`） |
| `log.md` 里反引号内的 `[[…]]` 保留 | 3 处（是当时的报错引用，不是链接） |

在这里，**迁移顺序是不变量**：先改 lint 的正则 → 再改 202 处内容 → 最后改模板。反过来做，中间会有一段时间"断链检查静默失效"。

PR **#77**（38 文件 / +206 −198）负责内容，PR **#78**（`AGENTS.md` / +16 −8）负责源头——**模板才是这次写法偏离规范的根源**：`related:` 示范 `- "[[../concepts/xxx]]"`、索引模板示范 `[[./sources/X.js]] — …`。同时给 lint 加了 `legacy_wikilink` 警告：谁再写回 `[[…]]` 就报出来。这条规则以前只写在文档里、没人校验，这正是它反复出现的原因。

### 二、一次"到底丢没丢数据"的审计

用户合并后想确认那 4 个被文本化的链接，进而担心"草创时期丢失 wiki 数据"，于是做了一次全站遍历。

**结论：没有丢原数据。** 22 个主题没有页面，但原始笔记全在 repo；其中两块藏在目录 `README.md` 里（计算机组成原理 8.7 KB、自动控制原理 3.4 KB），只看文件名列表会误判成丢失。真正的问题是 **wiki 的页一直只建了 `index.md` 列出的那 26 个**，`sources/*.md` 描述了 22 个主题却没有对应页，TypeScript / 组成原理 / 控制理论三个域一个 concept 页都没有。所以实际上是**本来就没做出来……**

| 阶段 | 内容 | 规模 |
|---|---|---|
| **A**（4 页） | 把 4 处纯文本变回可点链接：`可靠数据传输` / `defineProperty` / `数据响应式` / `自定义消息接口` | PR **#79** · 12 文件 / +531 −5 |
| **B**（只修引用） | 57 条 `related:` 从 `docs/wiki/…` 改为页内相对路径 + 2 条路径级别修正 + 3 处 `../../../postMortem/` 多退一级 | PR **#80** · 22 文件 / +69 −62 |
| **C**（18 页） | 计算机网络 7、JavaScript 2、Vue 3、ROS2 1、TypeScript 3、组成原理 1、控制理论 1 | PR **#81** · 32 文件 / +2,060 −6 |

C 阶段还顺手纠正了审计清单本身的两处失真——这比补 18 页更值得记：

- `sources/JavaScript.md` 把 `简单记忆.md` 标成"记忆化相关"，Hermes Agent确认实际内容是 var/let、严格模式、eval 这类与代码相关的零散速记知识点，**repo 里根本没有 memoization 相关的笔记**；
- `sources/TypeScript.md` 写着"接口与泛型 / 高级类型 / 装饰器 / 综合应用"，实际是"编译选项 / webpack+Babel / 面向对象上 / 面向对象下"，**装饰器与高级类型并非相关记录**。

也就是说：**审计清单本身也会说谎**，它继承的是当初 ingest 时的误读。凡是"补齐型任务"，在读取审计清单的同时，第一步都该回到原始素材核一遍清单。

---

## 第七阶段：三个谎报的检查与一个页面的拆分

### bug

在做完上述修理后，用户发现了三个 由 `wiki-lint.sh` 所报的 lint bug，他们的共同点是：**它们不是简单的"报错"，而是某种意义上来说的"没报"。**

#### bug 1：`index.md` 不算入链 → 两个孤儿是假的

orphan 统计只遍历 `pages`（concepts / entities / sources），`index.md` 不在集合里。所以 `sources/Computer_Composition.md`、`sources/Control_Theory.md` 即使明明就列在首页 Sources 段，却也一直挂在 orphan 里。

修法：把 `index.md` 的出链也计入 `inbound`（仍跳过行内代码与自链接）。顺带 PR **#82** 给 `机器数与IEEE-754`、`S-Z变换表` 各补一行"知识源 → source 概述页"，让两页互链。

#### bug 2：标签里带方括号 → 整条链接消失

`[函数形参与实参 [补充]](…)` 这种类型的标签会在 Markdown 里把链接解析断掉，后果是该条目被判 `missing_from_index`（看起来是"没进索引"，实际是"链接根本没被识别"）。

修法：改标题文字后清零。

#### bug 3：`stem` 当键 → 五个实体页从未被检查过

这是最严重的一个。lint 收集页面时这样写：

```python
for sub in ("entities", "concepts", "sources", "queries", "comparisons"):
    for f in sorted((WIKI / sub).iterdir()):
        if f.suffix == ".md":
            pages[f.stem] = f      # 键是 "JavaScript"
```

`entities/JavaScript.md` 与 `sources/JavaScript.md` 的 stem 都是 `JavaScript`，**先后写进同一个键**；循环顺序里 entities 排第一、sources 排第三，所以 `sources/X.md` 永远后写、永远赢，而 `entities/X.md` 从 `pages` 里直接消失。本站恰好有五个这样的同域名：JavaScript、Vue、ROS2、TypeScript、Computer_Network，使得这五个域名中都有一部分内容直接遁入虚无了……

后果不是"少算一点"，而是那五个文件**不参与任何一项检查**：

| 检查 | 后果 |
|---|---|
| 断链 | entity 页里的坏链接不会被报 |
| `missing_from_index` | 它没进 index 也不报 |
| frontmatter / 页大小 / 陈旧日期 | 从来没检查过 |
| 入链统计 | 它链出去的页面拿不到入链，可能被误报成孤儿 |
| `total_pages` | 报 64，实际 69 |

**最硬的证据**：迁移时那 4 处死链，分别位于 `entities/Computer_Network.md`、`entities/JavaScript.md`、`entities/ROS2.md`、`entities/Vue.md`——四处全在被吞掉的 entity 页里。所以 lint 心安理得地报了几个月的"critical 0"。

修法是三件事分开：

1. `pages` 改按相对路径当键；
2. 另建 `stem -> [路径]` 映射专门做链接解析（链接本来就是按文件名解析的）；
3. 同名对不再静默取一个，而是输出 `stem_collision` info。

修完数字反而变差，这是对的：

| 指标 | 修前 | 修后 |
|---|---|---|
| `total_pages` | 64（少报 5） | **69**（entities 9 / concepts 51 / sources 9） |
| `partial_frontmatter` | 23 | **28** |
| `stale` | 26 | **29** |
| `critical` | 0 | 0 |

多出来的 5 个 partial、3 个 stale，全是那五个 entity 页——它们不是新出现的问题，是**第一次被看见**。

### 页面拆分：按语义缝，不按行数

用户在`wiki-lint.sh`脚本的返回中发现有几个提示了 `oversized_page` 的文件。这里提出几个个较大的触发点：

第一例：`concepts/Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` 247 行触发了 `oversized_page`（>200 行，warning 级），因此需要拆分。不过针对该文件，拆法不是简单粗暴的对半切：

| 页 | 拆前 | 拆后 | 切法 |
|---|---|---|---|
| `Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md` | 247 行 | 132 行 | 留核心结论、根因、方案选型、三层架构、URLTest 组、cron、陷阱、验证、经验 |
| `Mihomo-IP-Pool-Drift-Diagnosis.md`（新） | — | 173 行 | 移五步速查表 + Step 1~4 完整取证 + 自举失败插曲 + 5 个坑 |

第二例：`AI-Daily-Briefing-Brotli-Fix-Investigation` 182 行 → 78 行 + 新页 `Brotli-Stream-Truncation-Root-Cause` 129 行（五层叠加、逐秒时间线、`brotlicffi._decompress()` 守卫源码、四家 Provider 的 `Content-Encoding` 对比）。

而最初被列进"值得拆"的另外两页，读完全文后**改判不拆**：

- `LeanCloud-to-Neon-Migration` 181 行：体量来自必须内联的 ~65 行转换脚本，挪走会让读者两页来回跳。它的病是"代码块长"，不是"过程与结论混排"。
- `Ubuntu-gdm3-Disk-Full-Troubleshooting` 140 行：急救 8 步与根本修复 7 步是连读关系，切开等于把操作手册撕成两半。

> **教训 4**：页面长度是**信号**，不是判据。真正的判据是"这里有没有一条缝：切开之后两页各自独立成立"。判错的代价是链接通胀——wiki 从 63 页推到 85+ 页，其中一半是人为切出来的碎片，检索时反而更难定位。

---

## 第八阶段：口径之争与收尾

最后一步是补 28 页 frontmatter。做完之后，Hermes Agent 发现原项目的 `AGENTS.md` 与 lint 的规则冲突：

```txt
AGENTS.md 第 197、201 行：sources 与 created 可选
wiki-lint.sh           ：fm_required = {title, created, updated, type, tags, sources}  六项全必填
```

当时 Hermes Agent 最开始的判断是"检查器比项目规范更严"：28 页里有 15 页（7 个 entity + 8 个 source 聚合页）本来不算问题；聚合页的 `sources` 不能硬填——`sources` 的语义是"这页提炼自哪些笔记"，而 ROS2 一个目录有 131 篇笔记，硬凑一份清单只能是编造。于是 Hermes 把 lint 改成"六项基础 + `type: concept` 才要求 `sources`"，并只补了 4 个 concept 页的 `sources`、28 个 `created`、5 个 `updated`（跳过链接迁移与 `related:` 重排那两次提交——它们动了全站每个文件，拿它当日期等于给所有页盖上今天的章）。

用户的澄清把因果翻了过来：

> **User:** 六项全当必填是之后才定义的，草创时期（指今年四到五月份）确实并没有考虑到那么多，也是直到后面才真正落实下来。不过现在这个修改实际上也是没问题的，之后新加入的 blog 需要遵守，之前的就按照原样就行。

也就是说：**不是检查器太严，而是文档旧、代码对。** 于是 Hermes Agent 最后收尾只改了两处本地文档、不动代码：

- `SKILL.md`：从"lint 比仓库规范更严，应让 lint 退回规范"改成"六项标准是后定的，`AGENTS.md` 那两行是滞后文档，不要去改 lint 迎合它"，并明确三条：新页必须六项齐全；老页照原样不回改；`source`/`entity` 聚合页豁免 `sources`。
- 博文里那一节的标题从「lint 比仓库自己的规范更严」改为「标准是后来定的，文档没跟着改」，教训从"先信规范"改成"先问哪一边更晚"。

一处留痕要说明：已合并的 `log.md` 里那条记录仍写着"lint 比 schema 更严的口径漂移"，按"不再改"的要求没有回改。措辞不准，但它已经进了历史。

---

## 深度技术分析

### 1. 检测层的四条不变量

```txt
① 单一读取、多元消费：detector 只负责"列出变了的路径 + kind"，不做任何写入
② 各自 cursor：谁的写入成功，谁才推进自己的 cursor
③ act 与 advisory 分离：wiki 只有 new 可执行，modified/deleted 只作提示；en 的 deleted 只报告
④ 失败不推进：脚本非零退出 → 不 ack、state 不前进 → 下一轮重跑同一篇
```

第 ④ 条是整套设计的地基。它的反面叫"提前 ack"——那会永久丢文章：**宁可重复报，不要静默丢页**。这条已经写进 job prompt 的硬规则里，而不只写在文档里。

### 2. 三种静默失败与它们的判据

| 现象 | 根因 | 判据 | 修法 |
|---|---|---|---|
| 永远 `idle` | `git fetch` 只更新 `FETCH_HEAD`，工作树没动 | 打印 HEAD before/after，看是否跟随 master | fetch 后 `reset --hard FETCH_HEAD` + `clean -qfd docs/en` |
| `unknown revision: FETCH_HEAD` | `rev-parse` 不加 `--verify`，失败时把字面量打到 stdout | 把 remote 指向不存在的路径，看是否 traceback | `--verify --quiet` + SHA 正则双校验 + 降级 `WARN` |
| monitor 永远安静 | 输出与上次逐字节相同 → 不唤醒 | 手动制造一次变更，看是否出清单 | `ERROR`/`WARN` 必须进入输出契约 |

### 3. 闸门能挡什么、不能挡什么

```txt
能确定性拦住：
  YAML 解析失败 / frontmatter 键不一致 / 标题与围栏数不符 /
  图片缺失 / 死链 / 锚点 / 容器句式 / 译文新引入的未闭合尖括号（"原文没有 <tag>"）

拦不住：
  主题组件误用、Vite 渲染层的奇葩语法
```

所以分支上不会有 CI 绿灯（`Build_and_Deploy` 只在 master 上跑），真正的验证是你合并后 master 上那次构建。这也是"校验失败就 0 提交"的理由：**闸门可以漏，但不能放行它没验证过的东西。**

### 4. 锚点：为什么必须对齐 `slugify`

标题锚点是翻译里唯一"跨两棵树"的约束——en 页里的 `#fragment` 必须在 en 页自己的标题上算出来。实测校准（抓线上 12 个 `id=`）能解决个例，但要批量就得有算法。用 `@mdit-vue/shared` 跑全站 1,255 个标题、与自研实现 0 差异，之后锚点就不再是"人工抽查项"。

### 5. 链接解析：为什么"看得见"比"写得对"更重要

VuePress 只把标准 md 链接渲染成 `route-link`，`[[…]]` 是纯文字。但真正让这个问题拖了几个月的不是渲染，而是**可见性**：

- lint 的 orphan / 断链统计只扫 `[[ ]]` → 迁移后若不改 lint，断链检查会静默失效；
- lint 的页表以 stem 为键 → 同名文件互相覆盖，被覆盖的那五个恰好是核心五个域；
- 模板在示范错误写法 → 每次 ingest 都把旧格式写回来。

三件事叠起来，就是"检查器一直在说没事"。**规则、检查器、模板，三者必须同源；只改其中一个，另外两个会把它拉回去。**

### 6. 拆页的判据

```txt
不成立的判据：行数、字数、代码块数
成立的判据：这条缝切开之后，两页能否各自独立回答一个问题
反例：inline 的迁移脚本（切走就得两页来回跳）、runbook 的急救与根治（连读关系）
```

### 7. 环境把设计逼到了哪一步

| 约束 | 后果 |
|---|---|
| 1.9 GB 内存 / 2 核 | 全站 `docs:build` 必 OOM；构建验证只能临时把 `pagePatterns` 限到 `en/**`，事后还原 |
| 浅克隆（`--depth 1`，约 78 MB） | 无法 `diff old..new`，只能用 sha256 清单；`git rev-parse` 的边界要自己防 |
| token 只读 | `gh pr create` 不可用，PR 一律靠上游 Action；因此分支名必须落在 `wiki-ingest-*` 的合法正则里 |
| 一次 push 一个 commit | 不能"先推一版再补提交"，只能攒好再推 |

---

## 结论与后续建议

### 关键结论

1. **英译本博客的难点不在翻译，在可判定性。** 术语表、锚点算法、代码块"只比块内部"、容器句式整句匹配——这四件事一旦能脚本判定，115 篇就可以并行跑；不能判定的部分（语体、梗）才留给抽样验收。

2. **`✓ 全部通过` 必须说明"通过了什么"。** 结构校验全绿的那一版里，仍然藏着 YAML 冒号、`Array<type>`、丢 `\it` 三类崩溃；它们都发生在"md 合法、渲染层不合法"的缝里。闸门要分两层，且要明说第二层在哪儿跑。

3. **无人值守链路的主要失效形态是"什么都没发生"。** 本次三个同类 bug（`FETCH_HEAD`、`rev-parse` 字面量、monitor 输出不变）退出码全是 0。所以 monitor 必须有一条只在异常时出现的输出，而"状态是否推进"才是唯一判据。

4. **一个检测器 + 两个消费者，是这个 cron 模型下能做到的上限。** 它买到的不是省调度，而是统一口径与故障隔离：简报挂了 ingest 照跑，翻译失败不影响 ingest。

5. **检查器也会骗人，而且骗得更彻底。** `critical 0` 只在你确知"它看得见每一页"时才有意义。stem 覆盖、index 不入链、标签带方括号——三个 bug 的共同点是"没报"，其中 stem 那个让五个核心域的页面从未被检查过，而四条死链恰好全在它们身上。

6. **规范冲突时，先问哪一边更晚。** `AGENTS.md` 说"可选"、lint 说"必填"，正确的解法不是让代码退回文档，而是承认文档滞后。

### 遗留与可选加固（未实施）

1. **`cross_folder` 38 处**：wiki 页里指向博客原文的跨目录链接只能人工抽查，lint 只统计不校验。
2. **`stale` 34 页**：`updated` 回填后反而变多——它们本来就很旧，只是第一次有值可算。
3. **`stem_collision` 5 条**：现在是 info，提示"链接按文件名解析时有二义性"；如果以后出现同名跨目录链接指错，需要升级成 warning。
4. **`translation_check.py` 与 `en-sync.py` 的规则是两份实现**：容器句式、锚点、图片路径各写了一遍，改口径要改两处。这是目前最容易漂移的地方。
5. **`hermes update` 依赖端口 7890 的那类死锁**（详见 代理诊断页: [007_HermesAgent服务器代理全挂排查](../deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md)）：代理组指向故障节点时，所有 HTTPS 工具一起挂，因此三个 job 现在都把 `proxy-latency-check 5` 放在第一步，但它只能选延迟最优，不能保证可用性。

---

## 附录：关键对象索引

| 类型 | 对象 | 说明 |
|---|---|---|
| PR | #72 | 翻译 ① Ros2_Note 44 篇 + 英文导航（`23da6b5`） |
| PR | #73 | 翻译 ② learningNote 其余 44 篇（`5d493e5`，91 文件 / +7,670） |
| PR | #74 | 翻译 ③ postMortem 27 篇 + about 链接修复（`af5749d`，64 文件 / +7,287） |
| PR | #75 | 容器坏链修复（`bdb7dfd`，3 行） |
| PR | #77 | 链接语法迁移 202 → 199 处（38 文件 / +206 −198，`bbf0c81`） |
| PR | #78 | `AGENTS.md` 模板改相对路径（+16 −8） |
| PR | #79 | 阶段 A：补 4 个被文本化的概念页（12 文件 / +531 −5，`8e3badb`） |
| PR | #80 | 阶段 B：`related:` 路径统一（22 文件 / +69 −62，基于 master `231651d`） |
| PR | #81 | 阶段 C：补 18 个缺页主题（32 文件 / +2,060 −6，`fa98cfa`，合入 `5b8c57d`） |
| PR | #82 | orphan 归零（3 文件 / +9，`34f13d1`，合入 `bd58d23`） |
| PR | #83 | 拆分 mihomo 页（4 文件 / +225 −156，`93caed5`） |
| PR | #84 | 拆分 AI Daily 页（4 文件 / +185 −150，`2acd154`，合入 `f3575b0`） |
| PR | #85 | 补 28 页 frontmatter（29 文件 / +53 −8，`b6f7704`，合入 `b1d616c`） |
| job | `RSS News Scan` | 每天 06:35，deliver `discord,feishu`，无门控 |
| job | `Wiki Mirror Sync` | 每天 06:45，静默（成功零输出） |
| job | `Wiki Ingest Sync` | 每天 06:50，monitor `blog-wiki-monitor.py` |
| job | `EN Translation Sync` | 每天 07:25，monitor `blog-en-monitor.py` |
| 脚本 | `blog-change-detector.py` | 唯一读取层：`status` / `seed` / `ack` / `verify` |
| 脚本 | `blog-wiki-monitor.py` | wiki 闸门：`idle` / 清单 / `ERROR`，`MAX_ITEMS=30` |
| 脚本 | `blog-en-monitor.py` | en 闸门：`KINDS=new,modified,missing_en,deleted`，透出 `WARN` |
| 脚本 | `blog-article.py` | 走 contents API 取 CJK 路径原文（避开 raw 的 HTTP 000 与管道审批） |
| 脚本 | `en-sync.py` | `bootstrap` / `status` / `finish`；sha256 检测；exit 0/3/4 |
| 脚本 | `translation_check.py` | 结构闸门：frontmatter / 围栏 / 图片 / 数学 / 残留中文 / 容器 / 锚点 / 尖括号 |
| 脚本 | `wiki-lint.sh` | `inbound` 计入 index、`link_targets()` 双语法、`legacy_wikilink`、按相对路径当键 |
| 数据 | `glossary.csv` | 162 行，`locked`/`draft`，**只在本机** |
| 数据 | `state.json` | en 侧 115 篇 sha256 基线（`master_sha 9ff79f4`） |
| 数据 | `cursors/wiki.json` | wiki 侧 123 条 `path→blob` 基线 |
| 分支 | `wiki-ingest-<日期>-en` | 落在 `docs.yml` 合法后缀里，自动开 PR、不触发自动合并 |
| 指标 | 翻译 | 115 篇 / 156,563 字 → ≈9.7 万英文词 / 868 代码块 / 168 图 |
| 指标 | 构建 | en 子树 292 页 / 285 html；全站 OOM（1.9 GB 机器） |
| 指标 | wiki | 页数 45 → **69**（entities 9 / concepts 51 / sources 9）；critical 0；orphan 6 → 0；partial 24 → 0；oversized 0；`stem_collision` 5 |
