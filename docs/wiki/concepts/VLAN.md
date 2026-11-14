---
title: "VLAN：用 802.1Q 标签把一个交换机切成多个广播域"
description: "VLAN 的标签结构（TPID 0x8100 + TCI：User Priority / CFI / 12 位 VID，有效 1–4094）、Access / Trunk / Hybrid 三种端口的收发规则、PVID 与 Tagged/Untagged 的对应关系，以及 VLAN 间为什么必须走三层"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [Network, VLAN, 802.1Q, Switching, Broadcast-Domain]
sources:
  - docs/learningNote/Computer_Network/关于VLAN.md
related:
  - ./TCP-IP五层模型.md
  - ../entities/Computer_Network.md
---

# VLAN（虚拟局域网）

## 核心结论

> VLAN 把一个物理 LAN 在逻辑上切成多个**广播域**：同 VLAN 内可直接二层通信，跨 VLAN 必须经过三层网关。实现手段是在以太网帧里插一个 **4 字节 802.1Q 标签**，让交换机能区分「这一帧属于哪个广播域」。

## 一、概念

VLAN（Virtual Local Area Network）是将一个物理 LAN 在逻辑上划分为多个广播域的通信技术：VLAN 内主机可直接通信，VLAN 间不能直接通信，广播报文因此被限制在单个 VLAN 内。

实际收益有三点：

1. **性能** —— 抑制广播泛洪（垃圾流量）；
2. **业务隔离** —— 按部门/用途划分网段；
3. **安全** —— 不同 VLAN 默认不可达。

即便设备挂在不同交换机下，只要属于同一个 VLAN，也能像在同一台交换机上一样二层互通 —— 这是「虚拟」二字的含义。

## 二、VLAN 标签

IEEE 802.1Q 规定：在以太网帧的**源 MAC 之后、类型字段之前**插入 4 字节 VLAN 标签（Tag），用以标识 VLAN 信息。

- **Untagged 帧**：原始的、没有标签的帧；
- **Tagged 帧**：插入 4 字节标签的帧。

### 标签结构

| 字段 | 长度 | 含义 |
|---|---|---|
| **TPID** | 2 字节 | 固定 `0x8100`，表示「这是带 802.1Q 标签的帧」 |
| **User Priority** | 3 bit | 优先级 0–7，0 为默认；7 给关键流量（RIP/OSPF 路由更新），6/5 给时延敏感业务（语音/交互视频），4–1 给受控负载 |
| **CFI** | 1 bit | 规范格式指示：0 规范格式，1 非规范；用于令牌环/源路由 FDDI 的地址比特序 |
| **VLAN ID (VID)** | 12 bit | 2¹² = 4096 个取值；VID 0 表示帧优先级，**4095 预留**，有效范围 **1–4094**，1 为默认 |

记住这条最容易踩的：**可用 VID 只有 4094 个**，不是 4096。规划大规模网络时上限就卡在这里。

## 三、链路类型与端口类型

### 链路类型

| 链路 | 连接对象 | 通过的帧 |
|---|---|---|
| Access 链路（接入链路） | 用户主机 ↔ 交换机 | 大部分 untagged（也有少量 tagged） |
| Trunk 链路（干道链路） | 交换机 ↔ 交换机 | 一般为 tagged |

### 三种端口

**① Access 端口** —— 连用户主机，只能属于一个 VLAN（PVID）：

- 收：收到 untagged 帧 → 强制打上本端口 PVID；收到 tagged 帧 → VID 与 PVID 相同才收，否则丢弃；
- 发：**先剥掉 Tag 再发**，出去永远不带标签。

**② Trunk 端口** —— 连交换机，允许多个 VLAN 的 tagged 帧通过：

- 收：untagged 帧 → 打上 PVID，PVID 在允许列表内才收；tagged 帧 → VID 在允许列表内才收，否则丢弃；
- 发：VID = PVID 且允许通过 → 剥 Tag 发出；VID ≠ PVID 且允许通过 → **保留 Tag** 发出。

**③ Hybrid 端口** —— 既能连交换机也能连主机，收发规则同 Trunk，但**发不发 Tag 可以按 VLAN 逐个配置**：

- `port hybrid tagged vlan <vid>` → 该 VLAN 的帧带 Tag 发（一般配在连交换机的口）；
- `port hybrid untagged vlan <vid>` → 该 VLAN 的帧剥 Tag 发（一般配在连主机的口）。

Hybrid 是 Trunk/Access 的超集：Access 等价于「PVID + 只允许该 VLAN 且 untagged」，Trunk 等价于「全部 tagged，仅 PVID 例外」。

## 四、VLAN 间为什么要三层

不同 VLAN 不能直接二层通信。要实现互通，需要**VLAN 端口**（VLANIF / SVI）：它不是物理接口，而是网络层上的虚拟接口，每个 VLAN 对应一个，其 IP 可作为该 VLAN 内设备的**网关**，由它完成基于 IP 的三层转发。

这就把 VLAN 与 [TCP/IP 五层模型](./TCP-IP五层模型.md) 接起来了：VLAN 是二层切分，跨 VLAN 通信必须上升到三层。

## 五、排障提示

- 同一 VLAN 内 ping 不通 → 先查**两端 PVID 是否一致**、Trunk 允许列表有没有放行该 VID；
- 跨交换机某些 VLAN 通、某些不通 → Trunk 的 `allow-pass vlan` 列表漏配；
- 主机收到带 Tag 的帧（抓包可见 `802.1Q`） → 上游端口配成了 tagged/hybrid tagged，而主机不认 Tag；
- VID 规划冲突（不同业务用同一个 VID）→ 二层直接串网，最典型的事故形态。

## 来源

- 原文：[关于 VLAN](../../learningNote/Computer_Network/关于VLAN.md)（含 Untagged/Tagged 帧格式图、三种端口收发示意图）
- 参考：IEEE 802.1Q / 802.1P
