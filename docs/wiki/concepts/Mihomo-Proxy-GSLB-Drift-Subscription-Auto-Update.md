---
title: "Mihomo 代理全挂排查：GSLB IP 池漂移与订阅自动更新"
description: "Hermes Agent 部署在腾讯云时 mihomo 代理 12 节点全挂的根因排查与彻底修复方案：核心结论「代理全挂不等于目标站点被封，而是 GSLB IP 池漂移 + 静态订阅过期」；含 7 步诊断流程、4 步方案选型、URLTest 自动选择组配置、订阅自动化三层分离架构（.env + update-subscription.sh + file provider + cron）、3 个关键陷阱（订阅伪节点、健康检查 URL 选错、节点分钟级波动）"
created: 2026-08-10
updated: 2026-08-10
type: concept
tags: [DevOps, Hermes Agent, mihomo, Network, Proxy, Tencent Cloud, Troubleshooting, GSLB, Cron]
sources:
  - docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md
related:
  - docs/wiki/entities/Hermes-Agent.md
  - docs/wiki/sources/PostMortem.md
  - docs/wiki/concepts/Hermes-Agent-Cronjob-Setup.md
  - docs/wiki/concepts/Edge-Secure-DNS-Gotcha.md
  - docs/wiki/concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md
---

# Mihomo 代理全挂排查 — GSLB IP 池漂移与订阅自动更新

## 核心结论

> **mihomo 代理全挂 ≠ 目标站点被封。** 先测 github/google 等无关站点，区分"节点故障"还是"站点屏蔽"；若用户本人在境外可达节点而广州服务器不可达 → 根因大概率是 **GSLB 域名解析 IP 池漂移 + 静态订阅过期**。修复方案是订阅自动化（`.env` 存 URL + 脚本定期拉取 + mihomo `type: file` provider），而不是临时改 IP。

排查优先级（从最快到最慢）：

1. **第 1 步**：用 `curl --proxy http://127.0.0.1:7890 https://github.com` 测无关站点。**走代理也挂 = 节点故障**，不是目标站点问题
2. **第 2 步**：mihomo REST API（`127.0.0.1:9090`）逐节点切换测试，**全挂 = 节点层故障**
3. **第 3 步**：用户本人在境外**裸连**节点服务器（不走代理）。能通 = 节点活着，问题在本地→节点的链路
4. **第 4 步（关键）**：`dig` 节点域名，发现每次返回不同 IP = **GSLB 漂移**；再看 `config.yaml` 修改时间 = **订阅过期**
5. **第 5 步**：修复选 B（订阅自动化），不要选 A（改 IP）—— A 治标，GSLB 下次漂移还会失效

## 故障现象

Hermes Agent 部署在腾讯云轻量应用服务器（广州），日常跑多个 cron 任务，其中"AI 每日简报"依赖本机 mihomo（`127.0.0.1:7890`）访问境外服务。

某天简报里 Twitter 段变成：

> ⚠️ **追踪账号全部无响应** — x.com 直连被屏蔽，所有代理节点 TLS 失败

第一反应是"Twitter 又封了代理出口 IP"，但发现 `github.com`、`google.com` 走代理也全部超时 → 不是单站点问题。

## 排查路径（7 步）

### Step 1：区分"TCP 屏蔽"还是"节点故障"

直连测试（预期内的超时）：

```
https://x.com          => 000 (10s timeout)  # 腾讯云出疆屏蔽，已知
https://twitter.com    => 000 (10s timeout)
https://api.twitter.com => 000 (10s timeout)
```

走代理测试（发现问题）：

```
https://x.com       => 000 (5s timeout)
https://github.com  => 000 (5s timeout)   # 关键：github 也挂 = 不是 x.com 的问题
https://discord.com => 000 (5s timeout)
https://google.com  => 000 (5s timeout)
```

**走代理连 github/google 都超时** → 故障在代理链路本身，不是目标站点。查看 mihomo 日志：

```
[TCP] dial 节点选择 (match DomainSuffix/github.com) ... error: context deadline exceeded
[TCP] dial 节点选择 (match DomainSuffix/x.com) ... error: context deadline exceeded
```

