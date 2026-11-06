---
title: "Vue Router：从基本路由到守卫与两种工作模式"
description: "Vue Router 的完整骨架：router-link/router-view 的基本路由、children 嵌套、query 与 param 两种传参、命名路由、props 三种写法、replace、编程式导航、keep-alive 缓存与 activated/deactivated、全局/独享/组件内三层守卫，以及 hash 与 history 两种模式"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [Vue, Vue-Router, SPA, Navigation-Guard]
sources:
  - docs/learningNote/vueNote/VUE2/VUERouter.md
related:
  - ../entities/Vue.md
  - ../sources/Vue.md
  - ./Vuex.md
---

# Vue Router

## 核心结论

> 前端路由的本质是：**用 URL 决定渲染哪个组件，而不重新请求页面**。Vue Router 提供三件事 —— 声明式出入口（`router-link` / `router-view`）、可嵌套的路由表、以及一组能在「跳转发生前」介入的守卫。

## 一、概念

- **路由（route）**：一组「路径 ↔ 组件」的映射；
- **路由器（router）**：管理映射、监听 URL 变化并切换组件的对象；
- **为什么需要**：SPA 只有一个 HTML，切换视图不能靠服务端返回新页面，只能由前端按 URL 决定渲染什么。

一条必须记住的差异：

| | 说明 |
|---|---|
| `$route` | **每个组件都有**，存当前组件自身的路由信息（path、query、params…） |
| `$router` | **整个应用只有一个**，是路由器实例，提供 `push`/`replace`/`go` 等方法 |

## 二、基本路由

```javascript
// src/router/index.js
import VueRouter from 'vue-router';
import About from '../pages/About';
import Home from '../pages/Home';

export default new VueRouter({
  routes: [
    { path: '/about', component: About },
    { path: '/home',  component: Home  }
  ]
});
```

```vue
<!-- App.vue -->
<div class="navbar">
  <router-link class="about" active-class="active" to="/about">About</router-link>
  <router-link class="home"  active-class="active" to="/home">Home</router-link>
</div>
<div class="display">
  <router-view></router-view>   <!-- 组件呈现位置 -->
</div>
```

要点：

- 路由组件通常放在与 `components` **同级**的 `pages` 目录；
- 路由组件切换后**默认被销毁**（要保留用 `keep-alive`）；
- `active-class` 指定当前路由的样式类。

## 三、嵌套路由（多级路由）

父路由用 `children` 挂子路由：

```javascript
{
  path: '/home',
  component: Home,
  children: [
    { path: '/news',    component: News },
    { path: '/message', component: Message }
  ]
}
```

子路由的 `to` 写完整路径（`/home/news`），父组件模板里同样放一个 `<router-view>` 作为子级出口。

## 四、两种传参

| 方式 | 写法 | 取值 | 特点 |
|---|---|---|---|
| **query** | `to="/home?name=zs&age=18"` | `$route.query.name` | 参数在 URL 查询串上，刷新不丢 |
| **param** | 路由表声明 `path: '/home/:name/:age'`，`to="/home/zs/18"` | `$route.params.name` | 参数是路径的一部分，需路由表配合 |

## 五、命名路由与 props

给路由起名后可用对象跳转，路径变了不用改调用点：

```javascript
{ path: '/home', name: 'home', component: Home }
// <router-link :to="{ name: 'home', query: { id: 1 } }">…</router-link>
```

`props` 让组件**不依赖 `$route`**，三种写法：

```javascript
// ① 对象写法：静态值
props: { name: 'zs' }
// ② 布尔写法：把 params 全部作为 props 传入（简单场景）
props: true
// ③ 函数写法（最常用）：可同时取 params 与 query，并做转换
props(route) { return { id: route.params.id, kw: route.query.kw }; }
```

## 六、replace 与编程式导航

- `<router-link replace>` / `router.replace()`：**不留下历史记录**（后退回不到这一页），适合登录跳转、重定向；
- 编程式：`this.$router.push('/home')`、`this.$router.replace(...)`、`this.$router.go(-1)`、`this.$router.back()`。

## 七、缓存路由组件

```vue
<keep-alive include="News">
  <router-view></router-view>
</keep-alive>
```

被缓存的路由组件多出两个生命周期钩子：

| 钩子 | 触发时机 |
|---|---|
| `activated` | 组件被激活（进入） |
| `deactivated` | 组件失活（离开但仍被缓存） |

## 八、路由守卫

三层，粒度由粗到细：

| 类型 | 声明位置 | 作用范围 |
|---|---|---|
| 全局守卫 | `router.beforeEach` / `afterEach` | 所有路由 |
| 独享守卫 | 路由表里的 `beforeEnter` | 该条路由 |
| 组件内守卫 | `beforeRouteEnter` / `beforeRouteUpdate` / `beforeRouteLeave` | 该组件 |

最常用的是全局前置守卫：`beforeEach((to, from, next) => …)`，用来做登录校验、权限判断、动态标题；`next()` 放行、`next(false)` 中断、`next('/login')` 重定向。

## 九、两种工作模式

| 模式 | URL 形态 | 原理 | 部署要求 |
|---|---|---|---|
| **hash** | `/#/home` | 监听 `hashchange`，不发请求 | 无需服务端配置 |
| **history** | `/home` | 用 `history.pushState` 改 URL | 服务端要把未知路径回退到 `index.html`，否则刷新 404 |

`new VueRouter({ mode: 'history' })` 切换。用 history 必须配服务端 fallback（Nginx `try_files`），这是上线最常踩的坑。

## 来源

- 原文：[VUERouter](../../learningNote/vueNote/VUE2/VUERouter.md)（12 节完整示例）
- 相邻概念：[Vuex](./Vuex.md)
