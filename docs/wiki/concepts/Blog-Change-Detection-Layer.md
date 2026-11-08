---
title: "博客变更检测层 —— 一个 detector、两个 consumer 与各自的 cursor"
description: "把「博客变了」做成共享读取层：tree 与 RSS 双源合并、按 consumer 分规则与 cursor、monitor 输出契约与静默失败的判据"
type: concept
tags: [Cron Job, State Machine, Idempotency, RSS, GitHub Actions, Hermes Agent, DevOps]
related:
  - ../entities/Hermes-Agent.md
  - ../sources/PostMortem.md
  - ./Blog-Bilingual-Translation-Pipeline.md
  - ./Hermes-Agent-Cronjob-Setup.md
created: 2026-11-08
updated: 2026-11-09
confidence: high
sources:
  - docs/postMortem/sp_for_LLM/007_Hermes-Bilingual-Translation-and-Wiki-Pipeline-Decoupling-report.md
---

# 博客变更检测层（blog-change-detector）

## 一、要解决的问题

同一份「博客变了」的信号，要同时喂给两个**规则并不相同**的下游：wiki-ingest（只吃新文）与 en-translate（新文、改稿、缺英文都要）。原来的形态是 ingest 挂在简报 job 的第 6/7 步上，前面任何一个数据源（微博、Trending、Nature）出问题导致中断，当天的 ingest 就一起没了。

用户最初的想法是「一个 monitor 触发两个 job」，但 Hermes 的 cron 是**时间驱动**的：monitor 的职责只是「输出与上次逐字节相同就不唤醒 agent」，它没有能力启动另一个 job。所以能做到的形态是：

> **一个检测器 + 两个消费者。**

收益不在少一次调度，而在：① 统一检测口径；② 故障隔离——简报挂了 ingest 照跑，翻译失败不影响 ingest。

## 二、最终的四条时间线

```txt
06:35  RSS News Scan (1a35ce6480fe)      只出新闻简报 → discord + feishu（每天必跑，无门控）
06:45  Wiki Mirror Sync (88f4438fe179)   只同步 ~/.hermes/wiki/ 镜像，成功零输出
06:50  Wiki Ingest Sync (60c0fa9fb699)   monitor 门控 → 取原文 → 写 wiki → lint 闸门 → push → ack
07:25  EN Translation Sync (a28fbd4255a2) monitor 门控 → 翻译 → 结构校验 → push → state 推进

                 ┌──────────────────────────────────────────┐
                 │           blog-change-detector           │   唯一读取层
                 │        tree（gh api）+ rss（sqlite）      │
                 └───────────────────────┬──────────────────┘
                             ┌───────────┴───────────┐
                  consumer=wiki                 consumer=en
                  docs/wiki/**                  docs/en/**
                  wiki cursor（path→blob）      state.json（sha256）
                  → PR ①                        → PR ②
                             └───────────┬───────────┘
                       master push → Build_and_Deploy → 站点
```

「把 mirror 同步单独建一个 job」也是同一类判断：ingest 受 monitor 门控，没有文章的日子它根本不醒；而 `~/.hermes/wiki/` 同时是「我以前写过 X 吗」的查询缓存，只挂在 ingest 里会变旧。

## 三、为什么翻译不能吃 RSS

| | RSS（blogwatcher） | git tree（`gh api .../git/trees/master?recursive=1`） |
|---|---|---|
| 语义 | 只看「新发布」的条目 | 新增 + 修改 + 删除都能看见 |
| 拿得到正文 | 不能 | 能（按 path 取 blob） |
| 成本 | 依赖 RSS 抓取与未读池 | 一次约 1.5 s，不拉 78 MB |
| 失败模式 | 源延迟或未读池被清空 → 漏一篇就永久漏 | gh／代理挂了就全瞎，但漏了下一轮还在 |

结论：**看不清「改稿」的源不能当翻译源。** wiki 侧可以 RSS + tree 合并（RSS 给发布时间，且 gh 挂掉时仍能报「新发布」）；en 侧必须以 git 为主源（需要 blob 内容和修改信号），RSS 只当旁路核对，用来兜住一种静默失败——`git fetch` 悄悄失败、工作树停在旧 commit 却报 idle。

