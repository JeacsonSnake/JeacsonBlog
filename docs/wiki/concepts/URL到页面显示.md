---
title: 从输入 URL 到页面显示的完整流程
description: DNS → TCP → HTTP → 渲染的完整网络流程
type: concept
tags: [Network, HTTP, DNS, TCP, Browser]
sources: [../../learningNote/Computer_Network/输入URL回车后发生了什么.md]
lastUpdated: 2026-04-17
---

# 从输入 URL 到页面显示

这是计算机网络最经典的综合问题之一，考察对各层协议的理解。

## 完整流程

1. **DNS 解析**
   - 浏览器缓存 → 系统缓存 → DNS 服务器查询
   - 域名 → IP 地址

2. **TCP 三次握手**
   - SYN → SYN-ACK → ACK
   - 建立可靠连接

3. **HTTP 请求/响应**
   - 浏览器发送 GET 请求
   - 服务器返回 HTML

4. **浏览器渲染**
   - HTML 解析 → DOM 树构建
   - CSS 解析 → CSSOM
   - JS 执行 → DOM 更新
   - 渲染树 → 布局 → 绘制

## 相关

- [[../entities/Computer_Network.md]]
- [[../entities/Web.md]]
