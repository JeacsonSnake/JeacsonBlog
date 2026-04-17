---
title: ROS2 知识域摘要
description: ROS2 机器人操作系统学习笔记，涵盖通信机制、坐标变换、工具使用
type: source
tags: [ROS2, Robot, Ubuntu, DDS]
lastUpdated: 2026-04-17
---

# ROS2 知识域

本目录对应 `docs/learningNote/Ros2_Note/`，以 ROS2 Jazzy + Ubuntu 24.04 为环境，记录机器人操作系统学习笔记。

## 硬件环境

- Raspberry Pi 5B (4GB)
- ROS2 Jazzy Jalisco LTS
- Ubuntu 24.04.3 LTS

## 涵盖内容

### 通信机制（核心）
- **话题通信 (Topics)** — 发布/订阅模式，单向数据流，支持多对多关系，用于持续更新的数据
- **服务通信 (Services)** — 请求/应答模式，一对一同步通信
- **动作通信 (Actions)** — 长期任务，支持中途取消和反馈
- **参数服务 (Parameters)** — 节点配置参数的管理与读写

### 进阶主题
- **分布式通信** — 通过 DDS 域ID机制实现跨设备通信，同一域内节点可互相发现
- **坐标变换** — tf2 系统，TransformStamped/PointStamped 消息，广播方与监听方

### 自定义接口
- 自定义话题消息接口
- 自定义服务接口
- 自定义动作接口

### 工具
- **rqt** — 图形化调试工具
- **rosbag2** — 录制与回放数据
- **ros2 topic / service / node** 等 CLI 工具

## 相关笔记结构

```
Ros2_Note/
├── co_me/         # 通信机制核心内容（话题/服务/动作/参数）
├── co_me_2/       # 通信机制补充（分布式通信、工具等）
├── coor_trans/    # 坐标变换专项
└── launch_rosbag2/ # rosbag2 与 launch 使用
```

## 关联实体

- [[../entities/ROS2.md]] — ROS2 机器人操作系统
- [[../concepts/话题通信.md]] — 话题通信详解
- [[../concepts/坐标变换.md]] — 坐标变换原理与实现
- [[../concepts/分布式通信.md]] — DDS 与 ROS_DOMAIN_ID

## 参考资料

- [ROS 2 Jazzy 官方文档](https://docs.ros.org/en/jazzy/)
- 清华大学出版社《ROS机器人理论与实践》（赵虚左）
- Bilibili 猛狮集训营 ROS2 课程
