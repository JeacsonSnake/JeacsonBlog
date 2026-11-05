---
title: The PPP and PPPoE protocols
category:
  - Computer
  - Network
  - basic
---

## The PPP and PPPoE protocols

### 1. PPP (point to point) protocol

**Definition:** [Point-to-Point Protocol](https://baike.baidu.com/item/%E7%82%B9%E5%AF%B9%E7%82%B9%E5%8D%8F%E8%AE%AE/2991091?fromModule=lemma_inlink) (PPP) provides a standard method for transporting multi-protocol datagrams over point-to-point links. As a layer-2 (data link layer) protocol, it is often used when dialling up so that the client can obtain an IP address from the server. PPP supports the transport of upper-layer protocol packets over point-to-point serial lines of every physical type.

### 2. PPPoE (PPP over Ethernet) protocol

**Definition:** The PPP protocol requires the two communicating parties to be in a point-to-point relationship, which does not suit broadcast Ethernet or other types of multi-access network — hence the PPPoE protocol.

The PPPoE protocol (Point-to-Point Protocol over Ethernet) is a network tunnelling protocol that encapsulates the [Point-to-Point Protocol](https://baike.baidu.com/item/%E7%82%B9%E5%AF%B9%E7%82%B9%E5%8D%8F%E8%AE%AE/2991091?fromModule=lemma_inlink) (PPP) inside Ethernet frames. It not only gives users who connect over bridged Ethernet a means of <u>broadband access</u>, it also provides fairly convenient access control and billing. Every access user establishes a unique PPP session.

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../learningNote/Computer_Network/关于ppp协议与pppoe协议.md). The translation is for reference only.
Translation time: 2026-11-05
:::
