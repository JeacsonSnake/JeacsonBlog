---
title: "Nintendo Switch 5GHz 搜不到：信道白名单与路由器手动选频排查"
description: "Switch 全系（含 OLED）5GHz 网卡只支持 UNII-1 段的 36/40/44/48 四个信道，路由器自动选频落到 UNII-3（149–165）或 DFS（52–64、100–144）时，SSID 在扫描列表中完全不可见（不是搜到连不上）；解法：关 Auto Channel Finder 后在本地 Web UI（Linksys CA 隐藏入口）把 5GHz 固定到信道 36，并顺带理解 Beacon 被动扫描与 RSSI 换算的取证方法"
created: 2026-11-05
updated: 2026-11-05
type: concept
tags: [Network, WiFi, Channel, Troubleshooting]
sources:
  - docs/postMortem/tiny_tips/2026_11_04.md
related:
  - docs/wiki/entities/Computer_Network.md
  - docs/wiki/sources/PostMortem.md
---

# Nintendo Switch 5GHz 搜不到 — 信道白名单排查

## 核心结论

> **Switch 全系（含 OLED）的 5GHz 无线网卡受区域固件白名单限制，只支持 UNII-1 段的 36 / 40 / 44 / 48 四个信道；UNII-3（149–165）与 DFS（52–64、100–144）一律不可见。** 路由器自动选频落到白名单外的信道时，SSID 在扫描列表中**根本不出现**，主机静默回退 2.4GHz。
>
> 一句话：**搜不到 5G 先查信道，"搜到但连不上"才是加密/协议问题。**

## 现象指纹（先分诊）

| 现象 | 指向 |
|---|---|
| 5GHz SSID **完全不在扫描列表**，2.4GHz 正常 | 信道白名单 / 频宽落点（本文场景） |
| 5GHz 可见但连接失败、反复重连 | 加密模式（WPA3-only）、ax-only、驱动兼容性 |
| 连接成功但间歇卡顿 | DFS 雷达避让、干扰、链路质量 → 见 DFS 概念页 |

「扫描阶段即不可见」是白名单问题最省时间的判据：SSID 广播本身因信道而被过滤，和应用层配置无关。

## Switch 5GHz 信道白名单

| 支持 | 频点 | UNII 段 |
|---|---|---|
| 36 | 5180 MHz | UNII-1 |
| 40 | 5200 MHz | UNII-1 |
| 44 | 5220 MHz | UNII-1 |
| 48 | 5240 MHz | UNII-1 |

不支持：UNII-3 **149–165**、DFS **52–64 / 100–144**。

### 本例根因

路由器（Linksys MBE7000 / Velop Pro 7 mesh，固件 1.0.13.216765）自动选频落在**信道 153**（5765 MHz，80MHz 频宽实际占用 149–161）→ 白名单外 → Switch 完全扫不到该 SSID。

### 已排除项

两频段实测配置完全相同，故加密/协议不是主因：

- 均为 **WPA2 / WPA3 混合模式**（非 WPA3-only）
- 均**未启用 ax-only**（2.4G/5G 兼容降级路径保留）
- 信标帧含传统速率元素与 VHT 元素，对老设备兼容

## 排查路径

| 步 | 操作 | 目标 |
|---|---|---|
| 1 | `netsh wlan show interfaces` + `netsh wlan show networks mode=bssid` | 看路由器实际信道与频宽（`Channel` / `Band` 字段） |
| 2 | 核验目标设备 5GHz 信道白名单 | 确认 Switch 仅 36/40/44/48 |
| 3 | 检查信标中的安全与协议配置 | 排除 WPA3-only / ax-only |
| 4 | 找路由器改信道入口 | App 无手动信道时走本地 Web UI |

> 每次改完都回第 1 步复查实际信道 —— 信道被自动改回是本类故障最常见的复发原因。

## 手动固定信道：Linksys 的 CA 隐藏入口

Linksys App **没有手动信道项**，只有 Channel Finder 自动选频。改信道要去本地 Web UI：

1. 浏览器打开 `https://192.168.1.1` 并登录
2. 点击页脚右侧、紧邻固件版本号的**小字 `CA`** 链接 → 进入完整配置树
3. `Configuration → Wi-Fi → Basic Wireless Settings`（App 中显示为 `Wi-Fi 设置 → 无线`）
4. 5GHz 信道固定为 **36**，信道宽度保留「自动」（实际仍协商 80MHz）

::: warning 前提：先关 Auto Channel Finder
MBE7000 出厂默认开启 **Auto Channel Finder**，约每 **5 天**重扫环境并选频，**会覆盖手动设置** → 数天后信道被拨回 153，Switch 再次搜不到 5G。

