---
title: markdown-it渲染器
icon: 'markdown'
---

## 简述

一些在markdown-it踩坑后的总结向文章。

## 一、在 vuepress 中引入 markdown-it 的插件

背景：在书写[自动化控制原理相关表格](../../learningNote/Principles_of_Automatic_Control_Related/README.md#s-z变换表-table-of-s--and-z-transforms)时希望将表格进行合并，但是普通的Markdown并没有针对复杂表格的处理能力。

### 如何处理

首先尝试找 `vuepress` 有没有相关的插件可以对其进行处理，但是发现并没有。
之后在他人提醒下，发现 `vuepress` 是使用 `markdown-it` 作为解析器对 `markdown` 进行解析的，而该解析器有相应的扩展功能。因此转向尝试寻找 `markdown-it` 下有无相应的扩展可以支持该操作。

### 解决方法

使用 `markdown-it-multimd-table` 插件对表格相关进行 `markdown` 渲染的增强。引入方式如下：

- 使用 `pnpm i -D markdown-it-multimd-table` 下载相关插件 `markdown-it-multimd-table`

- 在 `.vuepress/config.ts` 下 import 该插件：

    ```typescript
    import Multimd_table from 'markdown-it-multimd-table'
    ```

- 在 export 中添加 `extendsMarkdown` 钩子进行导入：

    ```typescript
    export default defineUserConfig({
        ...
        extendsMarkdown: (md) => {
            md.use(Multimd_table)
        }
    })
    ```

然后就可以使用了。
