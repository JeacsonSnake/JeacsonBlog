---
title: 001_Adding a markdown-it plugin to vuepress
icon: 'markdown'
category: markdown
tag:
  - table
  - vuepress
  - markdown-it
---

## Background

While writing the [tables for the automatic control theory notes](../../learningNote/Principles_of_Automatic_Control_Related/README.md#s-z-transform-table-table-of-s-and-z-transforms) I wanted to merge some cells, but plain Markdown has no way to handle complicated tables.

### How to go about it

First I went looking for a `vuepress` plugin that could handle it, and found none.
Then someone pointed out that `vuepress` uses `markdown-it` as the parser for `markdown`, and that parser has an extension mechanism. So I turned to looking for an extension under `markdown-it` that could support the operation.

### The solution

Use the `markdown-it-multimd-table` plugin to enhance how `markdown` renders tables. Bring it in like this:

- Run `pnpm i -D markdown-it-multimd-table` to download the plugin `markdown-it-multimd-table`

- Import the plugin in `.vuepress/config.ts`:

    ```typescript
    import Multimd_table from 'markdown-it-multimd-table'
    ```

- Add an `extendsMarkdown` hook to the export to wire it in:

    ```typescript
    export default defineUserConfig({
        ...
        extendsMarkdown: (md) => {
            md.use(Multimd_table)
        }
    })
    ```

And then you can use it.

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../postMortem/markdown_render/001_import.md. The translation is for reference only.
Translation time: 2026-11-05
:::
