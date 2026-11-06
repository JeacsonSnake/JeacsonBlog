---
title: "Mihomo 12 节点全挂诊断实录：从 TCP 屏蔽到 GSLB IP 池漂移"
description: "代理全挂时如何用 5 层取证把\"节点故障\"与\"站点屏蔽\"分开：直连基线 → 走代理跨站点验证（github 也挂 = 链路问题）→ 12 节点逐个切换 → 用户境外裸连证明节点活着 → dig 节点域名观察 IP 轮询 + config.yaml 修改时间推定订阅过期；附自举失败（mihomo 与 hermes update 互相依赖）的处理与 5 个诊断陷阱（--noproxy 覆盖 --proxy、订阅伪节点、Cloudflare 健康检查假阳性、节点分钟级波动、file provider path 限制）"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [DevOps, mihomo, Network, Proxy, Troubleshooting, GSLB, Tencent Cloud, Diagnosis]
sources:
  - docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md
related:
  - ./Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md
  - ./Edge-Secure-DNS-Gotcha.md
  - ./Hermes-Agent-Cronjob-Setup.md
---

# Mihomo 12 节点全挂诊断实录

## 什么时候用这一页

代理里**所有**节点同时不可用，而你不知道该怀疑节点、机场还是本机链路时。目标不是立刻修，而是**在 20 分钟内把故障归到四类之一**：站点屏蔽 / 节点故障 / 本地→节点链路异常 / 配置过期。

修复方案（订阅自动化 + URLTest）在主页：[Mihomo 代理全挂排查：GSLB IP 池漂移与订阅自动更新](./Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md)。

## 核心结论

> **代理全挂 ≠ 目标站点被封。** 判定顺序是：先用**无关站点**（github / google / discord）区分"单站点屏蔽"还是"链路全断"；再用 REST API 逐节点切换确认是**节点层**故障；再用"用户在境外裸连节点服务器"确认节点本身活着；最后 `dig` 节点域名看是否每次返回不同 IP（GSLB 轮询），配合 `config.yaml` 的修改时间判断订阅是否过期。

五步速查：

| 步 | 动作 | 判读 |
|---|---|---|
| 1 | 直连 + 走代理各测一次 github/google | 走代理也全挂 → 链路问题，不是目标站点 |
| 2 | mihomo REST API 逐节点切换（12 个） | 全挂 → 节点层故障 |
| 3 | 用户在境外裸连节点服务器 | 能通 → 节点活着，问题在本机到节点这段 |
| 4 | `dig` 节点域名 + 看 `config.yaml` mtime | 每次 IP 不同 = GSLB 漂移；mtime 是几个月前 = 订阅过期 |
| 5 | 选修复方向 | 改 IP 治标，订阅自动化治本 |

## Step 1：区分"TCP 屏蔽"还是"节点故障"

直连测试（预期内的超时，腾讯云出疆屏蔽是已知事实，不构成信息）：

```
https://x.com           => 000 (10s timeout)
https://twitter.com     => 000 (10s timeout)
https://api.twitter.com => 000 (10s timeout)
```

同一批域名走代理再测：

```
https://x.com       => 000 (5s timeout)
https://github.com  => 000 (5s timeout)   # 关键：github 也挂 = 不是 x.com 的问题
https://discord.com => 000 (5s timeout)
https://google.com  => 000 (5s timeout)
```

**github / google 走代理也超时**，故障就在代理链路本身。此时看 mihomo 日志确认单位：

```
[TCP] dial 节点选择 (match DomainSuffix/github.com) ... error: context deadline exceeded
[TCP] dial 节点选择 (match DomainSuffix/x.com) ... error: context deadline exceeded
```

所有 dial 都是 `context deadline exceeded` → 节点层故障，不是 DNS，也不是目标站点。

## Step 2：逐个切换 12 个节点

mihomo REST API（`127.0.0.1:9090`）遍历：

```bash
# 遍历所有节点，切换后 curl 测试
for NODE in "直连 台湾 01 | 0.5x" "直连 台湾 02 | 0.5x" ...; do
  curl -X PUT "http://127.0.0.1:9090/proxies/节点选择" -d "{\"name\":\"$NODE\"}"
  curl --proxy http://127.0.0.1:7890 https://x.com
done
```

结果：**12 个节点全部超时**。延迟测试接口同样全军覆没：

```
直连 台湾 04 | 0.5x   不可达 (HTTP 504)
直连 日本 01 | 0.5x   不可达 (HTTP 504)
直连 美国 03 | 0.5x   不可达 (HTTP 504)
```

## Step 3：用户境外可达 = 节点活着

在深圳/香港的电脑（HKT，未开代理）**能直连代理节点服务器** →

- 节点服务器**活着**（不是机场跑路）
- 问题在"广州服务器 → 节点服务器"这一段

同时确认 **UDP 53 出站是通的**（DNS 解析正常），说明腾讯云没有封 UDP 出站，排除"全协议封锁"。

## Step 4（关键转折）：GSLB IP 池漂移 + 订阅过期

`dig` 节点域名，**每次解析返回不同的 IP**：

