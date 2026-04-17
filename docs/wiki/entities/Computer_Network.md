---
title: 计算机网络
description: 计算机网络协议与原理，TCP/IP 五层模型，Kurose & Ross 教材
type: entity
tags: [Network, TCP, UDP, HTTP, DNS, Router]
lastUpdated: 2026-04-17
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

- [[../concepts/URL到页面显示.md]] — 综合流程
- [[../concepts/TCP与UDP.md]] — 传输层对比
- [[../concepts/可靠数据传输.md]] — rdt 协议演化

## Source

[[../sources/Computer_Network.md]]
