---
title: TCP 与 UDP 对比
description: "传输层两大协议的区别：可靠连接 vs 实时性"
type: concept
tags: [Network, TCP, UDP, Transport-Layer]
sources: [../../learningNote/Computer_Network/TCP与UDP与他们的关系.md]
lastUpdated: 2026-04-17
---

# TCP vs UDP

TCP 和 UDP 是传输层的两大核心协议。

## 对比

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接性 | 面向连接 | 无连接 |
| 可靠性 | 可靠（重传、确认）| 不可靠 |
| 有序性 | 保证顺序 | 不保证 |
| 拥塞控制 | 有 | 无 |
| 头部大小 | 20~60 字节 | 8 字节 |
| 速度 | 较慢 | 快 |
| 使用场景 | HTTP, SMTP, SSH | DNS, DHCP, 视频流 |

## 三次握手 / 四次挥手

- **三次握手**：SYN → SYN-ACK → ACK（建立连接）
- **四次挥手**：FIN → ACK → FIN → ACK（关闭连接）

## 相关

- [[../entities/Computer_Network.md]]
