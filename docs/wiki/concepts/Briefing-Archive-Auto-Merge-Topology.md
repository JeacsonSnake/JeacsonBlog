---
title: "AI 简报自动归档链路 —— merge-base 不变量与双层分支保护"
description: "hop-1/hop-2 两跳自动合并拓扑、merge-base 三点 diff 不变量、ruleset vs classic 双层保护与个人仓库 bypass 限制"
type: concept
tags: [GitHub Actions, Git, CI/CD, DevOps, Branch Protection, Hermes Agent]
related:
  - docs/wiki/entities/Hermes-Agent.md
  - docs/wiki/sources/PostMortem.md
  - docs/wiki/concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md
created: 2026-10-20
updated: 2026-10-20
confidence: high
sources:
  - docs/postMortem/sp_for_LLM/006_Hermes-Briefing-Archive-Auto-Merge-Topology-report.md
---

# AI 简报自动归档链路（hop-1 / hop-2）

把「归档 job 推送分支 → 人工点 Squash & Merge」的最后一公里自动化，同时**不放大攻击面**：只有本 job 的归档能自动进 master，Agent 的其他改动依旧要人工审阅。

> 约束原话：「希望有且仅有本 job 提交的归档能自动合并进 master；一切由 Agent 做出的其他改动依旧保持需人工审阅 + 手动合并。」

## 目标拓扑

```txt
归档 cron → push briefing-archive-<日期>-<体裁>（SSH deploy key）
  → docs.yml: gh pr create（base=daily）
  → 白名单预检 PR 文件 → gh pr merge --squash 进 daily        ← hop-1
  → gh workflow run daily-to-master.yml --ref master
  → merge-daily-into-master: 三点 diff 守卫 → git merge --no-ff → push master  ← hop-2
  → master push 触发 deploy-website → 网站更新
  → schedule 兜底（best-effort，会迟到数小时）
```

设计点里「看着能简化、其实不能动」的几条：

- **hop-2 必须是 `workflow_dispatch`，不能用 `on: push: [daily]`** —— hop-1 用 `GITHUB_TOKEN` 合并 PR，其 push 事件被 GitHub 的递归防护吞掉，`on: push` 根本不会触发。
- **dispatch 必须 `--ref master`** —— workflow 定义跟随 ref；守卫脚本若放在可被 PR 修改的分支上，等于让它自证清白。
- **合并凭据放 Environment secret**（environment `master-merge`，deployment branch 限 `master`）—— 放仓库 secret 则任意 ref 的 run 都能读到。
- **App 权限刻意不给 Workflows** —— daily 一旦含 `.github/workflows/**` 变更，推 master 会被结构性拒绝，多一层兜底。
- **白名单只放归档目录** `docs/{en/}Scheduled_Automatic_AI_Industry_Analysis_Report/{daily,monthly}/*.md`；放宽成 `docs/**` 等于允许改 `docs/.vuepress/**`，那是能注入脚本的。

## 核心不变量：merge-base 只由图决定

GitHub 的 PR 文件清单（`pulls/N/files`、`gh pr view --json files`）与本项目两个守卫吃的都是**三点 diff**：

```txt
git diff A B      → tree-diff(A, B)                两棵树
git diff A..B     → tree-diff(A, B)                （同上）
git diff A...B    → tree-diff(merge-base(A,B), B)  ← 只有它依赖提交图
```

`merge-base` 是**图**上的概念，内容相等不会让它移动。因此「把文件搬过去」只有两种命运：**建立祖先关系**，或者**什么都没改**。

事故形态（2026-10-15）：

```txt
归档分支基线 = master tip（含两个 workflow 文件）
daily 从未合并 master 后续提交 → 文件戳停在 10-14 归档提交 86150db5
merge-base(daily, 归档分支) = 86150db5（那个提交里没有 workflow 文件）
→ 三点 diff 把 .github/workflows/{docs,daily-to-master}.yml 一起算进 PR 文件清单
→ hop-1 白名单预检整批拒绝（即便归档内容完全正确）
```

**修复判据只有一条**：`git merge-base origin/master origin/daily` 是否等于 master tip。用「两边 blob SHA 相同」下结论会翻车 —— 本例中两个 workflow 文件 blob 全等，merge-base 却纹丝不动。

### 三种「同步」方式的真实效果

| 方式 | 内容 | 祖先关系 | 结果 |
|---|---|---|---|
| `gh pr merge --squash`（PR #41） | ✅ 同步 | ❌ 不建立（单亲提交） | 预检仍拒、守卫仍拦 → **无效修复** |
| PR 选 Create a merge commit（`--no-ff`） | ✅ | ✅ 建立 | 已足以修不变量 |
| 删分支按 master 重建 | 等价于 daily = master tip | ✅ | 最干净（代价：以 daily 为 base 的 open PR 被自动关闭） |

### 终局修复：归档分支基线改挂 daily

```diff
- git checkout -q master && git reset -q --hard origin/master
- git checkout -q -b "$BR" master
+ git fetch -q --depth 5 origin '+refs/heads/daily:refs/remotes/origin/daily' \
+                          '+refs/heads/master:refs/remotes/origin/master'
+ git checkout -q --detach origin/daily && git reset -q --hard origin/daily
+ git checkout -q -b "$BR" origin/daily
```

归档分支从 `daily` 长出后，无论 master 上发多少博客，归档 PR 都不会再把无关文件算进来。

## 双层分支保护：GH013 与 GH006 是两道闸

