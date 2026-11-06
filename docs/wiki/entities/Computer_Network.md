---
title: 计算机网络
description: 计算机网络协议与原理，TCP/IP 五层模型，Kurose & Ross 教材
type: entity
tags: [Network, TCP, UDP, HTTP, DNS, Router, WiFi, Channel]
updated: 2026-11-05
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
- rdt 协议演化
- [WiFi 5GHz DFS 雷达避让致图片加载慢](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- [Switch 5GHz 信道白名单（搜不到 5G）](../concepts/Switch-5GHz-Channel-Whitelist.md)

## 无线链路排障（WiFi / 802.11）

两条实战记录，都以「现象指纹」先分诊，再分层取证：

- **5GHz 可见但传输间歇挂起** → DFS 频段（52–140）雷达避让机制；关 DFS + Channel Finder 落地非 DFS 信道解决。详见 [WiFi 5GHz DFS 信道雷达避让：社交平台图片加载缓慢问题排查](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- **5GHz 完全不在扫描列表** → 客户端区域固件白名单（Switch 仅 36/40/44/48），属信道问题而非加密/协议；改路由器信道前必须先关自动选频。详见 [Nintendo Switch 5GHz 搜不到：信道白名单与路由器手动选频排查](../concepts/Switch-5GHz-Channel-Whitelist.md)

## Source

[计算机网络知识域摘要](../sources/Computer_Network.md)
