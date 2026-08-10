---
title: 007_HermesAgent服务器代理全挂排查：从「以为是 Twitter 直连问题」到「原来是 IP 池子断联」
date: 2026-08-10
icon: 'box-archive'
category: deploy
tag:
  - 腾讯云
  - mihomo
  - Network
---

## 背景

我的 `Hermes Agent` 被部署在腾讯云轻量应用服务器（广州）上，日常跑着多个定时任务，其中一个与 AI 简报相关的任务中「Twitter/X 追踪账号」数据源依赖本机的 mihomo 代理（端口 7890）访问境外服务。

某天早上，简报里 Twitter 段变成了：

> ⚠️ **追踪账号全部无响应** — x.com 直连被屏蔽，所有代理节点 TLS 失败

第一反应是「Twitter 又封了代理出口 IP」——因为腾讯云出疆本来就屏蔽 `twitter.com`/`youtube.com`/`discord.com`，之前也遇到过公共 RSSHub 的 Twitter 路由被 503。但这次连 `github.com`、`google.com` 走代理也全部超时，明显不是单个站点的问题。

## 排查过程

### 第一步：区分「TCP 屏蔽」还是「节点故障」

直连测试（预期内的超时）：

```
https://x.com        => 000 (10s timeout)  # 腾讯云出疆屏蔽，已知
https://twitter.com  => 000 (10s timeout)
https://api.twitter.com => 000 (10s timeout)
```

走代理测试（发现问题）：

```
https://x.com       => 000 (5s timeout)
https://github.com  => 000 (5s timeout)   # 关键：github 也挂 = 不是 x.com 的问题
https://discord.com => 000 (5s timeout)
https://google.com  => 000 (5s timeout)
```

**走代理连 github/google 都超时**，说明故障在代理链路本身，而不是目标站点。查看 mihomo 日志确认：

```
[TCP] dial 节点选择 (match DomainSuffix/github.com) ... error: context deadline exceeded
[TCP] dial 节点选择 (match DomainSuffix/x.com) ... error: context deadline exceeded
```

所有节点 dial 全部 `context deadline exceeded`——**节点层故障**。

### 第二步：测试全部 12 个节点

用 mihomo REST API（`127.0.0.1:9090`）逐个切换节点测试：

```bash
# 遍历所有节点，切换后 curl 测试
for NODE in "直连 台湾 01 | 0.5x" "直连 台湾 02 | 0.5x" ...; do
  curl -X PUT "http://127.0.0.1:9090/proxies/节点选择" -d "{\"name\":\"$NODE\"}"
  curl --proxy http://127.0.0.1:7890 https://x.com
done
```

结果：**12 个节点全部超时**。同时用延迟测试接口确认：

```
直连 台湾 04 | 0.5x   不可达 (HTTP 504)
直连 日本 01 | 0.5x   不可达 (HTTP 504)
直连 美国 03 | 0.5x   不可达 (HTTP 504)
```

当时几乎断定是「机场节点集体故障」。但有一个疑点：**UDP 53 出站是通的**（能正常解析 DNS），说明腾讯云没有封 UDP 出站。

### 第三步：关键转折——肉身在香港直连节点是通的

我在香港的电脑（HKT，未开代理）**能直连代理节点服务器**。这说明：

- 节点服务器**活着**（不是机场跑路）
- 问题在「广州服务器 → 节点服务器」这一段

于是重新审视：既然节点活着，为什么广州连不上？开始怀疑 **GSLB 域名解析**。

### 第四步：找到根因——GSLB IP 池漂移 + 订阅过期

用系统 DNS 反复解析节点域名，发现**每次解析返回不同的 IP**：

```
v951-zj.71edge.work => 61.228.250.100 (可达) / 61.228.249.36 (超时) / 36.231.117.240 (超时) ...
```

这是典型的 **GSLB（全局负载均衡）多 IP 轮询**。机场把节点域名解析到一堆 IP 上，但**其中大部分 IP 从腾讯云广州不可达**（台湾 Hinet 段 `36.230.x` / `61.228.x` / `218.172.x` 被屏蔽或路由不通）。

再一看 config.yaml 的修改时间：**2026-04-16**——4 个月前的静态配置。订阅里的「剩余流量：24.53 GB」，而机场新订阅返回「24.96 GB」——**配置里的订阅早过期了**，机场的 GSLB 早就换了 IP 池，旧 IP 全部失效。

**根因：不是 x.com 被封，是 mihomo 的静态订阅配置 4 个月没更新，GSLB IP 池漂移后旧 IP 全部不可达。**

### 插曲

在了解问题所在之后，我因为各种介质原因并没能够直接对其进行更新。结果在 8 月 10 日（发现该问题的两天后）发现 **所有的** 定时任务 都没有返回消息。在进入腾讯轻量云服务器的控制台 `https://console.cloud.tencent.com/lighthouse/instance/detail` 并尝试通过其提供的远程终端 `https://orcaterm.cloud.tencent.com/terminal` 进行相关修改时，发现其出现了 “虽然能够通过 gateway 正确接收信息，但是在尝试连接 LLM 进行问题分析时网络超时失败” 的情况。

#### 我的做法

我先尝试关闭了 mihomo 服务：

```
systemctl --user stop mihomo.service
systemctl --user disable mihomo.service
```

并重启。

然后发现因为之前配置的时候代码耦合度太高，IP地址出现冲突问题，导致该机子无法裸连github进行其自身的更新。

