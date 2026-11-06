---
title: "SMTP：为什么发信是「推」而收信必须是「拉」"
description: "SMTP 传递一封邮件的六个步骤、为什么发件人用户代理不能直连收件人服务器（需要中继以便重试）、以及 SMTP 只能推不能拉——所以收信必须换用 POP3 / IMAP / HTTP 这类邮件访问协议"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [Network, SMTP, Email, Application-Layer]
sources:
  - docs/learningNote/Computer_Network/什么是SMTP.md
related:
  - ./TCP-IP五层模型.md
  - ../entities/Computer_Network.md
---

# SMTP（简单邮件传输协议）

## 核心结论

> SMTP 是**推送**协议：它把邮件从一台主机推到另一台主机。正因为它只会推，收件人**不能用 SMTP 取信** —— 取信是拉取动作，必须用 POP3 / IMAP / HTTP 这类**邮件访问协议**。一封邮件从 Alice 到 Bob，实际是「推两段 + 拉一段」。

## 一、一封邮件的六个步骤

假设 Alice 给 Bob 发一封纯 ASCII 邮件：

1. Alice 调用**用户代理**（邮件客户端）写信，填 Bob 的地址后点发送；
2. 用户代理把邮件送到 **Alice 的邮件服务器**，进入其发送队列；
3. 运行在 Alice 邮件服务器上的 **SMTP 客户端**发现队列里有新邮件，按收件地址尝试与 **Bob 的邮件服务器上的 SMTP 服务器**建立 TCP 连接；
4. 经过 SMTP 握手后，SMTP 客户端通过该 TCP 连接把邮件推给 Bob 的服务器；
5. Bob 的服务器收到后，把邮件放入 **Bob 的邮箱**；
6. Bob 打开用户代理，随时阅读。

## 二、为什么不直连收件人的电脑

早期做法是 Bob 登录邮件服务器主机、在主机上跑阅读器；90 年代后变成客户端-服务器访问，用户代理跑在本地设备上。

自然会想：那干脆在 Bob 的 PC 上也装个邮件服务器，让 Alice 的服务器直接对话？问题在于 —— 邮件服务器同时充当 SMTP 客户端与服务器，如果它就在 Bob 的个人电脑上，**这台电脑必须 24 小时开机并联网**才能接收随时到达的邮件。对绝大多数用户不现实。

因此实际形态是：用户代理在本机，**邮箱放在「永远在线的共享邮件服务器」上**（由 ISP、学校或公司维护）。

## 三、为什么发信要经过「自己的」邮件服务器中继

Alice 的用户代理通常**不直接**连 Bob 的邮件服务器，而是：

```
Alice 用户代理 --SMTP--> Alice 邮件服务器 --SMTP--> Bob 邮件服务器
```

理由是**重试**：如果用户代理直连失败（Bob 服务器暂时宕机），它没有能力长期重试；而邮件进入 Alice 服务器队列后，服务器可以作为客户端**反复尝试**（例如每 30 分钟一次），直到对方可接收为止。这是「存储转发」带来的可靠性。

## 四、收信为什么不能用 SMTP

邮件到达 Bob 的服务器后还差最后一跳：从服务器到 Bob 本机的用户代理。这一跳**不能**用 SMTP：

> 取信是「拉取（PULL）」操作，而 SMTP 是「推送（PUSH）」协议 —— SMTP 无法知道对应邮箱是否有新邮件，它只会把新邮件推到对方服务器。

所以必须引入邮件访问协议：**POP3**（Post Office Protocol v3）、**IMAP**（Internet Message Access Protocol）、**HTTP**（网页邮箱）。

完整路径因此是：

```
[推] Alice UA → Alice 服务器 → Bob 服务器
[拉] Bob 服务器 → Bob UA（POP3 / IMAP / HTTP）
```

## 五、实务对照

| 场景 | 协议 | 方向 |
|---|---|---|
| 客户端发信（提交） | SMTP（常配 587/465） | 推 |
| 服务器间转发 | SMTP（25） | 推 |
| 客户端收信 | POP3（110/995）、IMAP（143/993） | 拉 |
| 网页邮箱 | HTTP(S) | 双向 |

常见的运维误判：把「发不出去」和「收不到」混为一谈。发不出去查 SMTP（认证、端口、PTR/SPF/DKIM/反垃圾策略）；收不到查投递链路（队列、MX 记录、对方拒收）与访问协议配置。

## 来源

- 原文：[什么是 SMTP](../../learningNote/Computer_Network/什么是SMTP.md)（含两阶段与完整路径示意图）
- 教材：*Computer Networking: A Top-Down Approach*（Kurose & Ross, 7th Ed., 2017）第 2.3 节
