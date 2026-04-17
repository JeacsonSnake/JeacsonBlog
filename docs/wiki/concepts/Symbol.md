---
title: Symbol 类型
description: ES6 引入的第七种原始数据类型，表示独一无二的值
type: concept
tags: [JavaScript, ES6, Primitive-Type]
sources: [../../learningNote/JSNote/Symbol.md]
lastUpdated: 2026-04-17
---

# Symbol

`Symbol` 是 ES6 引入的新原始数据类型，表示独一无二的值，是 JavaScript 的第七种数据类型。

## 基本特性

1. **独一无二**：`Symbol('a') === Symbol('a')` 返回 `false`
2. **不能用 new 创建**：不是包装对象，直接 `Symbol()` 调用
3. **可带描述**：可选参数 `description` 用于调试输出
4. **不可枚举**：不会出现在 `for...in` 循环中

## 常见用途

- 作为对象的属性键（保证不冲突）
- 定义类的私有成员
- Symbol.for() 创建全局共享的 Symbol
- Symbol.iterator 定义迭代器

## 相关

- [[../entities/JavaScript.md]]
