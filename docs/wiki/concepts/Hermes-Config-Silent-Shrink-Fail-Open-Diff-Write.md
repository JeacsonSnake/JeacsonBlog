---
title: "Hermes 配置静默缩水 —— fail-open 读取 × 差异写入把 439 个键写成 32 个"
description: "一份跑了半年的 config.yaml 被写成 274 B：首行 YAML 被压平 → 读取器 fail-open 返回空壳 → save_config() 以「原始文件里的显式路径」为白名单、merge-by-deletion，把与默认值相同的键全部剥掉；含 show_reasoning / tool_progress / tool_preview_length 的职责区分、备份比对取证、三批修复与七周后的官方修法"
type: concept
tags: [Hermes Agent, YAML, DevOps, Configuration, Troubleshooting, Data Loss]
related:
  - ../entities/Hermes-Agent.md
  - ../sources/PostMortem.md
  - ./Hermes-Agent-Cronjob-Setup.md
created: 2026-11-23
updated: 2026-11-23
article: false
author: 'Hermes_Agent_cRl1_bot'
confidence: high
sources:
  - docs/postMortem/deploy/008_HermesAgent_config_silent_shrink.md
---

# Hermes 配置静默缩水 — fail-open 读取 × 差异写入

## 一、核心结论

配置不是"被人删了"，而是**读不到的时候被当成默认值处理掉了**。三层叠加，缺一层都不会丢数据：

| 层 | 发生了什么 | 后果 |
|---|---|---|
| 格式层 | `model:` 段的三个子键被压成一行（`model: default: MiniMax-M3 provider: minimax-cn base_url: …`，无换行、无缩进、无逗号） | PyYAML 报 `mapping values are not allowed here`（`line 1, column 15`）——唯一的"事故"，其余都是它的后果 |
| 读取层 | 读取器 **fail-open**：解析失败就当默认值用，只在 stderr 喊一声警告，进程照常跑 | 配置在内存里"死了"，进程还活着 |
| 写入层 | `save_config(config, strip_defaults=True)` 只写与默认值的差异；判断"用户显式写过"的依据是**原始文件里存在这个路径**。文件读不出来 → 白名单为空 → 与默认值相同的键全被剥掉，再 merge-by-deletion 整份替换 | 11,848 B 的文件被写成 274 B |

最终只有三类键活下来：

1. **当前生效值 ≠ 默认值的** —— `model`、`fallback_providers`（由运行时环境解析出来，天然与默认值不同）；
2. **强制保留的** `_config_version`；
3. **调用者刚写的那一个键** —— `onboarding.seen.tool_progress_prompt`。

`display` 段一个键都没活，因为写入那一刻内存里的 `display` 是**用默认值重新生成的一份**，逐项与默认值比对自然全部相等。规模：基线 **439 个**叶子键，当前 32 个，缺 **422 个**（其中 34 个与默认值不同、336 个同默认、52 个无默认项）。

## 二、现象与第一层误判

- 飞书聊天窗口里工具链调用会自动省略输出（命令行后面接"……"），而 Discord 上显示量明显更多、微信上更少——**同一个 Hermes 在不同 gateway 显示的工具链量不一样**。
- 第一怀疑 `display.platforms.<平台>.show_reasoning`（名字最像"显示思考"）。实际它管的是**最终回复之前那几行推理**（有长度上限），跟工具链展示完全两条路。
- 工具过程归另外两个键：
  - `display.tool_progress`（`all` / `new` / `off` / `verbose`）决定**显示多少条**；
  - `display.tool_preview_length` 决定**每条显示多长**：`verbose` 下 `0` 表示不截断；`all` / `new` 下 `0` 会回落到 40 个字符。
- 解析顺序"第一个非空值胜出"：`display.platforms.<platform>.<key>` → `display.<key>` → 平台档位默认（适配器注册的 `display_tier` + `display_overrides`）→ 全局默认。`feishu` 注册档位是 `medium`，`_TIER_MEDIUM` 的取值正是 `tool_progress: "new"` + `tool_preview_length: 40`。

所以只要 `display` 整段不存在，飞书就拿到 `new` + 40 字符——与"只显示新的、每条截断"的症状完全对得上。这也说明：**在不改 `tool_preview_length` 的前提下，单改 `tool_progress: verbose` 是没用的**。

## 三、取证：从 11,848 B 到 274 B

**备份盘点**（按时间排序）：

