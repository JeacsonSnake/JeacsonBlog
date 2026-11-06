---
title: "Vuex：state / getters / mutations / actions 与模块化"
description: "Vuex 的单向数据流约定：state 存共享数据、getters 是带 state 参数的计算属性、mutations 是唯一能改 state 的同步入口、actions 用 commit 间接改状态从而承载异步；配 mapState/mapGetters/mapMutations/mapActions 四个辅助函数与 namespaced 模块化"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [Vue, Vuex, State-Management, Vue2]
sources:
  - docs/learningNote/vueNote/VUE2/VUEX.md
related:
  - ../entities/Vue.md
  - ../sources/Vue.md
  - ./Vue-Router.md
  - ./数据响应式.md
---

# Vuex

## 核心结论

> Vuex 的核心是一条约束：**唯一能修改 state 的地方是 mutation，而 mutation 必须由 commit 触发；异步逻辑放 action，action 再 commit mutation。** 组件读 state/getters，改状态走 commit/dispatch —— 数据流永远是单向的，因此可追踪、可调试。

## 一、四个核心属性

| 属性 | 角色 | 怎么用 |
|---|---|---|
| `state` | 全局共享数据（单一状态树） | 读：`this.$store.state.data1` |
| `getters` | 带 `state` 参数的「计算属性」 | 读：`this.$store.getters.data1Times10` |
| `mutations` | **唯一**改状态的入口，必须同步 | 写：`this.$store.commit('increaseData1ByValue', value)` |
| `actions` | 承载异步逻辑，内部 commit mutation | 调：`this.$store.dispatch('incrementData1Async1', value)` |

### 创建 store

```javascript
// src/store/index.js
import Vue from 'Vue';
import Vuex from 'Vuex';

Vue.use(Vuex);   // 以插件方式引入

const state = { data1: 1, data2: 2, data3: 3 };

const getters = {
  data1Times10(state) { return state.data1 * 10; },
  data2MinusData3(state) { return state.data2 - state.data3; }
};

const mutations = {
  increaseData1ByValue(state, value) { state.data1 += value; },
  decreaseData1ByValue(state, value) { state.data1 -= value; }
};

const actions = {
  incrementData1Async1(context, value) {
    setTimeout(() => context.commit('increaseData1ByValue', value), 1000);
  }
};

export default new Vuex.Store({ actions, mutations, state, getters });
```

配置建议：把四个属性拆成独立文件再引入，不要全写进 `main.js`。

### commit 的三种传参形式

```javascript
// ① 直接传值
this.$store.commit('increaseData1ByValue', value);
// ② 包进对象（载荷 payload）
this.$store.commit('decreaseData1ByValue', { value });
// ③ 对象形式（type + 载荷）
this.$store.commit({ type: 'decreaseData1ByValue', value });
```

### action 为什么要存在

- action 里可以有任何异步操作（请求、定时器），最终用 `context.commit` 提交 mutation；
- `context` 与 store 实例有相同的方法和属性（`context.commit` / `context.state` / `context.getters`），但**模块化之后 `context !== store`**。

## 二、四个 map 辅助函数

组件里逐个写 `computed`/`methods` 映射太啰嗦，Vuex 提供批量映射：

| 辅助函数 | 映射到 | 等价于 |
|---|---|---|
| `mapState` | `computed` | `this.$store.state.x` |
| `mapGetters` | `computed` | `this.$store.getters.x` |
| `mapMutations` | `methods` | `this.$store.commit('x', payload)` |
| `mapActions` | `methods` | `this.$store.dispatch('x', payload)` |

```javascript
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState({ countAlias: 'count' }),   // 数组写法：...mapState(['count'])
    ...mapGetters(['doneTodosCount']),
    localComputedA() { /* 原有计算属性 */ }
  },
  methods: {
    ...mapMutations(['increment', 'incrementBy']),
    ...mapActions({ add: 'increment' })
  }
};
```

注意 `mapState` 里若要用 `this` 访问组件局部状态，**必须写成常规函数**（箭头函数拿不到 `this`）。

## 三、模块化与命名空间

单一状态树在复杂应用里会膨胀，Vuex 允许拆成多个 module，每个有自己的 state/mutation/action/getter，甚至嵌套子模块：

```javascript
const store = new Vuex.Store({
  modules: { a: moduleA, b: moduleB }
});

store.state.a;   // moduleA 的状态
```

默认情况下模块内的 action/mutation/getter **注册在全局命名空间**（多个模块可响应同一 mutation）。若希望封装与复用，加 `namespaced: true`：

```javascript
const account = {
  namespaced: true,
  state: () => ({}),          // 模块 state 用函数返回，避免共享引用
  getters: { isAdmin() {} },  // -> getters['account/isAdmin']
  actions: { login() {} },    // -> dispatch('account/login')
  mutations: { login() {} }   // -> commit('account/login')
};
```

命名空间后调用格式变成 `'模块名/原有名'`。

## 四、何时不该用

- 组件层级的简单共享（父子 props / provide-inject 足够）不必上 Vuex；
- 只要「一份从接口拉来的数据」用请求库自带缓存即可；
- Vue3 项目里 Vuex 4 仍可用，但官方主推 Pinia —— 迁移时注意 `mutations` 概念在 Pinia 中被 action 合并。

## 来源

- 原文：[VUEX](../../learningNote/vueNote/VUE2/VUEX.md)
- 相邻概念：[Vue Router](./Vue-Router.md)、[Vue3 数据响应式](./数据响应式.md)
