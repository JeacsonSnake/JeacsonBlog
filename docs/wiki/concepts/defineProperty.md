---
title: "Object.defineProperty：属性描述符与 Vue2 的响应式劫持"
description: "用 getter/setter 改写对象属性读写：属性描述符（enumerable / writable / configurable）的含义与默认值都是 false 这个坑，以及 Vue2 为什么用它做响应式、又为什么被 Proxy 取代（新增/删除属性、数组索引赋值都绕不过已定义好的 get/set 钩子）"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [JavaScript, Object, Descriptor, Vue2, Reactivity]
sources:
  - docs/learningNote/JSNote/defineproperty方法.md
  - docs/learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Reactive_Data.md
related:
  - ../entities/JavaScript.md
  - ../entities/Vue.md
  - ../sources/JavaScript.md
  - ./数据响应式.md
---

# Object.defineProperty

## 核心结论

> `Object.defineProperty(obj, key, descriptor)` 把某个属性从"一个值"变成"一对钩子"：读它走 `get()`，写它走 `set()`。Vue2 的全部响应式都建立在这上面 —— 也因此继承了它的三个硬限制。

## 属性描述符

| 描述符 | 作用 | 默认值 |
|---|---|---|
| `value` / `writable` | 数据属性：直接给值、是否可改 | `undefined` / **`false`** |
| `get` / `set` | 访问器属性：读取与修改时调用的函数 | `undefined` |
| `enumerable` | 能否被 `for...in` / `Object.keys` 枚举 | **`false`** |
| `configurable` | 能否被删除、能否再次 `defineProperty` 改描述符 | **`false`** |

**默认值全是 false** 是第一个坑：不显式写 `enumerable: true`，属性虽然读得到，却不会出现在遍历/序列化里；不写 `configurable: true`，之后无法删除也无法重新定义。

`value` 与 `get/set` 互斥：一个属性要么是数据属性，要么是访问器属性。

## 最小样例

```javascript
let number = 18;
let person = { name: 'Jeasfds', sex: 'male' };

Object.defineProperty(person, 'age', {
  enumerable: true,    // 可枚举（默认 false）
  writable: true,      // 可修改（默认 false）
  configurable: true,  // 可删除（默认 false）

  get() {
    // 有人读取 person.age 时调用，返回值即读到的值
    return number;
  },
  set(value) {
    // 有人修改 person.age 时调用，收到新值
    number = value;
  }
});
```

这个例子里 `age` 并不真正存在自己的存储位：它只是 `number` 的一个门面，读写都被劫持了。响应式的原料就是这对钩子 —— 在 `get` 里登记"谁读了它"，在 `set` 里通知"它变了"。

## Vue2 为什么用它，又为什么被取代

Vue2 在 `data` 初始化时遍历每个属性，逐个 `defineProperty` 装上 get/set。于是天然出现三个限制：

| 限制 | 原因 |
|---|---|
| **对象内部的嵌套属性不可响应** | 钩子只在初始化时逐属性安装；对象内部成员没有被递归定义就只是个普通值 |
| **新增属性不响应** | `obj.newKey = x` 走的是普通赋值，没有钩子 → 读得到、改不动视图；必须 `Vue.set(obj, key, val)` 补装钩子 |
| **删除属性不响应** | `delete obj.key` 同理；必须 `Vue.delete` |

数组还有第四个坑：`arr[i] = x` 和 `arr.length = n` 都不触发 set，所以 Vue2 只能重写数组的七个变更方法（push/pop/shift/unshift/splice/sort/reverse）来补。

ES6 的 `Proxy` 代理的是**整个对象**而不是逐个属性，读写、新增、删除、`in`、`delete` 全部经过 handler，上述限制一次性消失 —— 这就是 Vue3 换引擎的原因，细节见 [数据响应式](./数据响应式.md)。

## 实务要点

- 只为一两个属性做拦截时，`defineProperty` 依然更轻；要拦截整个对象（未知键名）就必须 `Proxy`。
- 描述符默认 `false` 导致的两个高频症状：属性不进 `JSON.stringify`（不可枚举）、不可删除（排查数据残留时容易误判）。
- 已经是访问器属性（或 `configurable: false`）时再次 `defineProperty` 会 `TypeError`，写库代码时要用 `Object.getOwnPropertyDescriptor` 先探。

## 来源

- 原文：[Object.defineproperty 方法](../../learningNote/JSNote/defineproperty方法.md)
- 对比：[Vue3 与 Vue2 在数据响应式上的区别](../../learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Reactive_Data.md)
- MDN：[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