| 层 | 配置位置 | 错误码 | bypass 名单 |
|---|---|---|---|
| **Ruleset** `PR_BEFORE_MERGE`（require PR + 1 approval） | Settings → Rules → Rulesets | `GH013` | App / 角色 / deploy key，**个人仓库可用** |
| **Classic branch protection** | Settings → Branches | `GH006` | users / teams / apps，**仅组织仓库** |

官方文档明写：**"Actors may only be added to bypass lists when the repository belongs to an organization."** 这句藏在「Allow specified actors to bypass required pull requests」选项说明的下一行，极易被跳过 —— 于是个人仓库里怎么翻都找不到那个选项。

**个人账户仓库的正确姿势**：删掉 classic 规则，只留 ruleset（`pull_request` 规则 + App bypass 覆盖「自动化必须能直推」，其余改动仍要 PR + 审批）。最终状态是 `branches/master` 显示 `protected: true` 而 `protection.enabled: false`，属预期而非配置残缺。

bypass 模式必须是 **Always**：「For pull requests only」只豁免通过 PR 合并，**不豁免直推**，这正是 GH013 最典型的成因。

### bypass 是否生效只能靠一次真实 push 验证

只读 token 读 ruleset 时 REST 返回体里**没有 `bypass_actors` 字段**；GraphQL 只能看到 `bypassActors` 的条数（本次 2 条），`actor` 详情被遮成 `null`；classic 规则的 bypass 名单直接 403（需 admin）。所以没有任何配置读取手段能替代真实 push。

## 验证纪律：success 必须拆到 step 级

本次共出现三种「看着成功、其实没验证」：

1. **守卫 `AHEAD=0` 的 skip** —— 首次 hop-2 run 结论 `success`，但 `Merge daily into master = skipped`，push 路径一次都没被执行。
2. **关掉某道闸之后的 success** —— run 5 成功时 ruleset 还是 `Disabled`，无法证明 App bypass 可用（更早同 App 在 ruleset active 时被 GH013 拒过）。
3. **「内容一致」当成「链路一致」** —— blob SHA 全等 ≠ 祖先关系建立。

**判据**：verification 必须一次只测一道闸，且必须有真实 push 发生。真实验证点是 10-16 的 run 7：ruleset 全程 `active`、step「Guard」「Merge daily into master」双 success、master 出现双亲 merge commit。

### hop-2 失败速查表

| 现象 | 含义 | 处置 |
|---|---|---|
| `runner=(空)`、`steps=[]` | ref 选错（environment 只允许 master） | 手动 Run 时 Use workflow from 选 master |
| `Guard`=success、`Merge`=failure | 规则集/分支保护拒了 push | 看 GH013 修 ruleset bypass；GH006 删 classic 规则。**不要**重推分支、不要改归档 |
| `Guard`=blocked（并开假 issue） | daily 混进归档目录以外的变更 | `git diff --name-status origin/master...origin/daily` |
| 整条 success 但 `Merge`=skipped | 守卫 AHEAD=0，没东西可合 | 不是「push 可用」的证据 |

## schedule 兜底的真实行为

GitHub 的 `on.schedule` 是 best-effort：声明 `17 12 * * *` UTC，实测两次分别在 17:08:25Z（迟到 ~4h51m）与 16:45:22Z（迟到 ~4h28m）触发，且都是 `AHEAD=0` → skip。**兜底存在，但不能指望它当天补位**；可靠性来自 hop-1 里的显式 `workflow_dispatch`。

## 身份核对

GitHub App 的 bot 账号形如 `<app-slug>[bot]`。定身份靠「push 触发的那条 deploy run 的 actor」：

```json
{"run_number": 198, "event": "push", "head_branch": "master",
 "actor": "jeacsonblog-daily-merge[bot]", "triggering_actor": "jeacsonblog-daily-merge[bot]"}
```

bypass 名单里配的 App 名必须与它一致。

## 沉淀的教训

1. **故障不一定在内容层**：三期排查中归档文件、校验、翻译、blob 全部正确，失败全在拓扑与权限层。
2. **`merge-base` 是核心不变量**：master 上有直推提交而 daily 未同步到祖先关系，hop-1 预检与 hop-2 守卫会同时失效。
3. **个人仓库只有 ruleset 一层能配 bypass**，classic 层必须删掉，否则每期都得人工合并。
4. **success 拆到 step 级**，且改完宿主规则/拓扑后要在回执里显式标注「本次是否发生了真实 push」。
5. **遗留清理**：`briefing-archive-*-daily` 分支在内容进 master 后可删，适合在 merge 成功后自动化。

## 关键对象（回溯用）

- PR：#39（topology 落地）/#40（hop-1 拒绝）/#41（squash 无效修复）/#42（真 merge commit，已足够）/ #43（重建 daily）/ #44（首次自动合并）
- 规则集 `PR_BEFORE_MERGE` / 25078746；environment `master-merge`；App `jeacsonblog-daily-merge`
- commit：`86150db5`（故障期 merge-base）、`597f962a`（单亲 squash 物证）、`1becffd7`（重建后 daily tip）、`0ae60d93` / `1a3c512f`（两次双亲 merge commit）

## 相关

- [[../entities/Hermes-Agent.md]] — 本链路的宿主 Agent 与 cron 体系
- [[../sources/PostMortem.md]] — 本文所属的踩坑心得知识域
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — 上游「生成」环节的故障史（sp_for_LLM/005）
