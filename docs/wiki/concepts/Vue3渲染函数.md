---
title: "Vue3 与 Vue2 的渲染函数：h() 是怎么变扁平的"
description: "从模板到真实 DOM 的四步（模板 → VNode → VirtualDOM → 真实 DOM），以及为什么可以直接写 render() 跳过模板编译；Vue2 的 h(type, {attrs, on}, children) 与 Vue3 的 h(type, {id, onClick}, children) 对比——属性对象被拍平、事件用 on 前缀、h 改为按需引入"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [Vue3, Render-Function, VNode, VirtualDOM]
sources:
  - docs/learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Render_Function.md
related:
  - ../entities/Vue.md
  - ../sources/Vue.md
  - ./数据响应式.md
---

# Vue3 与 Vue2 的渲染函数

## 核心结论

> 模板不是「HTML」，它最终要被编译成生成 VNode 的代码。既然终点是 VNode，就可以**跳过模板编译直接写 `render()` + `h()`**。Vue3 对 `h()` 的改动只有一个方向：**把嵌套的属性对象拍平**，顺带让 `h` 可以按需引入。

## 一、从模板到真实 DOM

```text
template 里的标签
  → 编译为若干 VNode（VirtualDomNode）
  → 组合成 VirtualDOM
  → 渲染为真实 DOM
```

绝大多数情况如此。若直接写「生成 vnode 的代码」，就省掉了「模板 → VNode」这一步编译，浏览器端效率更高。

方式是：在 `script` 里写 `render()`，内部调用 `h()`。`h()` 内部封装 `createElement`（Vue3 中为 `createVnode`），主要作用是对传入参数做条件判断，所以也可以把它直接理解为 `createElement` / `createVnode`。

## 二、Vue2 的 h()

三个形参：元素类型（`type`）、元素参数对象（可省略）、子元素（可为数组）。

```javascript
render(h) {
  return h('div', {
    attrs: { id: 'test' },           // 属性要包一层 attrs
    on:    { click: this.onClick }    // 事件要包一层 on
  }, 'HelloWorld');
}
```

问题在于参数对象**冗长且分层**：属性分 `attrs` / `domProps`，事件分 `on` / `nativeOn`，每加一种能力就多一层命名空间。

## 三、Vue3 的 h()

同样三个形参，但属性对象被拍平：

```javascript
import { h } from 'Vue';   // h 可全局/按需引入，render 也可拆成多个子函数

render() {
  return h('div', {
    id: 'test',
    onClick: this.onClick    // 以 on 开头的键直接被当作事件监听
  }, 'HelloWorld');
}
```

| 变化 | Vue2 | Vue3 |
|---|---|---|
| 属性 | `attrs: { id }` | 直接 `id` |
| 事件 | `on: { click }` | `onClick`（`on` 前缀即监听） |
| `h` 的来源 | 由 `render` 注入 | `import { h } from 'vue'`，可拆子函数复用 |
| 底层创建 | `createElement` | `createVnode` |
| 子节点 | 数组 | 数组，官方推荐用回调函数返回 |

扁平化的实际收益：写起来短，且**运行时不必维护两套属性分类逻辑** —— 少一层结构就少一处判断。

## 四、什么时候才需要手写渲染函数

- 组件库/底层封装：结构由数据驱动、模板表达不了（如按 schema 渲染表单）；
- 需要精细控制 vnode 结构与 diff 行为；
- 使用 JSX 时（JSX 最终也编译为 `h` 调用）。

日常业务仍应优先模板：Vue3 的静态提升、PatchFlag 等编译期优化都建立在模板分析上，手写 `render` 反而放弃这些优化。

## 来源

- 原文：[Vue3 与 Vue2 在渲染函数上的区别](../../learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Render_Function.md)
- 相邻概念：[Vue3 数据响应式](./数据响应式.md)