关闭路径（Linksys App）：`Wi-Fi 设置 → 5 GHz 频段区块 → 高级 Wi-Fi 设置 → 通道查找器 → 自动频道查找器` → 关闭。

把「是否已关闭自动选频」写进变更检查清单，否则「改了没用」的假象会反复出现。
:::

## 改前后实测

| 项目 | 修改前 | 修改后 |
|---|---|---|
| 5G 信道 | 153（5765 MHz） | 36（5180 MHz） |
| 5G 频宽 | 80 MHz，占用 149–161 | 80 MHz，中心 5210 MHz |
| 5G 信号强度 | 82% | 80% |
| 5G 协商速率（收/发） | 649 / 324 Mbps | 649 / 480 Mbps |
| Switch 能否搜到 5G | 否 | 是，可正常连接 |

副产物：同一 5GHz 的本机上行速率 324 → 480 Mbps，说明 80MHz 协商未受影响（UNII-1 段更干净）。同时把 2.4GHz 从「自动」固定为 **11**（1/6/11 三个互不重叠信道，选 11 避开邻居的 1、6）。

## 取证原理：Beacon 被动扫描与信道环境

### 为什么没连过的网络也有完整信息

Windows 扫描 WiFi 靠**被动接收 AP 广播的 Beacon 信标帧**：无需连接、无需密码即可获得全部基础信息；默认每 100 TU（≈102.4 ms，约每秒 10 次）广播一次。信标携带的 IE：

- **SSID IE** — 网络名称
- **BSSID** — AP 的 MAC（发送方地址）
- **DS Parameter Set IE** — 当前工作信道（`netsh` 输出的 `Channel` 即来自此）
- **RSN IE** — 加密类型（WPA2/WPA3、AKM 套件）
- **RSSI** — 接收信号强度（Windows 侧为 `wlanSignalQuality`）

### 信道占用统计的两个陷阱

1. **同 OUI + 同末字节的多条记录可能是一台设备**。本例信道 40 上的「主 SSID / Guest SSID / 隐藏 SSID」三条记录 OUI 均为 `68:d0:81`、末字节均为 `:28` → 同一台 HKBN 路由器的多个虚拟接口，统计干扰源时只能计 1，否则高估拥挤度。
2. **强信号也可能毫无用处**。信道 157 上信号 83% 的 AP 属 UNII-3，对 Switch 不可见 —— 干扰评估必须叠加「目标设备支持的信道」这一维度。

### RSSI 换算（Windows）

`netsh` 只暴露 0–100 的 `wlanSignalQuality`，不直接给 dBm，可近似：

```
RSSI(dBm) ≈ 信号百分比 ÷ 2 − 100        # 67% → −66.5 dBm
```

该换算为近似值（实际映射曲线由驱动决定），只适合横向比较 AP 强弱，不能用于精确链路预算。

## 踩坑记录

| # | 坑 | 现象 | 应对 |
|---|---|---|---|
| 1 | `netsh wlan show networks` 读的是驱动缓存 | 首轮只返回 1 条，误判环境干净 | 先触发 `WlanScan` 或点系统 WiFi 面板刷新，等数秒再读 |
| 2 | 一上来就排查加密/协议 | 在 WPA3、混合模式、ax-only 上反复试，浪费大量时间 | Switch 搜不到 5G 的典型原因是**信道超白名单**，优先核对信道 |
| 3 | 改了 CA 信道但没关 Auto Channel Finder | 数天后被改回 153，问题复发 | 先关 Channel Finder 再改信道 |
| 4 | CA 入口隐蔽（部分固件无此入口） | 常规 Web UI 找不到信道设置 | 入口在页面最底部右侧、紧邻固件版本号的小字 `CA`；是否保留因型号/固件而异 |

## 兜底方案（无法改信道时）

1. **有线连接（推荐）** — Switch OLED 底座自带 LAN 口，网线接主路由 LAN 口。
2. **2.4GHz 将就** — 联机对战实际带宽需求仅数 Mbps，延迟与稳定性通常够用；仅下载游戏/更新时明显变慢。

## 关联

- [同域前文：DFS 信道雷达避让导致传输间歇挂起（「搜得到但卡」而非「搜不到」）](../concepts/WiFi-5GHz-DFS-Radar-Avoidance-Image-Loading-Slow.md)
- [计算机网络知识域（802.11 / 链路层）](../entities/Computer_Network.md)
- [踩坑心得知识域摘要（本文归类处）](../sources/PostMortem.md)