```
v951-zj.71edge.work => 61.228.250.100 (可达) / 61.228.249.36 (超时) / 36.231.117.240 (超时) ...
```

这是典型的 **GSLB（全局负载均衡）多 IP 轮询**。机场把节点域名解析到一堆 IP 上，但**其中大部分 IP 从腾讯云广州不可达**（台湾 Hinet 段 `36.230.x` / `61.228.x` / `218.172.x` 被屏蔽或路由不通）。客户端拿到哪个 IP 全靠运气。

再看 `config.yaml` 的修改时间：**2026-04-16** —— 4 个月前的静态配置。订阅里的"剩余流量：24.53 GB"，而机场新订阅返回"24.96 GB" → **配置里的订阅早过期**，机场的 GSLB 早就换了 IP 池，旧 IP 全部失效。

> **根因：不是 x.com 被封，是 mihomo 的静态订阅配置 4 个月没更新，GSLB IP 池漂移后旧 IP 全部不可达。**

## 插曲：自举失败（mihomo 与 hermes update 互相依赖）

在了解问题后，因介质原因未能直接更新。8 月 10 日发现**所有**定时任务都没返回消息。进入腾讯轻量云控制台 `https://console.cloud.tencent.com/lighthouse/instance/detail` 的远程终端 `https://orcaterm.cloud.tencent.com/terminal`，发现"虽能通过 gateway 正确接收信息，但连接 LLM 分析时网络超时失败"。

### 失败的做法

先关闭 mihomo：

```
systemctl --user stop mihomo.service
systemctl --user disable mihomo.service
```

然后发现之前配置耦合度过高，IP 冲突导致无法裸连 GitHub 更新：

```
ubuntu@VM-0-2-ubuntu:~$ hermes update
⚕ Updating Hermes Agent...

◆ Pre-update snapshot: 20260810-031752-pre-update

⚠ Updating from fork:
  https://«redacted»@github.com/NousResearch/hermes-agent.git

→ Fetching updates...
✗ Network error — cannot reach the remote repository.
  fatal: unable to access 'https://github.com/NousResearch/hermes-agent.git/': Failed to connect to 127.0.0.1 port 7890 after 0 ms: Couldn't connect to server
```

> 这里的 `7890` 端口就是之前 mihomo 使用的端口 —— 关了代理，`hermes update` 也跟着断，形成死锁。

### 死马当活马医

```bash
systemctl --user start mihomo.service
systemctl --user enable mihomo.service
```

重启后用 `proxy-latency-check 5` 做节点选择，在**还未更新 IP 池**的前提下抓到一个还能用的节点，总算连上 LLM 继续修。

> 教训：**修代理的工具链本身依赖代理**时，先保留一个"能用的旧配置"，否则连自救的通道都没了。

## 踩过的坑（5 个）

1. **`--noproxy '*' --proxy ...` 组合会禁用代理**：`--noproxy '*'` 覆盖 `--proxy`，导致测试时 curl 直连（当然超时），一度误判"代理还没修好"。**测试代理必须用纯 `--proxy http://127.0.0.1:7890`**。

2. **订阅里的"剩余流量/套餐到期"是伪节点**：它们是 anytls 类型的占位节点（只显示流量信息），不是真实可用节点。**节点选择组默认可能选中它们导致全挂**，本次故障这很可能是原因之一。

3. **延迟测试通过 ≠ 实际转发可用**：`cp.cloudflare.com` 健康检查通过的节点（如台湾 09，98ms），实际访问 x.com 却超时。原因是腾讯云对台湾 Hinet 段的部分 IP 存在 UDP/路由限制，而健康检查走的是 Cloudflare。

4. **节点分钟级波动**：手动实测"通过"的节点，几分钟后就挂。**固定选一个节点必然翻车**——这条直接决定了修复必须用 url-test 自动组。

5. **file provider 的 path 必须在 mihomo home 目录内**（新版本安全限制：`path is not subpath of home directory or SAFE_PATHS`）。

## 交接给修复流程

诊断结论一旦落地为"GSLB 漂移 + 订阅过期"，后续动作（方案 A/B 选型、三层分离架构、URLTest 组、cron 自动化、验证）全部在主页：

→ [Mihomo 代理全挂排查：GSLB IP 池漂移与订阅自动更新](./Mihomo-Proxy-GSLB-Drift-Subscription-Auto-Update.md)

## 与相邻故障的关系

- [同样是"本地网络配置异常导致跨境服务全挂"，Edge 走 DoH 污染 curl DNS 缓存；mihomo 走 GSLB 漂移。**共同教训：跨境服务必须验证多个独立诊断维度（DNS / TCP / HTTP），不能只盯一个症状**](./Edge-Secure-DNS-Gotcha.md)
- [同样是 VPS 部署层的踩坑，但侧重启停服/网关注入；本页侧重"代理链路怎么被一步步证伪"](./Hermes-Agent-Cronjob-Setup.md)
- [同样是"服务挂着但实际没工作"，需要外部主动探测；本页的代理进程活着、端口在听，转发却全挂](./Ubuntu-gdm3-Disk-Full-Troubleshooting.md)