所有节点 dial 全部 `context deadline exceeded` → **节点层故障**。

### Step 2：测试全部 12 个节点

mihomo REST API（`127.0.0.1:9090`）逐节点切换：

```bash
# 遍历所有节点，切换后 curl 测试
for NODE in "直连 台湾 01 | 0.5x" "直连 台湾 02 | 0.5x" ...; do
  curl -X PUT "http://127.0.0.1:9090/proxies/节点选择" -d "{\"name\":\"$NODE\"}"
  curl --proxy http://127.0.0.1:7890 https://x.com
done
```

结果：**12 个节点全部超时**。同时延迟测试接口确认：

```
直连 台湾 04 | 0.5x   不可达 (HTTP 504)
直连 日本 01 | 0.5x   不可达 (HTTP 504)
直连 美国 03 | 0.5x   不可达 (HTTP 504)
```

### Step 3：用户境外可达 = 节点活着

在深圳/香港的电脑（HKT，未开代理）**能直连代理节点服务器** →

- 节点服务器**活着**（不是机场跑路）
- 问题在"广州服务器 → 节点服务器"这一段

疑点：**UDP 53 出站是通的**（能正常解析 DNS），说明腾讯云没有封 UDP 出站。

### Step 4（关键转折）：找到根因 — GSLB IP 池漂移 + 订阅过期

`dig` 节点域名，发现**每次解析返回不同的 IP**：

```
v951-zj.71edge.work => 61.228.250.100 (可达) / 61.228.249.36 (超时) / 36.231.117.240 (超时) ...
```

这是典型的 **GSLB（全局负载均衡）多 IP 轮询**。机场把节点域名解析到一堆 IP 上，但**其中大部分 IP 从腾讯云广州不可达**（台湾 Hinet 段 `36.230.x` / `61.228.x` / `218.172.x` 被屏蔽或路由不通）。

再看 `config.yaml` 的修改时间：**2026-04-16** —— 4 个月前的静态配置。订阅里的"剩余流量：24.53 GB"，而机场新订阅返回"24.96 GB" → **配置里的订阅早过期了**，机场的 GSLB 早就换了 IP 池，旧 IP 全部失效。

> **根因：不是 x.com 被封，是 mihomo 的静态订阅配置 4 个月没更新，GSLB IP 池漂移后旧 IP 全部不可达。**

### 插曲：自举失败（mihomo 与 hermes update 互相依赖）

在了解问题后，因介质原因未能直接更新。8 月 10 日发现**所有**定时任务都没返回消息。进入腾讯轻量云控制台 `https://console.cloud.tencent.com/lighthouse/instance/detail` 的远程终端 `https://orcaterm.cloud.tencent.com/terminal`，发现"虽能通过 gateway 正确接收信息，但连接 LLM 分析时网络超时失败"。

#### 失败的做法

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
  https://«redacted:ghp_…»@github.com/NousResearch/hermes-agent.git

→ Fetching updates...
✗ Network error — cannot reach the remote repository.
  fatal: unable to access 'https://github.com/NousResearch/hermes-agent.git/': Failed to connect to 127.0.0.1 port 7890 after 0 ms: Couldn't connect to server
```

> 这里的 `7890` 端口就是之前 mihomo 使用的端口。

#### 死马当活马医

```bash
systemctl --user start mihomo.service
systemctl --user enable mihomo.service
```

并重启。用之前写的 `proxy-latency-check 5` 进行节点选择，在**还未更新 IP 池**的前提下抓到一个还能用的节点。然后总算连上 LLM，让它继续修改。

### Step 5：方案选型

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

### 踩过的坑（4 个）

1. **`--noproxy '*' --proxy ...` 组合会禁用代理**：`--noproxy '*'` 覆盖 `--proxy`，导致测试时 curl 直连（当然超时），一度误判"代理还没修好"。**测试代理必须用纯 `--proxy http://127.0.0.1:7890`**。

2. **订阅里的"剩余流量/套餐到期"是伪节点**：它们是 anytls 类型的占位节点（显示流量信息），不是真实可用节点。**节点选择组默认可能选中它们导致全挂**。本次故障猜测这也是主要原因之一。

