---
title: 计算机网络知识域摘要
description: 计算机网络原理与协议学习笔记，参考《Computer Networking: A Top-Down Approach》
type: source
tags: [Computer, Network, TCP, UDP, HTTP, DNS]
lastUpdated: 2026-04-17
---

# 计算机网络知识域

本目录对应 `docs/learningNote/Computer_Network/`，以教材 *Computer Networking: A Top-Down Approach* (Kurose & Ross, 7th Ed.) 为主参考。

## 核心主题

### 协议与层次模型
- **TCP/IP 五层模型** — 应用层 → 传输层 → 网络层 → 链路层 → 物理层
- **TCP vs UDP** — 可靠 vs 不可靠，面向连接 vs 无连接，拥塞控制 vs 无控制
- **HTTP/SMTP/DNS** — 应用层主要协议

### 关键机制
- **可靠数据传输原理** — rdt 协议演化（rdt1.0 → rdt2.0 → rdt3.0）
- **UDP 校验和** — 数据完整性检验
- **PPP 与 PPPoE** — 点对点协议及其以太网封装
- **VLAN** — 虚拟局域网
- **链路发现协议** — 交换机/路由器学习机制
- **黑洞路由** — 路由黑洞问题

### 综合流程
- **输入 URL 回车后发生了什么** — DNS → TCP三次握手 → HTTP请求/响应 → 渲染，综合性最强

## 相关笔记

| 笔记文件 | 主题 |
|---------|------|
| `输入URL回车后发生了什么.md` | 综合流程 |
| `TCP与UDP与他们的关系.md` | TCP vs UDP |
| `UDP校验和.md` | UDP 校验和机制 |
| `关于TCP_IP的五层模型.md` | 五层模型 |
| `关于VLAN.md` | VLAN |
| `什么是SMTP.md` | SMTP 邮件协议 |
| `可靠数据的传输原理.md` | rdt 协议 |
| `黑洞路由.md` | 路由黑洞 |

## 关联实体

- [[../entities/Computer_Network.md]] — 计算机网络