## 四、detector 的形状

`blog-change-detector.py` 约 590 行，子命令 `status` / `seed` / `ack` / `verify`：

| 维度 | 取值 |
|---|---|
| source | `tree` 或 `rss` |
| consumer | `wiki` / `en` / `all` |
| kind | `new` / `modified` / `deleted` / `missing_en` / `rss_only` |
| 输出 | `--json` / `--report` / `--act-only`（只列可执行项）/ `--kinds`（白名单） |
| 规则 | `rules.json`，改规则不用改代码 |

两个 consumer 的规则差异：

| | wiki-ingest | en-translate |
|---|---|---|
| 范围 | `postMortem/` `learningNote/` `complain_diary/` | `learningNote/` `postMortem/`（不含 complain_diary） |
| 数据源 | RSS + tree 合并 | git（sha256）+ RSS 旁路核对 |
| 触发 kind | 只有 `new`；改稿、删除只作提示 | `new` / `modified` / `missing_en`；删除只报告 |
| cursor | 自己的 blob ledger，`ack` 才推进 | `state.json`，push 成功才推进 |

四条不变量：

```txt
① 单一读取、多元消费：detector 只列出「变了的路径 + kind」，不做任何写入
② 各自 cursor：谁的写入成功，谁才推进自己的 cursor
③ act 与 advisory 分离：wiki 只有 new 可执行
④ 失败不推进：脚本非零退出 → 不 ack、state 不前进 → 下一轮重跑同一篇
```

第 ④ 条是地基，它的反面叫「提前 ack」——那会永久丢文章。**宁可重复报，不要静默丢页。**

## 五、monitor 的输出契约与三道守卫

```txt
idle          → 不唤醒 agent
<path> <kind> <源> <时间> <标题>   → 注入 prompt（每行一条）
ERROR <原因>  → 显式失败，绝不冒充 idle
WARN  <原因>  → 单源降级，照常处理清单
```

三道守卫：`cursor-not-seeded`（cursor 文件缺失）、`suspicious-volume`（cursor 被清空到只剩几条，避免一次误 ingest 灌爆 prompt）、`MAX_ITEMS=30`（体量上限）。单源失败只 `WARN` 并继续（rc=0），两源全挂才 `rc=3`。

## 六、三种静默失败与它们的判据

| 现象 | 根因 | 判据 | 修法 |
|---|---|---|---|
| 永远 `idle` | `git fetch` 只更新 `FETCH_HEAD`，工作树没动 | 打印 HEAD before/after，看是否跟随 master | fetch 后 `reset --hard FETCH_HEAD` |
| `unknown revision: FETCH_HEAD` | `rev-parse` 不加 `--verify`，失败时把字面量打到 stdout | 把 remote 指向不存在的路径，看是否 traceback | `--verify --quiet` + SHA 正则 + 降级 `WARN` |
| monitor 永远安静 | 输出与上次逐字节相同 → 不唤醒 | 手动制造一次变更，看是否出清单 | `ERROR`/`WARN` 必须进入输出契约 |

> 教训：无人值守链路的失效形态是「什么都没发生」，而不是「报错」。三个坑的退出码全是 0，所以每个 monitor 都必须有一条**只在异常时出现**的输出，且「状态是否推进」才是唯一判据。

翻译侧那两个同族 bug 的细节见 [博客全站英译与 EN 自动翻译链路](./Blog-Bilingual-Translation-Pipeline.md)。

## 七、验证方式

`verify` 最终跑 **16/16**，覆盖合并、路径排除、seed 后 idle、blob 变→改稿、树里消失→删除、只有 new 可执行、ack 生效、URL→path 三种形态、空串哨兵两条。另外做了真实注入：改 1 个 blob + 加 2 个新页 + 加 1 个 `docs/wiki/` 页 → 报 2 待处理 / 1 提示，`docs/wiki/` 被正确忽略；en 侧真投一篇临时中文页 → `[新增] … 25 字`，删掉后回 idle、clone 保持 clean。

只验证「输出看起来对」不够——每个分支都要有一次真实扰动，否则 idle 与「检测器瞎了」在输出上无法区分。
