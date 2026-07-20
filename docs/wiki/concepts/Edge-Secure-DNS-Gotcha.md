---
title: Edge 浏览器「使用安全的 DNS」选项的副作用与排查
description: "不要随意修改 Microsoft Edge 的「使用安全的 DNS」选项：会导致 curl 缓存错误 IP、TCP 三次握手成功但 ClientHello 后 RST 的诡异断网现象"
created: 2026-07-01
updated: 2026-07-01
type: concept
tags: [DevOps, DNS, Edge, Browser, Troubleshooting, Network]
sources:
  - docs/postMortem/sp_for_LLM/2026_06_29.md
related:
  - docs/wiki/sources/PostMortem.md
---

# Edge 浏览器「使用安全的 DNS」选项的副作用与排查

## 核心结论

> **永远不要随意修改 Edge 浏览器里的「使用安全的 DNS」选项。**

这个选项一旦切到非默认的 DoH（DNS over HTTPS）服务（如 Cloudflare），会同时污染 `curl` 的 DNS 缓存，导致看似毫无关联的命令行工具出现诡异断网。

## 现象

跨网络环境（香港 → 内地）切换后，特定网址在某台电脑上打不开，但其他设备正常。

## 根因

Edge 浏览器里「使用安全的 DNS」选项选择了 Cloudflare DoH（如 `https://cloudflare-dns.com/dns-query`）作为 DNS 解析器。问题链条：

1. Edge 发起对 DoH 端点的 HTTPS 请求
2. **TCP 三次握手成功**，`ClientHello` 成功发出
3. **服务器（或前序网络设备）在收到 `ClientHello` 后立即返回 `RST`**
4. 内地网络对 Cloudflare DoH 端点的 IP 段有阻挡
5. 由于未知原因，**这个错误解析结果会被 `curl` 缓存下来**
6. 结果：`nslookup` 显示一组 IP，但 `curl` 调用的是另一组 IP，`curl` 也连不通

## 排查线索

| 工具 | 表现 |
|---|---|
| `nslookup <domain>` | 返回正常 IP（系统 DNS 解析） |
| `curl -v https://<domain>` | TCP 三次握手成功但握手后立即 RST |
| 浏览器（Edge） | 同样网站能打开（走 DoH 但 Edge 内置 fallback） |
| 浏览器（Chrome / Firefox） | 可能正常（未配置 DoH） |
| 其他设备 | 完全正常 |

最迷惑的对比：`nslookup` 和 `curl` 看到的 IP **不一致**。

## 修复

1. Edge 右上角 `⋯` → **设置**
2. 搜索「使用安全的 DNS」
3. **关闭**「使用安全的 DNS」开关
4. 重启 Edge
5. 清空 `curl` DNS 缓存（如有）：
   - Windows：重启系统或 `ipconfig /flushdns`（仅清系统 DNS，对 curl 不一定有效）
   - macOS：`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
6. 验证：`curl -v https://<之前打不开的网址>` 应该恢复正常

## 关键陷阱

- **`curl` 也会被污染** — Edge 改了 DoH 后，curl 会复用 Edge 缓存的错误 IP（不是系统 DNS 缓存）。这个跨进程污染机制未完全理解，但稳定可复现。
- **不要与系统 DNS 混淆** — 即使 `/etc/resolv.conf` 或 Windows 网络设置是正常的，Edge 的 DoH 仍会覆盖 curl 的解析结果。
- **网络环境变化会触发** — 从海外回内地、从公司回家里等切换 VPN/网络环境的场景特别容易踩到。

## 教训

- DoH 设计本意是保护隐私（防止运营商 DNS 劫持），但在受限网络环境下反而成为「不透明故障源」。
- 跨设备对比是最高效的排查手段：发现只有一台设备异常，立即检查浏览器 DoH / VPN / 代理设置。
- 不要在未知网络环境（如酒店、跨国家差旅）下启用任何形式的「安全 DNS」选项。
