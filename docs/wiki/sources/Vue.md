---
title: Vue 知识域摘要
description: Vue2 与 Vue3 框架学习笔记，涵盖数据响应式、组件系统、路由、状态管理
type: source
tags: [Vue, Web, Frontend, JavaScript]
lastUpdated: 2026-04-17
---

# Vue 知识域

本目录对应 `docs/learningNote/vueNote/`，包含 Vue2 和 Vue3 的学习笔记。

## Vue3 新特性

- **性能提升** — 打包体积减少 41%，初次渲染快 55%
- **Composition API** — 组合式 API，逻辑复用更强
- **数据响应式重写** — Proxy 替代 Object.defineProperty，支持嵌套对象和数组
- **新组件** — Fragment、Teleport、Suspense
- **更好的 TypeScript 支持**
- **Vite** — 新一代构建工具

## Vue2 vs Vue3 差异

- 响应式原理：Object.defineProperty → Proxy
- API 风格：Options API → Composition API
- 生命周期的部分变化
- 打包工具：webpack → Vite（可选）

## 核心概念

- **数据响应式** — 数据变化驱动视图更新，Vue2 有缺陷（对象属性的新增/删除、数组索引变化无法检测）
- **VUEX** — Vue2 官方状态管理库（类 Redux 模式）
- **VueRouter** — SPA 路由管理

## 相关笔记

```
vueNote/
├── VUE2/
│   ├── VUE基础.md
│   ├── VUEX.md
│   └── VUERouter.md
└── VUE3/
    ├── VUE3的数据响应式_上/中/下/补.md
    ├── VUE3_Vs_VUE2_In_Reactive_Data.md
    ├── VUE3_Vs_VUE2_In_Render_Function.md
    └── Vue3 中 watcheffect 函数的使用.md
```

## 关联实体

- [[../entities/Web.md]] — Web 开发
- [[../entities/JavaScript.md]] — JavaScript 语言基础
