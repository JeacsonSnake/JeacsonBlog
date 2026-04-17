---
title: Array.reduce() 方法
description: JavaScript 数组方法，将数组元素按顺序累加为单个值
type: concept
tags: [JavaScript, Array, API]
sources: [../../learningNote/JSNote/Reduce方法.md]
lastUpdated: 2026-04-17
---

# Array.reduce()

`reduce()` 是 JavaScript 内置的数组方法，用于将数组中的所有元素按顺序"压缩"为一个值。

## 基本语法

```javascript
const result = arr.reduce((prev, cur, index, arr) => {
    // 返回值会作为下一次调用的 prev
}, initialValue)
```

## 核心要点

- **prev**（累积值）：上一次回调的返回值，初始时为 `initialValue`
- **cur**（当前值）：当前处理的数组元素
- **index**（可选）：当前元素的索引
- **arr**（可选）：调用 reduce 的数组本身
- **initialValue**（可选）：初始累积值，可以是任意类型

## 应用场景

- 数组求和/求积
- 数组去重
- 数组扁平化
- 统计计数（对象累加）
- 分组

## 注意事项

- 对空数组调用 reduce 且无初始值会报错
- 提供初始值 `[]` 或 `{}` 时，prev 初始为该初始值，cur 从第一个元素开始

## 相关

- [[../entities/JavaScript.md]]
- [[../sources/JavaScript.md]]