3. **延迟测试通过 ≠ 实际转发可用**：`cp.cloudflare.com` 健康检查通过的节点（如台湾 09，98ms），实际访问 x.com 却超时。原因是腾讯云对台湾 Hinet 段的部分 IP 存在 UDP/路由限制，而健康检查走的是 Cloudflare。

4. **节点分钟级波动**：手动实测"通过"的节点，几分钟后就挂。**固定选一个节点必然翻车**。

5. **file provider 的 path 必须在 mihomo home 目录内**（新版本安全限制：`path is not subpath of home directory or SAFE_PATHS`）。

### Step 6：URLTest 自动选择组（核心修复）

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

### Step 7：自动化 — 每周三 04:40 自动更新订阅

建了一个 cron（`no_agent` 模式，零 token 消耗）：

```
每周三 04:40
  → update-subscription.sh（拉取 .env 里的订阅 → base64 校验 → 原子写入）
  → 重启 mihomo
  → 切"自动选择"组（gstatic 健康检查，300s 自动切换）
  → x.com 实测确认
  → 飞书通知："✅ 订阅已更新并生效 | 自动选择当前节点: X"
```

## 验证结果

修复后实测：

```
x.com      => 200 (0.7s)   ✅
twitter.com => 200 (4.5s)  ✅
twitter-cli => 拿到真实推文（@NousResearch 当天发布的 DeepSeek V4 Flash 折扣消息）✅
```

连测 5 次 x.com 全部 200（0.5-1.8s），自动选择组稳定锁定可达节点。

## 经验总结（5 条）

1. **代理全挂 ≠ 目标站点被封**：先测 github/google 等无关站点，区分"节点故障"还是"站点屏蔽"。
2. **用户在境外可达 = 节点活着**：问题大概率在本地到节点的链路（GSLB 漂移 / 订阅过期）。
3. **静态订阅配置要设自动更新**：机场 GSLB 会定期换 IP 池，配置不更新就是慢性死亡。这次是 4 个月，下次可能是 1 个月。
4. **健康检查 URL 选真实可达性指标**：`cp.cloudflare.com` 有假阳性，`gstatic.com/generate_204` 更可靠。
5. **敏感信息（订阅 URL = 机场凭证）放 `.env`**：权限 600，config.yaml 只引用本地文件，URL 不出现在配置里。

## 与相邻故障的关系

- [[../concepts/Hermes-Agent-Cronjob-Setup.md]] — 同样是 VPS 部署层的踩坑，但侧重启停服/网关注入；本概念侧重启代理链路
- [[../concepts/Edge-Secure-DNS-Gotcha.md]] — 同样是"本地网络配置异常导致跨境服务全挂"，Edge 走 DoH 污染 curl DNS 缓存；mihomo 走 GSLB 漂移。**两者共同教训：跨境服务必须验证多个独立诊断维度（DNS / TCP / HTTP），不能只盯着一个症状**
- [[../concepts/Ubuntu-gdm3-Disk-Full-Troubleshooting.md]] — 同样是"服务无法启动"型故障的根因排查范式（先区分"服务问题"还是"系统底层问题"），但本概念的反面是"网络服务挂着但实际没工作"，需要外部主动探测
- [[../concepts/AI-Daily-Briefing-Brotli-Fix-Investigation.md]] — AI Daily Briefing 因 brotli bug 失败的根因；本概念也是 AI Daily Briefing 失败的原因之一（代理链路层）。**两条故障路径都会让 cron 静默失败**

## 关键陷阱（写入 entities/Hermes-Agent.md）

- **代理全挂 = 节点链路问题，不是目标站点被封**：走代理连 github/google 也挂 = 节点层故障
- **mihomo 静态订阅 = 慢性死亡**：机场 GSLB 漂移是常态，配置不自动更新必然遇到
- **健康检查 URL 选择 = 真假阳性分水岭**：`cp.cloudflare.com` 假阳性多，`gstatic.com/generate_204` 更可靠
- **固定节点 = 必然翻车**：节点分钟级波动，必须用 URLTest 自动选择
- **mihomo 不支持 config.yaml 环境变量展开**：必须用 `type: file` provider + `.env` 分离敏感信息