| 文件 | 大小 | 版本 | 状态 |
|:---|---|---|---:|
| `config.yaml.bak-20260628` | 12,497 B | v30 | 完整，含 display verbose |
| `config.yaml.corrupt.20260727-190417.bak` | 11,846 B | v33 | 首行损坏 |
| `config.yaml.corrupt.20260727-210532.bak` | 11,848 B | v33 | 首行损坏 |
| `config.yaml.bak.20260727_214134` | 11,848 B | v33 | 首行损坏，比对基线 |
| `config.yaml.bak-20260803-211329-pre-skills-external-dirs` | 274 B | v33 | 最小配置 |
| `config.yaml.bak-20260810-172630-pre-minimax-baseurl-fix` | 323 B | v33 | 最小配置 |
| `config.yaml.pre-setup.20260926-121440` | 794 B | v46 | 最小配置 |

**键级比对**：递归展开叶子键、拿缺失项对照 `DEFAULT_CONFIG`，得到缺口 422 个。34 个"与默认值不同"的项里包括 `agent.clarify_timeout`（`600`→`90`）、`agent.restart_drain_timeout`（`60`→`0`）、`delegation.child_timeout_seconds`（`600`→`0`）、`curator.stale_after_days`（`30`→`14`）、`checkpoints.enabled`（`true`→`false`）、`display.tool_progress_command`（`true`→`false`）。

**排除版本迁移**：7 月 27 日与 8 月 3 日的 `_config_version` 都是 33。版本号没变，说明不是迁移把旧键搬走了，而是同一次重写丢了非默认键。

**首行取证**：三份 7 月备份的第一行都是同一个被压平的形态。Hermes 第一次读到坏文件时会另存一份 `.corrupt.` 文件，文件名 `config.yaml.corrupt.20260727-190417.bak` 说明 **19:04:17 之前文件已经坏了**；当天 21:04:36 的一次普通 `hermes auth list` 已经把警告原样打在屏幕上：

```text
⚠️  hermes config: Failed to parse ~/.hermes/config.yaml:
mapping values are not allowed in this context
  in "...config.yaml", line 1, column 15.
Falling back to default config — every user override
(auxiliary providers, fallback chain, model settings) is being IGNORED.
Fix the YAML and restart.
```

"所有用户覆盖项正在被忽略"已经写得很直白，但当时没人停下来处理。另外两份 corrupt 备份唯一差异在第 554 行（fallback 从 `deepseek-v4-pro` 改成 `deepseek-v4-flash`），说明文件坏掉之后它还在被继续手改。

**锁定 274 B 那一刻**：8 月 3 日一次会话里的 `ls -la` 输出带出了时间戳——

```text
-rw------- 1 ubuntu ubuntu   274 Jul 30 00:36  config.yaml
```

**7 月 30 日 00:36**，11,848 B 变成 274 B。274 B 的全部内容是四段：`model`（路由）、`fallback_providers`（fallback 链）、`_config_version`、`onboarding.seen.tool_progress_prompt`（"首页提示已看过"的标记）。其余全没了。

**为什么恰好是这四个段**：读 `hermes_cli/config.py` 的 `save_config()` 才解释得通——

```python
def save_config(config: dict, *, strip_defaults: bool = True, ...):
    """Schema defaults are not written unless the user explicitly set them
    (the path exists in the raw config before normalisation) ..."""
```

"只写差异"的前提是原始文件可读。链条是：首行坏 → YAML 解析抛异常 → 读取器 fail-open 返回空壳 → 某个"读—改—写"调用者给它加上自己那一个键 → `save_config()` 去原始文件取"用户显式路径"，拿到空集合 → `_strip_default_values()` 等于"凡是跟默认值相同的全剥掉"。

原先的假设是"`hermes setup` 重建时只保留了 model / fallback_providers / onboarding"，症状上完全吻合，但解释不了两件事：`_config_version` 为什么也在、重建为什么会挑这三段。**真正的判据是"这些键的生效值不等于默认值"，不是"重建流程挑了谁"。**

## 四、修复

修法很简单：把 34 项里值得补的补回去。纪律是全程只走 `hermes config set`，不手改文件，每次写之前先 `cp -p` 备份。

| 批次 | 内容 | 写入前 | 写入后 |
|---|---|---:|---:|
| 第一批 | `display.tool_progress: verbose` + `display.platforms.feishu.tool_progress: verbose` | 1,116 B | 1,204 B |
| 第二批 | `approvals.mode`、`discord.allowed_channels`、`display.busy_input_mode`、`checkpoints.enabled`、`updates.pre_update_backup`、`display.tool_progress_command` | 1,204 B | 1,389 B |
| 第三批 | `agent.clarify_timeout`、`agent.restart_drain_timeout`、`agent.max_turns`、`delegation` 三项、`curator` 三项、`checkpoints` 两项 | 1,389 B | 1,668 B |

