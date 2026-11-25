---
title: "VuePress 静态资源与 VSCode Markdown Hover 的路径解析差异"
description: "VuePress 把 .vuepress/public 映射到站点根，`/blog_assets/…` 在构建后可用；VSCode 却把 `/` 解析为 workspace 根，导致 Markdown Hover 预览失效。用 Windows 目录符号链接 + .gitignore 恢复，并记下「markdown.preview.rootPath 并不存在」这个假方案"
type: concept
tags: [VuePress, VSCode, Markdown, Static Assets, Troubleshooting, Windows]
created: 2026-11-26
updated: 2026-11-26
article: false
author: 'Hermes_Agent_cRl1_bot'
confidence: high
sources:
  - docs/postMortem/tiny_tips/2026_11_25.md
related:
  - ../entities/Vue.md
  - ../sources/PostMortem.md
  - ./Blog-Bilingual-Translation-Pipeline.md
---

# VuePress 静态资源与 VSCode Markdown Hover 的路径解析差异

## 一、核心结论

同一个 `/blog_assets/…` 路径，在**站点构建**和 **VSCode 编辑器**里走的是两套解析规则：

| 使用方 | `/` 开头的路径按谁解析 | 结果 |
|---|---|---|
| VuePress（构建 / 线上） | 站点根；`.vuepress/public` 下的内容被复制到站点根 | `/blog_assets/a.png` → 能加载 |
| VSCode Markdown（Hover / 预览） | **Workspace 根目录** | `<workspace>/blog_assets/a.png` → 不存在，Hover 无图 |

所以「线上图片正常、VSCode Hover 不出图」不是图片丢了，也不是 Markdown 写错了，而是**编辑器少了一层「public → 站点根」的映射**。

## 二、两边的规则

### VuePress 侧

`.vuepress/public` 是默认的公共静态资源目录，其中的文件会原样复制到生成站点的根目录：

```text
docs/.vuepress/public/blog_assets/a/b/assets/img/001.png
        ↓ 构建
/blog_assets/a/b/assets/img/001.png
```

因此页面里用站点绝对路径引用即可。本项目当前使用 VuePress `2.0.0-rc.31`，官方说明见 [Assets | VuePress](https://v2.vuepress.vuejs.org/zh/guide/assets.html)。

### VSCode 侧

VSCode 原生 Markdown 的解析规则是：

1. `/` 开头 → 相对于当前 **Workspace 根目录**；
2. `./` 或不带前缀 → 相对于当前 Markdown 文件所在目录。

于是 `/blog_assets/…` 被当成 `<workspace>/blog_assets/…`，而文件实际在 `docs/.vuepress/public/blog_assets/…`，路径匹配失败。VSCode 的图片/视频 Hover 预览是 `1.89` 版本正式加入的（[更新说明](https://code.visualstudio.com/updates/v1_89)），此前没有这个依赖。

## 三、背景：为什么会用到站点绝对路径

2026-11-25 博客把文章图片统一迁移到了 `docs/.vuepress/public/blog_assets/`，中英两棵树共用 `/blog_assets/…` 引用，翻译时不再复制图片。迁移本身解决了双语重复资产的问题，但副作用就是本地开发时 VSCode 的 Hover 预览失效——因为编辑器不认识 VuePress 的 public 映射。背景见 [博客全站英译与 EN 自动翻译链路](./Blog-Bilingual-Translation-Pipeline.md)。

## 四、修复：在 workspace 根放一个目录符号链接

思路是让 workspace 根下真的存在 `blog_assets`，指向 public 里的实际目录：

```bat
:: 在仓库根目录，以管理员身份运行 CMD
mklink /D blog_assets docs\.vuepress\public\blog_assets
```

然后把它排除出版本控制（符号链接是本机开发辅助，不该提交）：

```gitignore
# VS Code Markdown Hover image preview
/blog_assets
```

这样 VSCode 按 workspace 根找 `/blog_assets/…` 时能落到真实文件，Hover 恢复；VuePress 构建仍然走自己的 public 规则，两边互不影响。

## 五、一个不存在的设置：`markdown.preview.rootPath`

网上有文章（例如火山引擎社区那篇）声称可以设置：

```json
{"markdown.preview.rootPath": "${workspaceFolder}/docs/.vuepress/public"}
```

**VSCode 官方并没有这个设置项**，翻了官方文档也找不到。最初的排查被这条信息带偏了半天。

教训：LLM 或社区文章给出的配置键，先回官方文档核对是否存在，再决定要不要照着改——尤其当它看起来「正好解决你的问题」的时候。

## 六、验证与适用边界

- 修复后：VSCode 中悬停 `![…](/blog_assets/…)` 能显示图片；`pnpm docs:build` 与线上路径不受影响。
- 该方案依赖「workspace 根 = 仓库根」；如果以后改成多根 workspace，符号链接要放到对应的根目录。
- 符号链接只在本地存在，CI / 其他机器不需要，也不会被提交（`.gitignore` 已排除）。

## 七、关联

- [Vue 实体](../entities/Vue.md)
- [踩坑心得知识域摘要](../sources/PostMortem.md)
- [博客全站英译与 EN 自动翻译链路](./Blog-Bilingual-Translation-Pipeline.md)
