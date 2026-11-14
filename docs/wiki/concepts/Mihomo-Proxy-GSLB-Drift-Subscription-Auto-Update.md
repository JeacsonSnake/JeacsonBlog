---
title: "Mihomo 代理全挂修复：GSLB IP 池漂移与订阅自动更新"
description: "代理 12 节点全挂后的修复方案：为何选订阅自动化而不是改 IP、mihomo 不支持 config.yaml 变量展开所以改用 type: file provider、三层分离架构（.env 存 URL + update-subscription.sh + providers 文件）、URLTest 自动选择组（gstatic 健康检查 + 300s 间隔）与每周三 04:40 的订阅更新 cron；含修复后验证方式与 5 条经验"
created: 2026-08-10
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [DevOps, Hermes Agent, mihomo, Network, Proxy, Tencent Cloud, Troubleshooting, GSLB, Cron]
sources:
  - docs/postMortem/deploy/007_Troubleshooting_complete_failure_of_Tencent_Cloud_server_proxies.md
related:
  - ../entities/Hermes-Agent.md
  - ../sources/PostMortem.md
  - ./Mihomo-IP-Pool-Drift-Diagnosis.md
  - ./Hermes-Agent-Cronjob-Setup.md
  - ./Edge-Secure-DNS-Gotcha.md
  - ./Ubuntu-gdm3-Disk-Full-Troubleshooting.md
---

# Mihomo 代理全挂修复 — GSLB IP 池漂移与订阅自动更新

## 核心结论

> **mihomo 代理全挂 ≠ 目标站点被封。** 若用户本人在境外可达节点而广州服务器不可达 → 根因大概率是 **GSLB 域名解析 IP 池漂移 + 静态订阅过期**。修复方案是订阅自动化（`.env` 存 URL + 脚本定期拉取 + mihomo `type: file` provider），而不是临时把节点 server 改成某个当前可达 IP。

本页讲**修复**。怎么一步步把故障归到 GSLB 漂移（含 12 节点逐个切换、`dig` 取证、自举死锁的处理）在诊断篇：

→ [Mihomo 12 节点全挂诊断实录](./Mihomo-IP-Pool-Drift-Diagnosis.md)

## 故障现象

Hermes Agent 部署在腾讯云轻量应用服务器（广州），日常跑多个 cron，其中"AI 每日简报"依赖本机 mihomo（`127.0.0.1:7890`）访问境外服务。

某天简报里 Twitter 段变成：

> ⚠️ **追踪账号全部无响应** — x.com 直连被屏蔽，所有代理节点 TLS 失败

第一反应是"Twitter 又封了代理出口 IP"，但 `github.com`、`google.com` 走代理也全部超时 → 不是单站点问题。

## 根因（一段话）

`dig` 节点域名每次返回不同 IP（GSLB 多 IP 轮询，台湾 Hinet 段大部分从广州不可达），而 `config.yaml` 的修改时间是 4 个月前、订阅流量数字也旧了 —— 机场早换了 IP 池，本地还拿着旧配置。

**所以问题不是"某个 IP 不可用"，而是"订阅不更新"这件事本身。** 治 IP 是治症状，治订阅才是治因。

## 方案选型

| 方案 | 做法 | 缺点 |
|---|---|---|
| A. 改 IP | 把节点 server 从域名改成当前可达 IP | 治标，GSLB 漂移后还会失效 |
| B. 订阅自动化 | URL 放 `.env`，脚本定期拉取更新 | 治本，一劳永逸 |

选 B。关键设计约束：

1. **mihomo 不支持 config.yaml 里 `${VAR}` 环境变量展开**（实测报 `unsupported protocol scheme`）→ 不能写 `url: "${SUB_URL}"`
2. 但支持 **`type: file` 的 provider**：config 只引用本地文件，URL 完全不出现在 config.yaml

## 三层分离架构

```
~/.hermes/.env                              # VPN_SUBSCRIBE_URL="https://..."（敏感信息，chmod 600）
~/.config/mihomo/update-subscription.sh     # 拉取脚本：source .env → curl → base64 校验 → 原子写入
~/.config/mihomo/providers/airport.yaml     # 订阅落地文件（chmod 600）
~/.config/mihomo/config.yaml                # proxy-providers: {type: file, path: ./providers/airport.yaml}
```

