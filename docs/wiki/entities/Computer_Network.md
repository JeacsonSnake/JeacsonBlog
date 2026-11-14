---
title: 计算机网络
description: 计算机网络协议与原理，TCP/IP 五层模型，Kurose & Ross 教材
type: entity
tags: [Network, TCP, UDP, HTTP, DNS, Router, WiFi, Channel]
created: 2026-04-17
updated: 2026-11-05
article: false
author: 'Hermes_Agent_cRl1_bot'
---

# 计算机网络

计算机网络是计算机科学的基础领域之一，博客以 *Computer Networking: A Top-Down Approach* 教材为主参考。

## 五层模型

| 层次 | 主要协议 | 主要设备 |
|------|---------|---------|
| 应用层 | HTTP, DNS, SMTP | — |
| 传输层 | TCP, UDP | — |
| 网络层 | IP, ICMP, OSPF | 路由器 |
| 链路层 | Ethernet, PPP | 交换机 |
| 物理层 | 光/电信号 | 集线器 |

## 核心知识点

| 主题 | 描述 |
|------|------|
| TCP vs UDP | 可靠 vs 实时 |
| 三次握手 | TCP 连接建立 |
| 四次挥手 | TCP 连接关闭 |
| HTTP 协议 | 请求/响应模型 |
| DNS 解析 | 域名→IP |

## 重要概念

- [综合流程](../concepts/URL到页面显示.md)
- [传输层对比](../concepts/TCP与UDP.md)
- [可靠数据传输原理：rdt 1.0 → 3.0、停等与流水线、GBN / SR](../concepts/可靠数据传输.md)
- [WiFi 5GHz DFS 雷达避让致图片加载慢](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- [Switch 5GHz 信道白名单（搜不到 5G）](../concepts/Switch-5GHz-Channel-Whitelist.md)
- [UDP 校验和：反码求和与「全 1 即通过」](../concepts/UDP校验和.md)
- [TCP/IP 五层模型：每层解决什么问题](../concepts/TCP-IP五层模型.md)
- [VLAN：802.1Q 标签与三种端口](../concepts/VLAN.md)
- [SMTP：推与拉的边界](../concepts/SMTP.md)
- [PPP 与 PPPoE：点对点协议与宽带拨号](../concepts/PPP与PPPoE.md)
- [链路发现协议（LLDP）](../concepts/链路发现协议.md)
- [黑洞路由：出口指向 NULL0](../concepts/黑洞路由.md)

## 无线链路排障（WiFi / 802.11）

两条实战记录，都以「现象指纹」先分诊，再分层取证：

- **5GHz 可见但传输间歇挂起** → DFS 频段（52–140）雷达避让机制；关 DFS + Channel Finder 落地非 DFS 信道解决。详见 [WiFi 5GHz DFS 信道雷达避让：社交平台图片加载缓慢问题排查](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- **5GHz 完全不在扫描列表** → 客户端区域固件白名单（Switch 仅 36/40/44/48），属信道问题而非加密/协议；改路由器信道前必须先关自动选频。详见 [Nintendo Switch 5GHz 搜不到：信道白名单与路由器手动选频排查](../concepts/Switch-5GHz-Channel-Whitelist.md)

## Source

[计算机网络知识域摘要](../sources/Computer_Network.md)
