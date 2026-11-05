---
title: The five-layer TCP/IP model
category:
  - Computer
  - Network
  - basic
---

## The five-layer TCP/IP model (3.2)

**Here are a few related sites on the subject:**

[Detailed explanation of the TCP/IP network model_tcpip model_·Fixes on the Fly·'s blog - CSDN blog](https://blog.csdn.net/wuyuhang0803/article/details/126305206)

[Computer networks (1. The basics) — TCP/IP network model_draw the tcp/ip network model_Six of June's blog - CSDN blog](https://blog.csdn.net/dearand/article/details/126135088)

But I'll do a summary here as well.

**The TCP/IP network protocol model (five layers) architecture** is shown in the reference figure below:

### 1. Layer one — the physical layer

When data is about to be sent from a device onto the network, **the packet has to be turned into an electrical signal so that it can travel through the physical medium**. This layer is the **physical layer**, and it mainly provides the data link layer with a binary transmission service.

### 2. Layer two — the data link layer

As soon as data needs to travel across networks, you have to know which device the physical address carried in that data belongs to. So a network protocol model needs **a dedicated layer** that identifies the devices in all sorts of networks, letting data travel within a single link. This layer is the **data link layer**, and it mainly provides the network layer with a link-level transmission service.

**Note:** the physical address used here was originally called the **link layer address**, but because layer two mainly deals with the media access control problem, the physical address carried in the data is also commonly called the **MAC (Media Access Control) address**, and so layer two is sometimes called the **MAC layer** too.

> **TIPS:** In layer two there is a protocol called **`ARP`**, which solves the problem of **asking for a device's MAC address given its IP**. Every device's **NIC** holds a MAC address, and a **switch (a layer-two device)** can carry the IP address of the next destination and, using **ARP**, send an ARP request to the destination (device) that the IP corresponds to; from that device's ARP reply it gets the MAC address belonging to that destination, so the switch then knows which device that IP address belongs to.
>
> Of course a switch can record MAC addresses to cut down on the computation, and the result it obtains after learning and recording is what we call a **forwarding table**. Naturally, every machine's IP address can change, and so can the port it sits on, so a forwarding table has a time limit — past a certain age it expires.

### 3. Layer three — the network layer

When data is transmitted, the addressing job is performed by the **network layer**. The network layer is responsible for moving data from one device to another. **The network layer is also called the IP layer**, because the protocol it uses most is **IP (Internet Protocol)**. IP takes the message handed down by the transport layer as the **data portion**, adds an **IP header** to form an IP packet, and if the IP packet is larger than an **MTU (Maximum Transmission Unit — on Ethernet the MTU is generally 1500 bytes)** it is **fragmented** again. The result is an IP packet ready to be sent onto the network.

When a packet leaves the source device to reach an IP address, the source first decides whether that IP is in the same network segment as the packet:

- **If it is the same segment**, the source device puts the source and destination addresses straight into the IP header, obtains the MAC address via ARP, then puts both the source MAC and the destination MAC into the **data frame**'s MAC header and forwards it.

- **If it is not the same segment**, the source device sends the packet to the default gateway. The gateway's IP address is necessarily in the same segment as the source IP, and the gateway here is usually a **router (a layer-three device)**. Like a switch, a router holds a routing table. That means the router can use the destination IP inside the packet to find, in its routing table, the route IP that this packet should jump to next, and then steer the packet to that route IP. In other words, when a packet reaches a network node, that node uses an algorithm to decide which path the packet takes next. A network node can be a gateway, a router, a switch and so on. And when the packet reaches its last hop, the destination device's router finds that the destination IP in the packet belongs to its own segment, so it performs the operation described in the previous point: gets the destination IP's MAC address via ARP, rewrites the destination MAC address in the message, and sends it on. The final destination device then receives the packet.

The process described above is generally called **`layer-three forwarding`**.

> ​ So: **the addressing role of IP is to tell us which direction to head in for the next destination, while routing is choosing a router according to [the next destination]. Addressing is more like navigating, routing is more like working the steering wheel.**

### 4. Layer four — the transport layer

As the fourth layer, the **transport layer** provides network support for the application layer, and it is mainly responsible for providing the service of communication between processes in two hosts. In the transport layer there are two transport protocols, **TCP** and **UDP**. For explanations about TCP and UDP, security and the like, see [Detailed explanation of the TCP/UDP network protocols_·Fixes on the Fly·'s blog - CSDN blog](https://wuyuhang.blog.csdn.net/article/details/126233895?spm=1001.2014.3001.5502); I won't go into it much here.

1. **TCP** stands for **Transmission Control Protocol**, a connection-oriented, reliable, byte-stream-based transport layer communication protocol.

2. **UDP** stands for **User Datagram Protocol**, a connectionless transport layer protocol that provides a simple, unreliable, transaction-oriented message transfer service^[ [Java network programming: (7) UDP network programming - Seeking Knowledge_Tony - cnblogs](https://www.cnblogs.com/niujifei/p/14878945.html) ].

### 5. Layer five — the application layer

The application software we can touch directly sits in the **application layer**. In other words, the apps we use on our computers and phones are all implemented on top of the application layer. So when the applications on two different devices need to communicate, the application hands data down to the fourth layer, the transport layer. The application layer therefore only cares about the application functionality offered to the user, not about how the data gets moved. Still, to help move data around, the application layer provides plenty of transfer protocols, such as HTTP, HTTPS, DNS, FTP and so on.

For HTTP, see [Detailed explanation of the HTTP protocol_·Fixes on the Fly·'s blog - CSDN blog](https://wuyuhang.blog.csdn.net/article/details/126155792?spm=1001.2014.3001.5502). No need to say more about the rest.

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../learningNote/Computer_Network/关于TCP_IP的五层模型.md). The translation is for reference only.
Translation time: 2026-11-05
:::