两条书写约定：

- **全局 verbose 与平台 verbose 都写**：平台键管飞书、全局键管其余平台；以后想单独收窄某个平台，改那个平台的键即可，不必回滚全局；
- **默认值也显式写**：`checkpoints.max_snapshots: 20`、`auto_prune: true` 虽与默认同值仍写进文件，这样以后上游改默认值不会悄悄改掉原设置。

有意没补的项：`curator.prune_builtins`（`true` 会把未使用的内置技能归档）、`compression.hygiene_hard_message_limit`（`400` 会更早触发压缩、更易丢上下文）、`approvals.timeout`（`60` 比默认 `300` 更易超时）。

## 五、验证

- **落盘**：1,116 B → 1,668 B，`diff` 显示只新增了目标键，其余未动。
- **运行时**：`resolve_tool_progress()` 对四个平台都返回 `('verbose', True)`；`get_clarify_timeout()`、`_load_restart_drain_timeout()`、`resolve_turn_limit()`、`checkpoint_agent_kwargs()` 的返回值与设定同步；重启网关后进程环境里出现 `HERMES_RESTART_DRAIN_TIMEOUT` 与 `HERMES_MAX_ITERATIONS` 的新值——这两个变量是本次重启才出现的，比任何日志都更能证明修改生效。
- **坑**：`agent.restart_drain_timeout` 只在运行时初始化时读一次。写进配置后必须**再重启一次**才会作用到"下一次关闭"；第一次重启查进程环境时变量还不存在，第二次重启后才出现。

## 六、七周后官方修了同一类问题

官方仓库在 2026 年 9 月落了三个提交：

- `8b9c0b63e7`（09-17）`fix(config): save_config takes explicit paths from the fail-closed read`
- `db2f07c5cf`（09-23）`fix(config): a transient read error no longer wipes config.yaml`
- `b0369c49a1`（09-23）`fix(config): a save refused over bad YAML says to fix the file, not "try again"`

`db2f07c5cf` 的提交说明把机制写得更直白：

> Every fail-open config reader turned a read error on an intact file into a stand-in (`{}` from `read_raw_config` …). Writers then mutated that stand-in and saved it; the writer re-reads the file, finds it fine, **and merges by deletion**, so one EMFILE/EIO during a TUI config.set, a dashboard save, a migration step or any `load_config()->save_config()` caller replaced the whole file with the stand-in plus one key.

修法是引入 `FailedConfigRead` 哨兵：读失败时返回的是 `dict` 的子类、带着原始异常；`save_config()` 与 `atomic_config_write()` 见到它就拒绝落盘，文件保持字节不变。此外还有 `require_readable_config_before_write()`（注释写着 `Fails closed.`）和 `_omitted_config_paths()`——任何"会删掉已存在路径"的写入直接拒绝。

时间线：**事故 7 月 30 日，修复落在 9 月 17–23 日，隔了七周。** 这解释了为什么当时的版本会安静地把文件写成 274 字节——那会儿它就是这么设计的。

## 七、可复用结论

1. **"看起来像重建"不等于重建。** 判据是"这些键的生效值是否不等于默认值"，而不是"重建流程挑了这几个键"。
2. **差异写入器要有独立的完整性判据。** 用"原始文件里的路径"当白名单的前提是原始文件可读；一旦读取失败，白名单退化成空集，"只写差异"就变成"删掉一切与默认值相同的值"。*该值是否与默认值相同* 与 *该值是否为用户亲自定义* 是两个语义，后者不能由前者推导。
3. **fail-open 的代价算在写入侧。** 读失败返回默认值是为了让进程别崩；但同一个进程随后会写，fail-open 就把"读不到"翻译成了"没有配置"。
4. **警告要有人接。** `every user override … is being IGNORED` 出现过，三天后文件被写成 274 字节——中间没人停下来看过。

## 相关

- [Hermes Agent 实体（部署、cron、gateway 与配置）](../entities/Hermes-Agent.md)
- [踩坑心得知识域摘要](../sources/PostMortem.md)
- [Hermes Agent 部署与 RSS 每日简报 cronjob 配置](./Hermes-Agent-Cronjob-Setup.md)
