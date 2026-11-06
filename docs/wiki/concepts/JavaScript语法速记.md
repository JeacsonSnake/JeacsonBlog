---
title: "JavaScript 语法速记：var/let、严格模式、IIFE、eval、Object vs Map"
description: "一组「记住就行」的 JS 易错点：var 函数作用域 vs let 块作用域的三条差异、严格模式的两种开启方式、立即执行函数、eval 的三个缺点、Object 与 Map 的键类型与有序性差异、七种原始类型、对象键自动字符串化、用位运算替代 2 的幂乘除"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [JavaScript, Syntax, var-let, Strict-Mode, Map]
sources:
  - docs/learningNote/JSNote/简单记忆.md
related:
  - ./函数形参与实参.md
  - ./defineProperty.md
  - ../entities/JavaScript.md
---

# JavaScript 语法速记

> 这页收录的是「知道就该记住」的零散规则，每条都能在面试或 code review 里直接判定对错。

## 一、var 与 let 的三条差异

| 维度 | var | let |
|---|---|---|
| 作用域 | **函数作用域**：for 里定义的 var，只要在同一个函数内，for 外也能访问 | **块作用域**：for 内定义的 let，出了花括号就访问不到 |
| 声明顺序 | 可先用后声明，未声明前值为 `undefined`（提升） | 必须先声明后使用（暂时性死区） |
| 重复声明 | 同作用域可重复 `var` 同名 | 同一作用域不可重复声明 |

## 二、严格模式

```javascript
'use strict'          // 整个文件/脚本

function foo() {
  'use strict'        // 只在该函数内
}
```

## 三、立即执行函数（IIFE）

```javascript
(function () {
  // 独立作用域，不污染全局
})();
```

## 四、eval 与它的三个缺点

`eval()` 会编译并执行传入的字符串：表达式则求值返回，语句则执行。可以理解为「运行时代码执行器」。

缺点：

1. **无法优化** —— 引擎无法预编译，性能差；
2. **安全问题** —— 执行任意字符串，等于把注入面交给调用方；
3. **降低压缩率** —— 压缩工具不能安全地重命名 eval 作用域内的变量。

实务结论：除了极端场景（如模板引擎、REPL），不要用。

## 五、Object 与 Map

| 维度 | Object | Map |
|---|---|---|
| 创建 | 字面量 `{}` 或 `new Object()` | 只能 `new Map()` |
| 键类型 | 只能是 `string` 或 `Symbol` | 任意类型（对象、数组、函数…） |
| 顺序 | 键值对无序 | **按插入顺序**迭代 |
| 规模/性能 | 大量增删时不如 Map | 频繁增删更合适 |

## 六、类型与键的两个高频细节

**七种原始类型**：`undefined`、`null`、`boolean`、`string`、`number`、`object`，加上 ES6 的 `symbol`。
（严格说 `object` 不是原始类型，原文按「六种 + Symbol」的口径列举；`bigint` 是 ES2020 新增的第八种。）

**原始值不能用 `new` 包装**：`new String('x')` 得到的是对象而非原始值，会让 `typeof` 变成 `object`，是经典陷阱。

**对象的键默认是字符串**：所以想用变量当键必须加中括号 —— 详见 [函数形参与实参](./函数形参与实参.md)。

## 七、用位运算替代 2 的幂乘除

```javascript
let num1 = 7;

num1 * 2;              // 14
num1 << 1;             // 14（左移一位 = ×2）

Math.floor(num1 / 2);  // 3
num1 >> 1;             // 3（右移一位 = ÷2 向下取整）
```

注意边界：位运算先把操作数转成 **32 位有符号整数**，超过 2³¹−1 或含小数的值会被截断，别在通用数值代码里滥用。

## 来源

- 原文：[简单记忆](../../learningNote/JSNote/简单记忆.md)
- 相关：[Object.defineProperty](./defineProperty.md)
