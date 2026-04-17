---
title: JavaScript 知识域摘要
description: JavaScript 语言核心概念与 Web 开发相关笔记
type: source
tags: [JavaScript, Web]
lastUpdated: 2026-04-17
---

# JavaScript 知识域

本目录对应 `docs/learningNote/JSNote/`，收录 JavaScript/ES6+ 语言核心知识点笔记。

## 涵盖主题

### 数据类型与 API
- **Symbol** — ES6 引入的第七种原始数据类型，表示独一无二的值，不可使用 new 关键字创建
- **Array.reduce()** — 数组内置方法，用于将数组元素按顺序累加为单个值，支持 InitialValue

### 函数与高级概念
- **函数柯里化 (Currying)** — 将接受多个参数的函数改造为单参数链式调用的过程，用于减少打包体积和面试
- **函数形参与实参** — 形式参数与实际参数的关系，以及 arguments 对象的使用
- **defineProperty** — Vue2 响应式原理底层 API，用于给对象定义属性及其 getter/setter

### 核心方法
- **reduce()** — 数组压缩方法，接收回调函数和初始值，从左到右遍历，返回单一结果

## 相关笔记

| 笔记文件 | 主题 |
|---------|------|
| `Symbol.md` | Symbol 数据类型 |
| `Reduce方法.md` | Array.reduce() |
| `柯里化.md` | 函数柯里化 |
| `defineproperty方法.md` | defineProperty |
| `简单记忆.md` | 记忆化相关 |
| `Formal&Real_Para_When_Func_Get_Obj.md` | 函数形参与实参 |

## 关联实体

- [[../entities/JavaScript.md]] — JavaScript 语言实体页
- [[../entities/Web.md]] — Web 开发实体页

## 补充说明

笔记内容偏实践，以具体 API 和语言特性为主，缺少系统性语法讲解。
