---
title: "博客与日报归档拆分设想：独立站点与统一图片目录"
description: "把 AI 日报归档从主博客拆到独立 VuePress 站点、用不同子域名互相跳转，并把文章图片统一到一个公共目录——这是 2026-11-25 提出的结构设想，站点拆分尚未实施，图片部分已在同日的 public/blog_assets 迁移中先行落地"
type: concept
tags: [Blog, VuePress, Architecture, Planning, Deployment]
created: 2026-11-26
updated: 2026-11-26
article: false
author: 'Hermes_Agent_cRl1_bot'
sources:
  - docs/complain_diary/2026_11_25.md
related:
  - ../sources/Complain_Diary.md
  - ./Blog-Bilingual-Translation-Pipeline.md
  - ./Briefing-Archive-Auto-Merge-Topology.md
---

# 博客与日报归档拆分设想

## 一、背景

博客目前同时承载两类内容：

1. **手写博客**：学习笔记、踩坑记录、随笔；
2. **AI 日报归档**：Hermes Agent 每天生成的行业分析报告，通过自动归档链路写进 `docs/Scheduled_Automatic_AI_Industry_Analysis_Report/`。

归档跑了几个月后，作者觉得「放在同一个项目里不是那么合适」：日报是自动生成、体量稳定增长的内容，长期和手写博客混在一起，会让博客项目越来越臃肿。

## 二、设想

- 把博客和日报归档**拆成两个项目**，部署在**不同子域名**下，互相用超链接跳转；
- 日报归档单独用一个 VuePress 站点，主博客只保留手写内容；
- 文章图片统一放到**一个公共目录**，避免中英双语各存一份，节省服务器资源。

一句话：**内容按「人写的」和「机器生成的」分家，资产按「一份」而不是「每种语言一份」来存。**

## 三、图片部分已经先行落地

「统一图片目录」的诉求在 2026-11-25 的图片迁移中已经实现：全部文章图片移到 `docs/.vuepress/public/blog_assets/`，中英两棵树共用 `/blog_assets/…` 引用，翻译时不再复制图片。详见：

- [博客全站英译与 EN 自动翻译链路](./Blog-Bilingual-Translation-Pipeline.md) §五
- [VuePress 静态资源与 VSCode Markdown Hover 的路径解析差异](./VuePress-Public-Assets-VSCode-Markdown-Hover.md) — 这次迁移带来的本地 Hover 副作用

站点拆分与图片统一是两件事：图片部分已完成，站点结构仍是设想。

## 四、待定的问题

| 问题 | 现状 |
|---|---|
| 子域名怎么分（`blog.` / `daily.` 或其他） | 未定 |
| 归档站点是新建仓库，还是同仓库多 VuePress 配置 | 未定 |
| 跨站链接、RSS、站内搜索如何衔接 | 未定 |
| 旧归档 URL 是否需要重定向 | 未定 |
| 迁移顺序（先拆站点还是先调目录结构） | 未定 |

这些都需要先做一次目录与部署影响面盘点，再决定方案；本文只记录设想，不代表已定案。

## 五、状态

- 2026-11-25：记录设想（源文章：[关于「调整博客文件结构」的想法](../../complain_diary/2026_11_25.md)）；
- 站点拆分：**未实施**；
- 图片统一：**已实施**（`public/blog_assets/`）。

## 六、关联

- [随笔知识域摘要](../sources/Complain_Diary.md)
- [博客全站英译与 EN 自动翻译链路](./Blog-Bilingual-Translation-Pipeline.md)
- [AI 简报自动归档两跳链路](./Briefing-Archive-Auto-Merge-Topology.md)
