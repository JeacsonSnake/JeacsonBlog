---
title: ppp协议与pppoe协议
category:
  - Computer
  - Network
  - basic
---

## 关于ppp协议与pppoe协议

### 1、ppp（point to point）协议

**定义：**[点对点协议](https://baike.baidu.com/item/%E7%82%B9%E5%AF%B9%E7%82%B9%E5%8D%8F%E8%AE%AE/2991091?fromModule=lemma_inlink)（Point to Point Protocol，PPP）为在点对点连接上传输多协议数据包提供了一个标准方法。作为二层（数据链路层）协议，常用于拨号上网时客户端向服务器获取IP地址。PPP支持在各种物理类型的点对点串行线路上传输上层协议报文。

### 2、pppoe（ppp over Ethernet）协议

**定义：** PPP协议要求进行通信的双方是点到点的关系，不适于广播类型的以太网和另外一些多点访问类型的网络，于是产生了PPPoE协议。

PPPoE协议(Point-to-Point Protocol over Ethernet)是将[点对点协议](https://baike.baidu.com/item/%E7%82%B9%E5%AF%B9%E7%82%B9%E5%8D%8F%E8%AE%AE/2991091?fromModule=lemma_inlink)（PPP）封装在以太网框架中的一种网络隧道协议。它不仅为使用桥接以太网接入的用户提供了一种<u>宽带接入</u>手段，同时提供了较为便捷的接入控制和计费。每个接入用户均建立一个独一无二的PPP的会话。