```
ubuntu@VM-0-2-ubuntu:~$ hermes update
⚕ Updating Hermes Agent...

◆ Pre-update snapshot: 20260810-031752-pre-update

⚠ Updating from fork:
  https://ghp_crazyThursdayVMe50@github.com/NousResearch/hermes-agent.git

→ Fetching updates...
✗ Network error — cannot reach the remote repository.
  fatal: unable to access 'https://github.com/NousResearch/hermes-agent.git/': Failed to connect to 127.0.0.1 port 7890 after 0 ms: Couldn't connect to server
```

::: info
这里的 `7890` 端口就是之前 mihomo 服务所使用的端口。
:::

尝试着修了下，但是修不动……我就死马当活马医，重新开启了 mihomo 服务：

```
systemctl --user start mihomo.service
systemctl --user enable mihomo.service
```

并重启。

使用之前写的 `proxy-latency-check 5` 进行节点选择，在*还未更新IP池*的前提下抓到了一个还能用的节点。

然后总算是连上LLM，让它继续修改上了……

### 第五步：修复方案

#### 方案选型

| 方案 | 做法 | 缺点 |
|---|---|---|
| A. 改 IP | 把节点 server 从域名改成当前可达 IP | 治标，GSLB 漂移后还会失效 |
| B. 订阅自动化 | URL 放 `.env`，脚本定期拉取更新 | 治本，一劳永逸 |

选 B。关键设计约束：

1. **mihomo 不支持 config.yaml 里 `${VAR}` 环境变量展开**（实测报 `unsupported protocol scheme`）→ 不能用 `url: "${SUB_URL}"`
2. 但支持 **`type: file` 的 provider**：config 只引用本地文件，URL 完全不需要出现在 config.yaml

最终架构（三层分离）：

```
~/.hermes/.env                              # VPN_SUBSCRIBE_URL="https://..."（敏感信息，chmod 600）
~/.config/mihomo/update-subscription.sh     # 拉取脚本：source .env → curl → base64 校验 → 原子写入
~/.config/mihomo/providers/airport.yaml     # 订阅落地文件（chmod 600）
~/.config/mihomo/config.yaml                # proxy-providers: {type: file, path: ./providers/airport.yaml}
```

#### 踩过的坑

1. **`--noproxy '*' --proxy ...` 组合会禁用代理**：`--noproxy '*'` 覆盖 `--proxy`，导致测试时 curl 直连（当然超时），一度误判「代理还没修好」。测试代理必须用纯 `--proxy http://127.0.0.1:7890`。

2. **订阅里的「剩余流量/套餐到期」是伪节点**：它们是 anytls 类型的占位节点（显示流量信息），不是真实可用节点。节点选择组默认可能选中它们导致全挂，猜测这也是主要原因。

3. **延迟测试通过 ≠ 实际转发可用**：`cp.cloudflare.com` 健康检查通过的节点（如台湾 09，98ms），实际访问 x.com 却超时。原因是腾讯云对台湾 Hinet 段的部分 IP 存在 UDP/路由限制，而健康检查走的是 Cloudflare。

4. **节点分钟级波动**：手动实测「通过」的节点，几分钟后就挂。固定选一个节点必然翻车。

5. **file provider 的 path 必须在 mihomo home 目录内**（新版本安全限制：`path is not subpath of home directory or SAFE_PATHS`）。

### 第六步：最终方案——URLTest 自动选择组

既然节点分钟级波动，固定节点不可靠，最终用 **URLTest 自动选择组**：

```yaml
proxy-groups:
  - name: 自动选择
    type: url-test
    proxies: []
    url: https://www.gstatic.com/generate_204   # 关键：换成真实可达性测试
    interval: 300
    use:
      - airport
```

**关键改动**：健康检查 URL 从 `http://cp.cloudflare.com/` 改成 `https://www.gstatic.com/generate_204`，interval 从 7200s 缩短到 300s。这样：

- 每 5 分钟自动测试所有节点
- 自动切换到当前可达的节点
- 节点挂掉后自动切换，无需人工干预

### 第七步：自动化——每周三 04:40 自动更新订阅

建了一个 cron（`no_agent` 模式，零 token 消耗）：

```
每周三 04:40
  → update-subscription.sh（拉取 .env 里的订阅 → base64 校验 → 原子写入）
  → 重启 mihomo
  → 切「自动选择」组（gstatic 健康检查，300s 自动切换）
  → x.com 实测确认
  → 飞书通知：「✅ 订阅已更新并生效 | 自动选择当前节点: X」
```

## 验证结果

修复后实测：

```
x.com      => 200 (0.7s)   ✅
twitter.com => 200 (4.5s)  ✅
twitter-cli => 拿到真实推文（@NousResearch 当天发布的 DeepSeek V4 Flash 折扣消息）✅
```

连测 5 次 x.com 全部 200（0.5-1.8s），自动选择组稳定锁定可达节点。

## 经验总结

1. **代理全挂 ≠ 目标站点被封**：先测 github/google 等无关站点，区分「节点故障」还是「站点屏蔽」。
2. **用户在境外可达 = 节点活着**：问题大概率在本地到节点的链路（GSLB 漂移 / 订阅过期）。
3. **静态订阅配置要设自动更新**：机场 GSLB 会定期换 IP 池，配置不更新就是慢性死亡。这次是 4 个月，下次可能是 1 个月。
4. **健康检查 URL 选真实可达性指标**：`cp.cloudflare.com` 有假阳性，`gstatic.com/generate_204` 更可靠。
5. **敏感信息（订阅 URL = 机场凭证）放 `.env`**：权限 600，config.yaml 只引用本地文件，URL 不出现在配置里。
