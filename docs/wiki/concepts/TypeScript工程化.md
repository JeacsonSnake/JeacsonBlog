---
title: "TypeScript 工程化：webpack + ts-loader 与 Babel"
description: "用 webpack 承载 TS 项目的完整步骤：npm init 初始化、安装 webpack/webpack-cli/webpack-dev-server/typescript/ts-loader/html-webpack-plugin/clean-webpack-plugin 七个包、webpack.config.js 的 entry/output/resolve/module.rules/devServer 配置、tsconfig.json 与 package.json scripts，以及 Babel 存在的意义"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [TypeScript, webpack, Babel, Build-Tooling]
sources:
  - docs/learningNote/TypeScriptNote/第三天.md
related:
  - ./TypeScript类型系统.md
  - ./TypeScript面向对象.md
  - ../entities/TypeScript.md
---

# TypeScript 工程化（webpack + Babel）

## 核心结论

> `tsc` 只做「TS → JS」，不做打包、模块合并、热更新、资源处理。真实项目要让 **webpack 负责构建、`ts-loader` 负责在其中调用 TS 编译器**；`Babel` 则在需要更激进的语法降级/插件生态时接手转译那一层。

## 一、初始化与安装

```powershell
npm init -y      # 生成 package.json

npm i -D webpack webpack-cli webpack-dev-server typescript ts-loader clean-webpack-plugin
```

七个（原文列了 html-webpack-plugin 等）包的分工：

| 包 | 作用 |
|---|---|
| `webpack` | 构建工具本体 |
| `webpack-cli` | 命令行入口 |
| `webpack-dev-server` | 开发服务器（热更新） |
| `typescript` | TS 编译器 |
| `ts-loader` | 让 webpack 能编译 `.ts` 文件 |
| `html-webpack-plugin` | 自动生成/注入 HTML |
| `clean-webpack-plugin` | 每次构建前清空输出目录 |

## 二、webpack.config.js

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  optimization: { minimize: false },      // 关闭压缩，便于调试
  entry: "./src/index.ts",
  devtool: "inline-source-map",           // 生成 sourcemap
  devServer: { contentBase: "./dist" },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    environment: { arrowFunction: false } // 关闭箭头函数输出，兼容旧浏览器
  },

  resolve: { extensions: [".ts", ".js"] }, // 允许 import 时省略后缀

  module: {
    rules: [
      { test: /\.ts$/, use: { loader: "ts-loader" }, exclude: /node_modules/ }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ title: "TS测试" })
  ]
};
```

要点：

- `resolve.extensions` 决定 `import './x'` 能否命中 `.ts`；
- `module.rules` 里 `exclude: /node_modules/` 是必须的，否则会去编译依赖；
- `devtool: "inline-source-map"` 让浏览器报错指向 TS 源码行号。

## 三、tsconfig.json 与 scripts

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ES2015",
    "strict": true
  }
}
```

```json
{
  "scripts": {
    "build": "webpack",
    "start": "webpack serve --open"
  }
}
```

`ts-loader` 会读取同一目录的 `tsconfig.json` —— 同一份配置被 CLI 与构建工具共享，避免「命令行能编译、打包报错」的错位。

## 四、Babel 的位置

当需要**更细的语法降级**（按浏览器目标自动选择 polyfill/transform）、或复用 Babel 插件生态（如装饰器、可选链的早期实现）时，转译交给 `@babel/preset-typescript` 处理，webpack 侧用 `babel-loader` 替代 `ts-loader`。

两者的取舍：

| | ts-loader | babel-loader + preset-typescript |
|---|---|---|
| 类型检查 | 编译时做 | **不做**（需另跑 `tsc --noEmit`） |
| 语法降级 | 由 `target` 决定 | 由 Browserslist + preset-env 决定，更灵活 |
| 生态 | 少 | 丰富（插件体系） |
| 编译速度 | 较慢（含类型检查） | 较快 |

常见工程做法：`babel-loader` 负责转译以求速度，CI 里单独跑 `tsc --noEmit` 做类型门禁。

## 来源

- 原文：[TypeScript 第三天 webpack & babel 操作](../../learningNote/TypeScriptNote/第三天.md)
- 相关：[类型系统](./TypeScript类型系统.md)
