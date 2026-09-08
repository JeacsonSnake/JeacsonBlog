---
title: Vue
description: 渐进式 JavaScript 框架，用于构建 Web 用户界面，Vue2 与 Vue3 并存
type: entity
tags: [Vue, Web, Frontend, JavaScript]
lastUpdated: 2026-09-08
---

# Vue

Vue.js 是一款渐进式 JavaScript 框架，用于构建单页应用（SPA）和 Web 界面。博客同时记录了 Vue2 和 Vue3 的学习内容。

## Vue2 vs Vue3

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 响应式原理 | Object.defineProperty | Proxy |
| API 风格 | Options API | Composition API |
| 打包大小 | 基准 | 减少 41% |
| 初始渲染速度 | 基准 | 快 55% |
| 多根节点 | 不支持 | 支持 (Fragment) |
| 状态管理 | Vuex | Pinia（推荐）|

## 核心概念

- **数据响应式** — 数据驱动视图 [[../concepts/数据响应式.md]]
- **组件系统** — 模块化 UI
- **路由** — [[../entities/Web.md]] 中的 SPA 路由

## 与其他实体的关系

- **[[../entities/JavaScript.md]]** — Vue 基于 JavaScript
- **[[../entities/TypeScript.md]]** — Vue3 全面支持 TypeScript
- **[[../entities/Web.md]]** — Vue 是 Web 开发的框架

## 构建与踩坑

- **Vite 生产构建错误去重 `fit-content`**（2026-09）— 博饼网站欢迎页按钮 Edge 下失效：cssnano 把 `fit-content` 与 `-moz-fit-content` 视为重复声明、只保留后写前缀版。详见 [[../concepts/Vue-CSS-Fit-Content-Vite-cssnano-Dedupe-Bug.md]]

## Source

[[../sources/Vue.md]]
