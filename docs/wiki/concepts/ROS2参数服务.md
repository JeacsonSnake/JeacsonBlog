---
title: "ROS2 参数服务：随节点走的键值配置"
description: "ROS2 的 Parameters 不存在中心化仓库，而是挂在节点内部、通过内置参数服务（本质是服务通信）读写的键值对；ros2 param 的 list/get/set/dump/load 六个命令与 --params-file 启动时加载的区别，以及只读参数（qos_overrides）为什么 set 会失败"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [ROS2, Parameter, Configuration, Service]
sources:
  - docs/learningNote/Ros2_Note/co_me/2024_11_27.md
  - docs/learningNote/Ros2_Note/co_me/2025_03_06.md
  - docs/learningNote/Ros2_Note/co_me/2025_03_07.md
related:
  - ../entities/ROS2.md
  - ../sources/ROS2.md
  - ./自定义消息接口.md
  - ./服务通信.md
---

# ROS2 参数服务（Parameters）

## 核心结论

> 参数是**挂在节点内部的键值对**，用于运行时动态配置，没有中心化仓库。读写参数走的是 ROS2 内置的**参数服务**（底层就是服务通信），因此是「单服务端（节点）对多客户端（CLI、其它节点、RQt）」的交互模型 —— 它本质是对**节点内部状态**的访问控制，而不是节点间的数据流通。

## 一、与话题/服务的区别

| | 话题 Topics | 服务 Services | 参数 Parameters |
|---|---|---|---|
| 数据流向 | 节点间持续数据流 | 节点间请求/应答 | **节点内部状态的读写** |
| 归属 | 无（发布/订阅） | 无 | **归属某个节点** |
| 命名 | 话题名 | 服务名 | `/namespace/node/param` |
| 变更 | 发布新消息 | 调用服务 | set 后立即生效，无需重启 |

参数常用于：算法系数（如 PID 的 P）、传感器阈值（如曝光时间）、运行模式开关（调试模式）。也可写脚本批量修改多个节点的参数（如统一设置所有雷达的扫描频率）；把参数存成 YAML，部署时一键恢复配置。

## 二、命令行访问（六个命令）

```bash
ros2 param list                            # 列出所有节点下的所有参数
ros2 param get  <node> <param>             # 取值（同时返回类型）
ros2 param set  <node> <param> <value>     # 运行时改值
ros2 param dump <node>                     # 导出该节点全部参数
ros2 param dump <node> > node_a.yaml       # 存成 YAML
ros2 param load <node> <file.yaml>         # 把 YAML 灌进运行中的节点
```

`list` 的输出结构（turtlesim 为例）：

```text
/teleop_turtle:
    qos_overrides./parameter_events.publisher.depth
    ...
    scale_angular
    scale_linear
    use_sim_time
/turtlesim:
    background_b
    background_g
    background_r
    ...
    use_sim_time
```

`use_sim_time` 是**所有节点都有**的参数。

`dump` 产出的就是一份可直接复用的 YAML：

```yaml
/node_a:
  ros__parameters:
    height: 168
    use_sim_time: false
```

## 三、只读参数：`load` 报错的原因

对运行中的节点 `load` 时，常见这样的回执：

```text
Set parameter background_b successful
Set parameter qos_overrides./parameter_events.publisher.depth failed:
  parameter '...' cannot be set because it is read-only
```

`qos_overrides.*` 这类参数**只能在节点启动时设定**，运行期不可改 —— 这就是为什么不报错的是普通参数，报错的是它们。

## 四、启动时加载：`--params-file`

```bash
ros2 run <package> <executable> --ros-args --params-file <file.yaml>
```

关键差别：**启动时加载会覆盖包括只读参数在内的所有参数**（此时节点还没跑起来，不存在"运行时不可改"的约束），而运行期 `load` 只能改可写参数。

## 五、自定义节点的实现骨架

案例需求：节点 A 作为参数**服务端**（自身可增删改查参数），节点 B 作为参数**客户端**（可查看、修改 A 的参数）。实现步骤固定五步：

1. 编写参数服务端（声明/读取/更新参数，处理参数变更回调）；
2. 编写参数客户端（通过参数服务接口读写对端参数）；
3. 编辑配置文件（`CMakeLists.txt` / `setup.py` 声明入口）；
4. `colcon build`；
5. 运行验证（配合 `ros2 param list/get/set` 对照）。

创建工作空间与包：

```bash
mkdir -p ws01_plumbing/src && cd ws01_plumbing/src && colcon build

ros2 pkg create cpp04_parameter --build-type ament_cmake --dependencies rclcpp --node-name demo01_parameter_server
ros2 pkg create py04_parameter  --build-type ament_python --dependencies rclpy  --node-name demo01_parameter_server_py
```

C++ 与 Python 的具体 API 见原文两个分支（`declare_parameter` / `get_parameter` / 参数回调与 `set_parameters` 服务端逻辑）。

## 六、实务提示

- 参数是**按节点**隔离的，同名参数在不同节点互不影响；命名空间决定完整路径；
- 参数变更可以挂回调（`on_parameter_event` / `add_on_set_parameters_callback`）做校验，避免非法值直接生效；
- YAML 是部署真相：把「能跑的参数组合」提交进仓库，比在 CLI 里手调可靠。

## 来源

- 原文：[ROS2 参数服务](../../learningNote/Ros2_Note/co_me/2024_11_27.md)
- 实现分支：[C++](../../learningNote/Ros2_Note/co_me/2025_03_06.md) · [Python](../../learningNote/Ros2_Note/co_me/2025_03_07.md)
- 相邻概念：[ROS2 自定义消息接口](./自定义消息接口.md)、[服务通信](./服务通信.md)
