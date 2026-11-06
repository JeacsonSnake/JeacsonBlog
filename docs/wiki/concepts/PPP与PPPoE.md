---
title: "PPP 与 PPPoE：点对点链路协议，以及为什么要把它塞进以太网"
description: "PPP 作为二层协议为点对点链路提供多协议封装（拨号上网获取 IP），但它要求两端是点对点关系，不适用于广播型以太网；PPPoE 把 PPP 封装进以太网帧，从而在共享以太网上为每个用户建立独立的 PPP 会话，兼顾宽带接入、接入控制与计费"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [Network, PPP, PPPoE, Data-Link, Broadband]
sources:
  - docs/learningNote/Computer_Network/关于ppp协议与pppoe协议.md
related:
  - ./TCP-IP五层模型.md
  - ./VLAN.md
  - ../entities/Computer_Network.md
---

# PPP 与 PPPoE

## 核心结论

> PPP 是**点对点链路的二层协议**，为在点对点连接上传输多协议数据包提供标准方法；PPPoE 则把 PPP 封装进以太网帧，让「共享广播网络」也能为每个用户维持一条**独立的点对点会话**——宽带拨号上网就是这么来的。

## 一、PPP（Point to Point Protocol）

- 定位：**二层（数据链路层）协议**；
- 作用：为点对点连接上的多协议数据包提供标准封装方法，支持在各种物理类型的点对点串行线路上承载上层协议报文；
- 典型用途：**拨号上网**时客户端向服务器获取 IP 地址（PPP 会话中通过 IPCP 协商地址）。

PPP 的关键能力（承接教材框架）是「封装 + 链路控制 + 网络控制」三件套：把上层报文封成帧、用 LCP 建立/维护/拆除链路、用 NCP（IPv4 下即 IPCP）协商网络层参数。

## 二、PPPoE（PPP over Ethernet）

PPP 的前提是**通信双方是点对点关系**，而以太网是广播型、支持多点访问的网络，直接把 PPP 用在以太网上并不成立。于是有了 PPPoE：

> PPPoE（Point-to-Point Protocol over Ethernet）是把 PPP 封装在以太网框架中的一种**网络隧道协议**。

它带来两件事：

1. **宽带接入手段** —— 桥接以太网接入的用户也能获得 PPP 会话级的接入；
2. **接入控制与计费** —— 每个接入用户建立**独一无二的 PPP 会话**，天然可做认证（PAP/CHAP）与按会话计费。

## 三、两者关系一句话

```
应用数据
  ↓ PPP 封装（多协议、链路控制、认证）
  ↓ PPPoE 封装（塞进以太网帧，加 PPPoE 头）
  ↓ 以太网（广播域内点对点会话）
```

PPPoE 有两个阶段：**发现阶段**（PPPoE Discovery，通过 PADI/PADO/PADR/PADS 找到对端并分配 Session ID）与**会话阶段**（真正的 PPP 协商与数据传送）。家宽光猫拨号时看到的「PPPoE 账号密码」就是会话阶段前的认证。

## 四、排障提示

- 拨号失败先分阶段：发现阶段失败（找不到 BRAS/OLT 侧响应）与认证失败（账号/密码/绑定）是两类完全不同的问题；
- PPPoE 会引入 **MTU/MSS 开销**（PPPoE 头 + PPP 头），家宽常见 MTU 1492 —— 表现为「能打开网页但大文件/HTTPS 卡住」，是经典的 MSS clamping 场景；
- 对比记忆：PPPoE 是「以太网上的 PPP」，而 PPP 本身也可跑在串口、E1、DSL 等点对点介质上。

## 来源

- 原文：[关于 ppp 协议与 pppoe 协议](../../learningNote/Computer_Network/关于ppp协议与pppoe协议.md)
- 相邻概念：[TCP/IP 五层模型](./TCP-IP五层模型.md)、[VLAN](./VLAN.md)