三层的分工：**凭证**只在 `.env`，**动作**只在脚本，**数据**只在 providers 文件，config.yaml 里一个密钥都没有 —— 这样 config 可以随便备份、贴给别人看。

## URLTest 自动选择组（核心修复的一半）

节点是分钟级波动的，固定节点必然翻车，所以用 url-test 让 mihomo 自己挑：

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

**两处关键改动**：健康检查 URL 从 `http://cp.cloudflare.com/` 改成 `https://www.gstatic.com/generate_204`（Cloudflare 那条有假阳性：检查通过但实际访问 x.com 超时），interval 从 7200s 缩到 300s。效果：每 5 分钟全量测速并切到当前可达节点，节点挂掉自动换，不用人工干预。

## 订阅自动更新（另一半）

cron（`no_agent` 模式，零 token 消耗）：

```
每周三 04:40
  → update-subscription.sh（拉取 .env 里的订阅 → base64 校验 → 原子写入）
  → 重启 mihomo
  → 切"自动选择"组（gstatic 健康检查，300s 自动切换）
  → x.com 实测确认
  → 飞书通知："✅ 订阅已更新并生效 | 自动选择当前节点: X"
```

为什么是每周三：机场 IP 池漂移以周为单位，日更没必要，月更太迟；04:40 避开白天所有 cron 时段。

## 修复时的三个陷阱

1. **订阅里的"剩余流量/套餐到期"是伪节点**：anytls 占位节点，只显示流量信息；节点选择组默认可能选中它们，导致"配置更新了却还是全挂"。
2. **健康检查通过 ≠ 转发可用**：见上文 Cloudflare 假阳性，改 gstatic 后才有判别力。
3. **file provider 的 path 必须在 mihomo home 目录内**（新版安全限制：`path is not subpath of home directory or SAFE_PATHS`）。

其余两个纯诊断侧的坑（`--noproxy '*'` 覆盖 `--proxy`、节点分钟级波动）记在诊断篇。

## 验证结果

```
x.com      => 200 (0.7s)   ✅
twitter.com => 200 (4.5s)  ✅
twitter-cli => 拿到真实推文（@NousResearch 当天发布的 DeepSeek V4 Flash 折扣消息）✅
```

连测 5 次 x.com 全部 200（0.5–1.8s），自动选择组稳定锁定可达节点。

## 经验总结（5 条）

1. **代理全挂 ≠ 目标站点被封**：先测 github/google 等无关站点，区分"节点故障"还是"站点屏蔽"。
2. **用户在境外可达 = 节点活着**：问题大概率在本地到节点的链路（GSLB 漂移 / 订阅过期）。
3. **静态订阅配置必须设自动更新**：机场 GSLB 定期换 IP 池，配置不更新就是慢性死亡。这次是 4 个月，下次可能是 1 个月。
4. **健康检查 URL 选真实可达性指标**：`cp.cloudflare.com` 有假阳性，`gstatic.com/generate_204` 更可靠。
5. **敏感信息（订阅 URL = 机场凭证）放 `.env`**：权限 600，config.yaml 只引用本地文件，URL 不出现在配置里。

## 与相邻故障的关系

- [同一故障的诊断过程：12 节点逐个切换、`dig` 取证、自举死锁](./Mihomo-IP-Pool-Drift-Diagnosis.md)
- [同样是 VPS 部署层的踩坑，但侧重启停服/网关注入；本页侧重代理链路的修复](./Hermes-Agent-Cronjob-Setup.md)
- [同样是"本地网络配置异常导致跨境服务全挂"，Edge 走 DoH 污染 curl DNS 缓存；mihomo 走 GSLB 漂移。**共同教训：跨境服务必须验证多个独立诊断维度（DNS / TCP / HTTP）**](./Edge-Secure-DNS-Gotcha.md)
- [同样是"服务无法启动"型故障的排查范式；本页的反面是"网络服务挂着但实际没工作"，需要外部主动探测](./Ubuntu-gdm3-Disk-Full-Troubleshooting.md)
- [AI Daily Briefing 因 brotli bug 失败；本页是同一 job 的另一条失败路径（代理链路层）。**两条路径都会让 cron 静默失败**](./AI-Daily-Briefing-Brotli-Fix-Investigation.md)
