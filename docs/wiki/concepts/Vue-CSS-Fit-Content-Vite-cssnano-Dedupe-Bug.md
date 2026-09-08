---
title: CSS fit-content 生产构建被错误优化（Vite cssnano 去重）
description: "Vite 生产构建的 cssnano 会把 fit-content 与 -moz-fit-content 视为重复声明，去重后只保留后写的 vendor 前缀，导致 Chromium/Edge 下样式失效；修复：标准语法置于 vendor prefix 之后"
created: 2026-09-08
updated: 2026-09-08
type: concept
tags: [CSS, Vite, Vue, Frontend, Build, Troubleshooting]
sources:
  - docs/postMortem/tiny_tips/2026_09_07.md
related:
  - docs/wiki/entities/Vue.md
  - docs/wiki/sources/PostMortem.md
---

# CSS fit-content 生产构建被错误优化（Vite cssnano 去重）

## 核心结论

> 需要 vendor prefix fallback 的属性，**标准语法要写在 vendor 前缀之后**。Vite 生产构建的 cssnano 会把 `fit-content` 与 `-moz-fit-content` 当作重复声明去重、只保留**后写**的那条——标准语法写在前会被删掉。

## 现象

- 本地开发（`pnpm dev`）：样式正常，`height: fit-content` 生效。
- 生产环境（GitHub Pages + Edge/Chromium）：`.welcome_btn` 只剩 `-moz-fit-content`（Edge 不识别），样式被划线失效；手动改回 `fit-content` 后正常。
- Firefox 正常（认识 `-moz-fit-content`），浏览器差异掩盖了问题。

## 根因

问题出现在博饼网站（bobing.jeacsonsnake.com）欢迎页按钮。Vite 生产构建的 CSS 压缩器（cssnano）把 `fit-content` 与 `-moz-fit-content` 视为**重复声明**，去重时只保留后写的 `-moz-fit-content`，删除了前写的标准语法：

```css
/* 源码：标准语法在前 */
.welcome_btn { width: fit-content; height: fit-content;
               width: -moz-fit-content; height: -moz-fit-content; }

/* 构建产物：标准语法被删，只剩 -moz-fit-content */
.welcome_btn { width: -moz-fit-content; height: -moz-fit-content; }
```

排查方法：Edge DevTools → Network 找到浏览器实际拿到的 CSS 文件，与源码对比，即可确认是**构建期产物问题**而非浏览器/部署平台问题。

## 修复

把标准语法放到 vendor prefix **之后**，让压缩器"去重"后保留的是标准语法：

```css
.welcome_btn { width: -moz-fit-content; height: -moz-fit-content;
               width: fit-content; height: fit-content; }
```

副作用：该写法放弃 2021 年之前 Firefox 的兼容，需自行评估是否可接受。

## 尝试过但没有用的方案

在 `vite.config.ts` 中把 `build.cssMinify` 改为 `'lightningcss'` 替代 cssnano——清空 `dist` 重新构建后问题依旧。猜测是 Vite 对 lightningcss 支持有限、仍回退到 esbuild/cssnano 编译，或 esbuild 存在类似的重复声明合并逻辑。

## 关键陷阱

- **样式异常先对比源码与生产下发的 CSS**：构建产物与源码不一致时，优先怀疑压缩/去重环节，而不是浏览器兼容性。
- **只在一个浏览器验证"正常"不够**：`-moz-` 前缀恰好被 Firefox 接受，会掩盖标准语法已被删除的事实。
