---
title: 008_什么叫配置丢失了？Hermes Agent 配置静默缩水排查
date: 2026-11-22
icon: 'box-archive'
category: deploy
tag:
  - Hermes Agent
  - YAML
  - deepseek harness
---

## 背景

事情的起点跟配置毫无关系。

我在 小红书 上看到一个关于 deepseek harness 的第三方插件： `dsh-narration-policy` 的宣传（原址在[这里](https://github.com/hentai-joshu/dsh-narration-policy)）。底下评论有一段说：

>“我的方案是这样的，忙时用户消息先开一个fork请求，让模型自己判断是BTW形式的回复，还是需要塞进工具轮的紧急消息，还是等这轮结束后才发送的排队消息。需要了解进度或者其他问题的时候直接在输入框里问就行了，也不会干扰正在干活的轮次。”

我让 `Hermes Agent` 去查了下，想知道这两种方法之间的差异性是什么。

按 `Hermes Agent` 查询之后的理解，它想解决的是同一类问题：**让 agent 在工具调用之间主动交代自己在做什么、为什么这么做**，而不是只单刷一串命令。我自认为他所做的这件事情对于我亲自发起的 session 而言是具有实用性的，因为这样可以使 `Hermes Agent` 在做事的时候，更加完全的暴露逻辑思维链，方便之后的修订。但我也不想为了看见过程去装一个新插件，因为在查询之后，我发现他这个 `dsh-narration-policy` 本质上是把 codex 的一些功能复用到了 dsh 那边，而我印象中 Hermes 本身就有"显示工具链"的开关，我还记得自己是有"完全开启"过的（设定了 verbose）。于是我就去看了眼设置，结果发现我之前的设置完全消失了。这不应该，因为我印象当中有开过，但是确实找不着。

于是问题变了：不是"要不要复用下这个 dsh 插件的设计思路"，而是"**为什么看起来我这边设置丢了**"。

## 现象

我把发现设置丢了的时候观察到的几件事列在这里：

1. 在我使用的 feishu 聊天窗口里，**目前的**工具链调用时会**自动省略一部分输出**。典型形态是一串命令后面接一个"……"后省略，比如 `echo "=== hermes install ==="; ls ~/…` 这样的截断；
2. 记得当时使用 discord 做 gateway 的时候，工具链调用时显示的量应该没那么少，也不会省略。但是用 weixin 的时候好像甚至没有那么多量。于是我查了下消息记录，发现确实存在“同一个 Hermes 在不同 gateway 显示的工具链调用量 **不一样**”的现象。有的地方更啰嗦，有的地方更安静；
3. 我看到 `Hermes Agent` 查询之后给的修订方案里有些字段可能是目前需要配置的。最初怀疑的是 `display.platforms.<平台>.show_reasoning`：名字看起来最像"显示思考"的那个键，但是后面和 `Hermes Agent` 对话的时候才意识到不对。

## 排查过程

### 第一步：先把 show_reasoning 排除掉

 `Hermes Agent` 读了 `gateway/display_config.py` 和渲染侧代码，发现 `display.platforms.<平台>.show_reasoning` 管的是**最终回复之前那几行推理**（有长度上限），跟工具链的展示完全两条路。工具过程归另一个键：`display.tool_progress`，取值 `all` / `new` / `off` / `verbose`。换句话说，我看到的"省略"不是"没显示推理"，而是**工具预览被截断**。真正相关的键实际是 `display.tool_preview_length`：在 `verbose` 模式下，它取 `0` 表示不截断；而在 `all` / `new` 模式下，`0` 会回落到 40 个字符。

也就是说，`display.platforms.<平台>.show_reasoning` 决定 **"显示多少条"**，而 `display.tool_preview_length` 决定 **"每条显示多长"**。我看到的"写一半省略"的现象是由后者决定的。那么这就意味着在不修改 `display.tool_preview_length` 键对应值（这里为 `0`）的前提下，修改 `display.platforms.<平台>.tool_progress` 甚至全局的 `display.tool_progress` 为 `verbose` 的场合，该设置才会更加合理。

::: tip 把优先级算清楚!

在 `Hermes Agent` 的配置中，相关键值对的解析顺序是"第一个非空值胜出"，先后顺序（越高越优先）通常表示为：

```
  → display.platforms.<platform>.<key>
  → display.<key>
  → 平台档位默认（插件平台注册的 display_tier + display_overrides）
  → 全局默认
```

`feishu` 这个适配器注册的档位是 `medium`，而 `_TIER_MEDIUM` 档位针对上述键的取值是 `tool_progress: "new"`、`tool_preview_length: 40`。

所以只要 `display` 这一段配置 **整个不存在**，飞书就会拿到 `new` + `40字符` 的设定——工具调用只显示"新的"、每条截到 40 字符然后后面不输出。这跟我看到的症状完全对得上。

:::

### 第二步：去看本机配置，发现 display 整段没有

我去查了下我现在的 `~/.hermes/config.yaml` 里出现的状况，发现不是 "display 设错了"，而是**根本没有 display 这一段**。不只是 `display` ，整个文件只有 `model`、`fallback_providers`、`skills.external_dirs`、`onboarding` 和版本号，其他配置直接消失了。

![my part of config when I reached out - Vanishing person Meme](/blog_assets/postMortem/deploy/assets/008-img/0.jpg)

一份跑了大半年的 Hermes 配置只剩这么一点，这太不对劲了，肯定是之前不小心改了啥导致配置丢失了。（无奈地耸肩）

### 第三步：翻备份，做一次全量比对

幸好我之前有让 `Hermes Agent` 备份的习惯。我让 `Hermes Agent` 把 `~/.hermes/backups/config/` 和 `~/.hermes/config.yaml.bak*` 里的相关备份全部列出来，按时间排了下：

| 文件 | 大小 | 版本 | 状态 |
|:---|---|---|---:|
| `config.yaml.bak-20260628` | 12,497 B | v30 | 完整，含 display verbose |
| `config.yaml.corrupt.20260727-190417.bak` | 11,846 B | v33 | 首行损坏 |
| `config.yaml.corrupt.20260727-210532.bak` | 11,848 B | v33 | 首行损坏 |
| `config.yaml.bak.20260727_214134` | 11,848 B | v33 | 首行损坏，比对基线 |
| `config.yaml.bak-20260803-211329-pre-skills-external-dirs` | 274 B | v33 | 最小配置 |
| `config.yaml.bak-20260810-172630-pre-minimax-baseurl-fix` | 323 B | v33 | 最小配置 |
| `config.yaml.pre-setup.20260926-121440` | 794 B | v46 | 最小配置 |

不对劲，文件大小怎么缩水了。

![Realized something while checking the file size - Something ain't Right. Meme](/blog_assets/postMortem/deploy/assets/008-img/1.jpg)

然后 `Hermes Agent` 通过递归展开叶子键把路径逐个比对了下，再拿缺失项跟 `DEFAULT_CONFIG` 对了一遍，发现配置丢了一大堆（基线 **439 个** 叶子键，当前 32 个，**缺 422 个**）。`Hermes Agent` 给这些缺失的项分成了三类：

- **34 个** 与当前默认值不同的项——缺了会真的改变行为；
- **336 个** 与默认值相同的项——缺了也走默认，行为不变；
- **52 个** 没有默认项的项——这些是旧版显式配置、插件参数或已退役项。

其中，上述的 34 项里包括了 `agent.clarify_timeout`（`600` 改成了 `90`）、`agent.restart_drain_timeout`（`60` 改成了 `0`）、`delegation.child_timeout_seconds`（`600` 改成了 `0`）、`curator.stale_after_days`（`30` 改成了 `14`）、`checkpoints.enabled`（`true` 改成了 `false`）、`display.tool_progress_command`（`true` 改成了 `false`）等等比较重要的键值对。

 `Hermes Agent` 顺带排除了一个可能：7 月 27 日和 8 月 3 日的 `_config_version` **都是 33**。版本号没变，说明这可能不是版本迁移把旧键"迁移掉了"，而是那段时间里的同一次重写把一些非默认键丢了。

### 第四步：给"首行"做取证

那么，具体是啥时候呢的重写呢？`Hermes Agent` 仔细看了下那三份 7 月的备份，发现三分备份的第一行都是同一个样子：

``` yaml
model: default: MiniMax-M3 provider: minimax-cn base_url: https://api.minimaxi.com/v1
```

这是一个被压平了的 `YAML` 嵌套映射——`model` 下面的 `default` / `provider` / `base_url` 三个键被空格连成了一行，中间没有换行、没有缩进、也没有逗号。这是不符合 `YAML` 的相关书写规范的，`PyYAML` 在读取之后对它的判决很干脆：

```
mapping values are not allowed here
  in "<unicode string>", line 1, column 15
```

`column 15` 正好是 `model: default:` 里 `default` 后面那个冒号。

`Hermes Agent` 在第一次读到坏文件时，会自动把坏文件另存一份 `.corrupt.` 文件，而我们能通过文件名（`config.yaml.corrupt.20260727-190417.bak`） 发现这个 `.corrupt.` 文件是 **7 月 27 日 19:04:17** 生成的。也就是说，**19:04 之前** 它就已经坏了。

更能说明问题的是：那天 21:04:36 的一次普通 `hermes auth list`，把这段警告原样打在了屏幕上了：

```
⚠️  hermes config: Failed to parse ~/.hermes/config.yaml:
mapping values are not allowed in this context
  in "...config.yaml", line 1, column 15.
Falling back to default config — every user override
(auxiliary providers, fallback chain, model settings) is being IGNORED.
Fix the YAML and restart.
```

那句话已经把后果写得很直白：“**所有用户覆盖项**正在被忽略”。但是我当时没停下来。我做了啥来着？

![Me realized it might be MYSELF that I hadn’t spotted the notice - This Is Fine. Meme](/blog_assets/postMortem/deploy/assets/008-img/2.jpg)

抛开最初的那一份不谈，另外两份 corrupt 备份唯一的差异在第 554 行，fallback 的模型从 `deepseek-v4-pro` 改成了 `deepseek-v4-flash`。说明文件坏掉之后，它还在被继续手改。

![Let’s see who edited it: It's ME -Scooby doo mask reveal Meme](/blog_assets/postMortem/deploy/assets/008-img/3.jpg)

### 第五步：锁定 274 B 那一刻

在继续查证之后， `Hermes Agent` 发现在 8 月 3 日的一次会话里，有一条 `ls -la` 的输出，刚好把 `config.yaml` 的更新时间也带出来了：

```
-rw------- 1 ubuntu ubuntu   274 Jul 30 00:36  config.yaml
```

**7 月 30 日 00:36**，11,848 字节变成 274 字节。而 274 字节的全部内容是：

```yaml
model:
  default: MiniMax-M3
  provider: minimax-cn
  base_url: https://api.minimaxi.com/v1
fallback_providers:
  - provider: deepseek
    model: deepseek-v4-flash
    base_url: https://api.deepseek.com
_config_version: 33
onboarding:
  seen:
    tool_progress_prompt: true
```

四个段：模型路由、fallback 链、版本号、一个"首页提示已看过"的标记。其余全没了。全没了。

### 第六步：读写入器，回答"为什么恰好是这四个"

到这一步，我原本的猜测是这样的："7 月底配置坏了之后，我可能做了一次重建 / `hermes setup`，结果重写时只保留了 model、fallback_providers、onboarding，包括 display 的整段**都**没被带过去"。

这个猜测对了一半，但它解释不了两件事：为什么 `_config_version` 也在？为什么重建会挑这三个段，而不是别的？

直到 `Hermes Agent` 读了 `hermes_cli/config.py` 的 `save_config()`，发现答案在函数的备注里：

```python
def save_config(config: dict, *, strip_defaults: bool = True, ...):
    """Schema defaults are not written unless the user explicitly set them
    (the path exists in the raw config before normalisation) ..."""
```

Hermes 的 `config.yaml` 是"只写差异"的，具体而言，跟 schema 默认值相同的键不落盘，这样以后默认值改了，用户才能跟着变。判断"这个键是用户显式写过的"的依据，是**原始文件里存在这个路径**。

于是链条变成：

1. `config.yaml` 首行坏了，YAML 解析直接抛异常；
2. 读取器 fail-open，返回一个空壳（`{}` 或默认值），进程照常跑，只在屏幕上喊一句警告；
3. 某个"读—改—写"的调用者拿到空壳，加上自己那一个键，调 `save_config()`；
4. `save_config()` 去原始文件里取"用户显式路径"的集合——**文件读不出来，集合是空的**；
5. 空集合喂给 `_strip_default_values()`，等于"凡是跟默认值相同的，全剥掉"；
6. 只有三类键活下来：**当前生效值 ≠ 默认值的**（模型路由、fallback 链，它们由运行时环境解析出来）、**强制保留的 `_config_version`**、以及**调用者刚写的那一个键**（那个 onboarding 标记）。

`display` 段一个键都没活，是因为写入那一刻内存里的 `display` 由于文件读不出来，被 **全部用默认值重新生成了一份**，而当函数尝试将现在的 `display` 键值对逐个跟默认值比对时，发现全都相等（不相等才奇怪了）。而 `model` / `fallback_providers` 活着，不是"重建时特意保留了它们"，是**它们的生效值本来就和默认值不同**。

换句话说：不是有人删了 display，是 display 没被读出来，被 **当成默认值处理掉了**。

### 第七步：七周后，官方修了同一类问题

 `Hermes Agent` 去翻了官方 `github` 仓库的提交历史，找到了官方在 2026 年 9 月的三个提交：

- `8b9c0b63e7`（09-17）`fix(config): save_config takes explicit paths from the fail-closed read`
- `db2f07c5cf`（09-23）`fix(config): a transient read error no longer wipes config.yaml`
- `b0369c49a1`（09-23）`fix(config): a save refused over bad YAML says to fix the file, not "try again"`

9 月 23 号 `db2f07c5cf` 的提交说明把机制写得比我自己推的更清楚：

> Every fail-open config reader turned a read error on an intact file into a stand-in (`{}` from `read_raw_config` …). Writers then mutated that stand-in and saved it; the writer re-reads the file, finds it fine, **and merges by deletion**, so one EMFILE/EIO during a TUI config.set, a dashboard save, a migration step or any `load_config()->save_config()` caller replaced the whole file with the stand-in plus one key.

也就是说，一旦出现了一个 `transient read error`，这个 `error` 就会导致整个 `config.yaml` 被擦除。

官方针对其的修法是增加了一个 `FailedConfigRead` 哨兵：读失败时返回的是 `dict` 的子类，带着原始异常；`save_config()` 和 `atomic_config_write()` 见到它就拒绝落盘，文件保持字节不变。现在的 `config.py` 里还多了一道 `require_readable_config_before_write()`，注释写着 `Fails closed.`，以及一个 `_omitted_config_paths()` 检查——任何"会删掉已存在路径"的写入直接拒绝。

我出事的时间是 7 月 30 日，修复落在 9 月 17 到 23 日。隔了七周。这也解释了为什么当时的版本会安静地把文件写成 274 字节：那会儿它就是这么设计的。

![Hermes agent at that time - I'm gonna pretend I didn't see that. Meme](/blog_assets/postMortem/deploy/assets/008-img/4.jpg)

## 根因

 `Hermes Agent` 认为该问题出现的原因有三层，说是 “缺一层都不会丢数据”：

1. **格式层**：`model:` 段被压成一行，YAML 解析失败（`line 1, column 15`）。这是唯一的"事故"，其余都是它的后果。
2. **读取层**：读取器 fail-open——解析失败就当默认值用，只在 `stderr` 喊了一声。进程活着，但是配置死了。
3. **写入层**：`save_config()` 用"原始文件里的显式路径"决定保留什么；文件读不出来 → 白名单为空 → 差异写入变成差异删除，且写入器是 merge-by-deletion，整份文件被替换。

::: note `Hermes Agent` 如是说

`Hermes Agent` 对此评论说:

> 关于第 1 层（格式层），我能给出的只有形态证据：首行是"`model:` 加三个子键，用单空格连成一行、结尾没有多余空格"，这更像**未经引用的 shell 命令替换**（`$(...)` 在未加引号时会做词分割再以单空格拼回）或**从渲染结果里复制粘贴时换行被吃掉**，而不像 YAML 序列化器写出来的东西——序列化器不会输出这种既没有冒号分隔也没有缩进的形状。具体是哪一次操作，日志里没有留下记录，我也不打算编一个。

这描述得专门夸一下，至少在这里 `Hermes Agent` 没想着编一个理由。
:::

## 修复与验证

### 修复

知道根因之后，修复方法反而简单了：我让 `Hermes Agent` 把之前说到的 34 项里值得补的补回去。`Hermes Agent` 决定全程只走 `hermes config set`，不手改文件，并且每次写之前先 `cp -p` 备份，这样至少出了问题还能知道。

我给分了三批修改：

| 批次 | 内容 | 写入前 | 写入后 |
|---|---|---:|---:|
| 第一批 | `display.tool_progress: verbose` + `display.platforms.feishu.tool_progress: verbose` | 1,116 B | 1,204 B |
| 第二批 | `approvals.mode`、`discord.allowed_channels`、`display.busy_input_mode`、`checkpoints.enabled`、`updates.pre_update_backup`、`display.tool_progress_command` | 1,204 B | 1,389 B |
| 第三批 | `agent.clarify_timeout`、`agent.restart_drain_timeout`、`agent.max_turns`、`delegation` 三项、`curator` 三项、`checkpoints` 两项 | 1,389 B | 1,668 B |

在书写时，其遵守以下两个约定：

- **全局 verbose 与平台 verbose 都写**。解析顺序里平台覆盖优先于全局：平台键管飞书，全局键管其余平台。这样以后假设想单独把某个平台收窄，改那个平台的键即可，不必回滚全局；
- **默认值也显式写**。`checkpoints.max_snapshots: 20`、`auto_prune: true` 跟默认同值，仍然写进文件。这样以后假设官方上游改默认值了，就不会悄悄改掉我的原设置。

当然剩下的项有些没有一起补的。比如 `curator.prune_builtins`（之前是 `true`）会让未使用的内置技能被归档，`compression.hygiene_hard_message_limit`（之前是 `400`）会让会话更早触发压缩、更容易丢上下文，`approvals.timeout`（之前是 `60`）比默认的 `300` 更容易超时。当然还有其他的一些，就不再赘述了。

### 验证

之后我们分了两个方面进行验证：

- **落盘**：文件从 **1,116 B** 长到 **1,668 B**，`diff` 显示其只新增了那些特定的键，其余没动。
- **运行时**：`resolve_tool_progress()` 对四个平台都返回 `('verbose', True)`；`get_clarify_timeout()` 、`_load_restart_drain_timeout()` 、 `resolve_turn_limit()` 、 `checkpoint_agent_kwargs()` 几个函数的返回值和设定值都与现在的设定同步。重启网关后，进程环境里能看到 `HERMES_RESTART_DRAIN_TIMEOUT` 和 `HERMES_MAX_ITERATIONS`修改后的数值。由于这两个变量是这次重启才出现的，因此这几个数值的出现比任何日志都更能说明之前的修改已经生效。

当然，这里有一个坑值得单独记：`agent.restart_drain_timeout` 这个键值对只在运行时初始化时读一次，所以它写进配置后，必须**再重启一次**才能作用到 **"下一次关闭"** 的时候。分三批修复时，第一次重启后查进程环境这个变量还不存在，第二次重启之后这个变量才出现的。

## 结论

1. **"看起来像重建"不等于重建。** 我最初的假设（`hermes setup` 重写只搬了 model/fallback/onboarding）在症状上完全吻合，但解释不了"为什么偏偏是这几个键"。真正的判据是"这些键的生效值不等于默认值"，而不是"重建流程挑了这几个键"。
2. **差异写入器要有独立的"完整性"判据。** 用"原始文件里的路径"当白名单的前提是原始文件可读，一旦原始文件读取失败，白名单退化成空集，"只写差异"就变成了"删掉一切与默认值相同的值"。这两个语义必须分开：*该值是否与默认值相同* 与 *该值是否为用户亲自定义*，后者的真与假是不能从前者的结果中推导得出的。
3. **fail-open 的代价是算在写入侧的。** 读失败时返回默认值，是为了让进程别崩；但如果同一个进程随后会写，fail-open 就会把"读不到"翻译成了"没有配置"，这就让写入侧的压力陡增了。
4. **警告要有人接。** 那行 `every user override ... is being IGNORED` 出现过，三天后文件就被写成了 274 字节，但是我实际完全没去仔细看过（虽然可能是 `Hermes Agent` 调用的时候没直接显示所以我没看着，但是还是得算成我的锅（“dude 我感觉我流汗了”））
