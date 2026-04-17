---
title: 自动控制原理知识域摘要
description: 经典控制理论笔记，包含 S-Z 变换表、连续与离散系统分析
type: source
tags: [Control, Theory, Signal, S-Z-Transform]
lastUpdated: 2026-04-17
---

# 自动控制原理知识域

本目录对应 `docs/learningNote/Principles_of_Automatic_Control_Related/`。

## 主要内容

### S-Z 变换表
连续时间拉普拉斯变换（F(s)）与离散时间 Z 变换（F(z)）的对照表，包括：
- 单位冲激 δ(t)
- 单位阶跃 u(t)
- 斜坡函数 t
- 指数函数 e^{-at}
- 几何序列 a^k

### 常用变换公式
| 时域 f(t) | 拉普拉斯 F(s) | Z域 F(z) |
|----------|------------|---------|
| δ(t) | 1 | 1 |
| u(t) | 1/s | z/(z-1) |
| e^{-at} | 1/(s+a) | z/(z-e^{-aT}) |

## 应用场景

- 离散控制系统分析
- 数字控制器设计
- 机器人运动控制（与 ROS2 有交叉）

## 关联实体

- [[../entities/ROS2.md]] — ROS2 机器人控制
