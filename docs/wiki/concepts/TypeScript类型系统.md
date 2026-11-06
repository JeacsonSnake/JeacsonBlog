---
title: "TypeScript 类型系统：从类型声明到 tsconfig 编译选项"
description: "TS 是 JS 的超集，在编译前做类型检查。覆盖类型声明与自动推断、完整基本类型表（number/string/boolean/字面量/any/unknown/void/never/object/array/function/tuple/enum）、类型断言的两种写法，以及 tsconfig.json 的 include/exclude/extends/files 与 compilerOptions 的 target/lib/module"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [TypeScript, Type-System, tsconfig, Tooling]
sources:
  - docs/learningNote/TypeScriptNote/第一天.md
  - docs/learningNote/TypeScriptNote/第二天.md
related:
  - ./TypeScript面向对象.md
  - ./TypeScript工程化.md
  - ../entities/TypeScript.md
  - ../sources/TypeScript.md
---

# TypeScript 类型系统

## 核心结论

> TypeScript 是 JavaScript 的**超集**：任何 JS 代码都是合法 TS。它在编译期加一层静态类型检查，把「运行时才炸」的错误提前到「编译时就报」，然后编译成任意版本的 JS 交给 JS 引擎执行。

## 一、为什么用它

| 维度 | JS | TS |
|---|---|---|
| 类型 | 动态，运行时才暴露 | 静态，编译前检查 |
| 语法 | 宽松 | 更严格 |
| 兼容性 | — | 可编译为任意版本 JS，解决不同运行环境的兼容问题 |
| 代码量 | 少 | 多（要写类型） |
| 长期维护 | 类型靠约定 | 类型即文档，重构安全 |

代价是代码量变大；收益是「编译期就发现错误」+「结构清晰」。

## 二、环境与编译

```powershell
npm i -g typescript     # 全局安装编译器
tsc xxx.ts              # 编译单个文件 → 生成 xxx.js
```

流程：写 `.ts` → `tsc` 编译 → 得到 `.js` → 交给 JS 解析器执行。

## 三、类型声明与自动推断

类型声明指定变量（含形参、实参）只能存某类值，赋值时编译器自动校验：

```typescript
let 变量: 类型;
let 变量: 类型 = 值;

function fn(参数: 类型, 参数: 类型): 返回值类型 { ... }
```

若**声明与赋值同时进行**，TS 会自动推断类型，此时可以省略类型标注。

## 四、基本类型表

| 类型 | 例子 | 说明 |
|---|---|---|
| `number` | `1, -33, 2.5, 0xf00d, 0b1010, 0o744` | 任意数字（含十六/二/八进制） |
| `string` | `'hi'`, `"hi"`, `` `hi` `` | 任意字符串 |
| `boolean` | `true` / `false` | 布尔 |
| 字面量 | `'red'` / `'blue'` 联合 | 把变量限制为某几个具体值 |
| `any` | `*` | 任意类型（**关闭类型检查**，尽量少用） |
| `unknown` | `*` | 类型安全的 `any`：赋值给具体类型前必须判断或断言 |
| `void` | `undefined` | 没有值 |
| `never` | 抛错函数的返回类型 | 不能是任何值 |
| `object` | `{ name: 'x', age?: number }` | 指定对象包含哪些属性，`?` 表示可选 |
| `array` | `number[]` / `Array<number>` | 数组（两种写法等价） |
| `function` | `(a: number, b: number) => number` | 函数类型 |
| `tuple` | `[string, number]` | 元组，固定长度的数组 |
| `enum` | `enum Color { Red, Green }` | 枚举，可指定起始值 |

`unknown` 的关键差异：把 `unknown` 直接赋给 `string` 会报错，必须先判类型：

```typescript
let notSure: unknown = 4;
let s: string;
if (typeof notSure === 'string') {
  s = notSure;      // ✓ 类型收窄后才能赋值
}
```

## 五、类型断言

有些值「我知道类型，编译器不知道」，用断言告诉它。两种写法：

```typescript
let someValue: unknown = "this is a string";

// ① as 写法（推荐，不与 JSX 的 <> 冲突）
let len1: number = (someValue as string).length;

// ② 尖括号写法
let len2: number = (<string>someValue).length;
```

## 六、tsconfig.json

单个文件用 `tsc xxx.ts`；整个项目直接 `tsc` 需要根目录有 `tsconfig.json`。

常用字段：

| 字段 | 作用 | 默认值 |
|---|---|---|
| `include` | 要编译的目录 | `["**/*"]` |
| `exclude` | 排除的目录 | `["node_modules", "bower_components", "jspm_packages"]` |
| `extends` | 继承另一个配置文件 | — |
| `files` | 精确列出要编译的文件（文件少时才用） | — |
| `compilerOptions` | 编译行为，见下 | — |

### compilerOptions 三个核心项

| 选项 | 作用 | 常用值 |
|---|---|---|
| `target` | 编译成的 JS 版本 | ES3(默认)、ES5、ES6/ES2015 … ESNext |
| `lib` | 运行时可用的库（宿主环境） | `["ES6", "DOM"]`；跑在 Node 时通常不需要改，浏览器环境才有 `DOM` |
| `module` | 输出的模块化规范 | CommonJS、AMD、System、UMD、ES6/ES2015、ES2020、ESNext |

```json
{
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["./src/hello/**/*"],
  "compilerOptions": {
    "target": "ES6",
    "lib": ["ES6", "DOM"],
    "module": "ES6"
  }
}
```

监视模式：

```powershell
tsc xxx.ts -w     # 单文件自动编译
tsc                # 配好 tsconfig 后自动编译整个项目
```

## 来源

- 原文：[TypeScript 第一天 开始入门](../../learningNote/TypeScriptNote/第一天.md)、[第二天 配置编译选项](../../learningNote/TypeScriptNote/第二天.md)
- 相关：[面向对象与泛型](./TypeScript面向对象.md)、[webpack/Babel 工程化](./TypeScript工程化.md)
