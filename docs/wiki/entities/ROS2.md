---
title: ROS2
description: Robot Operating System 2，机器人操作系统，支持分布式通信
type: entity
tags: [ROS2, Robot, DDS, Ubuntu]
lastUpdated: 2026-04-17
---

# ROS2

ROS2 (Robot Operating System 2) 是一个用于机器人软件开发的开源中间件框架，基于 DDS（Data Distribution Service）实现分布式通信。

## 基本信息

- **当前 LTS 版本**：Jazzy Jalisco
- **依赖系统**：Ubuntu 24.04 (ROS2 Jazzy)
- **硬件**：Raspberry Pi 5B (4GB) 作为主要测试平台

## 四大通信机制

| 通信模式 | 特点 | 适用场景 |
|---------|------|---------|
| [[../concepts/话题通信.md]] | 发布/订阅，单向，多对多 | 持续数据流（传感器等）|
| [[../concepts/服务通信.md]] | 请求/应答，一对一，同步 | 快速查询/控制 |
| [[../concepts/动作通信.md]] | 请求/应答+反馈，可取消 | 长期任务（导航等）|
| 参数服务 | 键值对，运行时可改 | 节点配置 |

## 重要工具

- `ros2 topic` — 话题调试
- `ros2 run` — 节点运行
- `rqt` — 图形化界面
- `rviz2` — 可视化
- `rosbag2` — 数据录制回放
- tf2 工具 — 坐标变换

## 与其他实体的关系

- **[[../concepts/分布式通信.md]]** — 基于 DDS 域ID实现跨设备通信
- **[[../concepts/坐标变换.md]]** — 机器人运动学基础
- **[[../concepts/自定义消息接口.md]]** — 接口定制

## Source

[[../sources/ROS2.md]]
