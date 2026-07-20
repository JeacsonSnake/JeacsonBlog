---
title: Ubuntu 24.04 gdm3 启动失败 - 磁盘空间不足根因排查
description: "Ubuntu 24.04 重启后 gdm3 无法启动、停留在 tty1 的根因排查与彻底修复方案：磁盘空间耗尽导致 APT 缓存写入失败 + 系统降级为 multi-user.target；包含紧急清理 8 步 + VMware 虚拟硬盘扩容 7 步完整流程"
created: 2026-07-21
updated: 2026-07-21
type: concept
tags: [DevOps, Ubuntu, VMware, gdm3, Troubleshooting, Disk, Deploy]
sources:
  - docs/postMortem/deploy/006_Ubuntu_gdm3_cannot_activate.md
related:
  - docs/wiki/sources/PostMortem.md
---

# Ubuntu 24.04 gdm3 启动失败 — 磁盘空间不足根因排查

## 核心结论

> **Ubuntu 24.04 重启后卡在 tty1、gdm3 无法启动，根因通常是磁盘空间耗尽**（VMware 32GB 默认分配不足），而非 gdm3 本身的服务配置问题。盲目 `apt install --reinstall gdm3` 只会因 APT 缓存写不进而失败。

排查优先级：

1. **第一步**：`df -h /` 看根分区使用率
2. **第二步**：确认 `systemctl get-default` 是否被系统自动降级为 `multi-user.target`
3. **第三步**：临时清理释放空间，重装 gdm3 + 切回 `graphical.target`
4. **第四步（根本解决）**：在 VMware 中扩展虚拟硬盘 + `growpart` + `resize2fs`

## 现象

VMware Workstation Pro 上的 Ubuntu 24.04 虚拟机（已运行约 7 个月）某次重启后：

- 系统启动后停留在 `tty1` 命令行，提示登录
- 无图形登录界面
- `Ctrl + Alt + F2` 等图形切换无效
- 提示信息：`[FAILED] Failed to start gdm.service - GNOME Display Manager.`

## 排查路径（service-level 假象）

```bash
# 假象 1：gdm3 服务未运行
sudo systemctl status gdm3
# 显示 inactive (dead)，但无明显错误日志

# 假象 2：无法通过 systemctl enable 启用
sudo systemctl enable gdm3
# Warning: The unit files have no installation config (WantedBy= etc.)

# 假象 3：重装 gdm3 失败
sudo apt install --reinstall gdm3
# E: /var/cache/apt/archives/ 错误 → APT 缓存目录无法写入

# 关键线索：默认启动目标被自动降级
systemctl get-default
# multi-user.target  ← 不是 graphical.target
```

## 根因链路

**根本原因**：磁盘空间不足（根分区使用率 ≥95%，如 32GB 初始分配 7 个月累积）。

根因导致的 3 层故障叠加：

| 层级 | 现象 | 机制 |
|---|---|---|
| APT 层 | `apt install --reinstall gdm3` 失败 | `/var/cache/apt/archives/` 无法写入（磁盘满） |
| 服务层 | `gdm3` 启动失败 | 服务启动时无法创建临时文件 / 写日志 |
| 系统层 | 自动降级 `graphical.target` → `multi-user.target` | systemd 资源不足时主动避免图形界面崩溃 |

> 验证工具：Stacer GUI 可视化磁盘使用率，确认 `/` 分区 ≥95%。

## 紧急清理（8 步，恢复图形界面）

```bash
# 1. 删除无用依赖包
sudo apt autoremove

# 2. 清理已下载的旧包缓存
sudo apt autoclean

# 3. 压缩系统日志（释放约 100MB）
sudo journalctl --vacuum-size=100M

# 4. 清空损坏的 APT 缓存（必须先做这一步，否则步骤 6 仍会失败）
sudo rm -rf /var/cache/apt/archives/*

# 5. 更新软件源
sudo apt update

# 6. 重新安装 gdm3
sudo apt install --reinstall gdm3

# 7. 恢复默认启动目标为图形界面
sudo systemctl set-default graphical.target

# 8. 启动 gdm3（此时应该能看到登录界面）
sudo systemctl start gdm3
```

## 根本修复：VMware 虚拟硬盘扩容（7 步）

仅清理垃圾是治标，磁盘还会再次填满。需从 VMware 层扩展硬盘容量（本案例 32GB → 64GB）。

**前置条件**：系统未使用 LVM（传统分区，`sda2` 直接挂载为根目录 `/`）。如使用 LVM，步骤略不同（先 `lvextend` 再 `resize2fs`）。

```bash
# Step 1: 关闭虚拟机，在 VMware Workstation 中删除所有快照
# Step 2: 虚拟机设置 → 硬盘 → 扩展容量 32GB → 64GB
# Step 3: 启动虚拟机，进入 tty1 终端

# Step 4: 安装扩展工具
sudo apt install cloud-guest-utils

# Step 5: 扩展分区 sda2（根分区）到未分配空间
sudo growpart /dev/sda 2

# Step 6: 扩展文件系统（ext4）
sudo resize2fs /dev/sda2

# Step 7: 验证结果
df -h /
# 预期：根分区总容量约 63GB，可用空间约 31GB
```

## 排查清单（按顺序执行）

| # | 命令 / 操作 | 预期结果 |
|---|---|---|
| 1 | `df -h /` | 若 `/` 使用率 ≥90%，强烈怀疑本故障 |
| 2 | `systemctl get-default` | 若返回 `multi-user.target`，确认系统已降级 |
| 3 | `sudo systemctl status gdm3` | 若显示 `inactive (dead)` 且无错误日志，非 gdm3 本身问题 |
| 4 | `ls /var/cache/apt/archives/ -la` | 若写不进去或磁盘满，是 APT 缓存问题 |
| 5 | `sudo apt install --reinstall gdm3` | 若报 `E: /var/cache/apt/archives/` 错误，确认根因 |
| 6 | Stacer GUI / `ncdu /` | 可视化定位大文件（通常是 `/var/log/` `/var/cache/` `/tmp/`） |

## 经验总结

1. **磁盘空间是 Linux 服务异常的常见隐形根因**。`gdm3` / `NetworkManager` / `docker` 等服务启动失败时，第一时间 `df -h` 比看 service status 更有效。
2. **systemd 在资源不足时会主动降级**到 `multi-user.target`，这是保护机制，不是配置 bug。看到默认 target 变了，先怀疑资源问题。
3. **清理 vs 扩容**：清理是应急，扩容是根本。虚拟机分配磁盘时建议预留 2-3 倍实际使用量，避免 6-12 个月内再次触发。
4. **VMware 扩容前置**：必须先删快照，否则扩容操作会被快照阻挡或部分应用。
5. **非 LVM 分区的扩容顺序**：`VMware 容量扩展` → `growpart`（扩展分区表）→ `resize2fs`（扩展文件系统）。跳过任何一步都不生效。
