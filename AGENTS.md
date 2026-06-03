# JeacsonBlog — AGENTS.md

本文件面向 AI Coding Agent，说明项目架构、构建流程、内容规范及维护约定。本项目是一个基于 VuePress 2 的个人博客与知识库系统，主要语言为中文（zh-CN）。

---

## 项目概览

JeacsonBlog 是一个使用 VuePress 3 + vuepress-theme-hope 构建的静态博客站点，托管于 GitHub Pages，并通过 GitHub Actions 自动部署。站点同时承载两大部分：

1. **博客笔记层** (`docs/`) — 手写的原始学习笔记、踩坑记录与随笔，是 source of truth
2. **LLM Wiki 层** (`docs/wiki/`) — 由 LLM Agent 增量维护的知识库，对博客内容进行摘要、实体关联与概念提炼

线上地址：<https://blog.jeacsonsnake.com>

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 静态站点生成器 | VuePress `2.0.0-rc.30` |
| 主题 | vuepress-theme-hope `2.0.0-rc.107` |
| 构建工具 | Vite (`@vuepress/bundler-vite`) |
| 前端框架 | Vue 3 |
| 样式 | SCSS (sass-embedded) |
| 包管理器 | pnpm (使用 `node-linker=hoisted`) |
| 评论系统 | Waline (`@waline/client` 3.15.0) |
| 数学渲染 | KaTeX |
| Markdown 扩展 | `markdown-it-multimd-table` |
| 部署 | GitHub Actions → GitHub Pages |
| CDN / DNS | Cloudflare |

具体请参考 `package.json`, `pnpm-lock.yaml`,`pnpm-workspace.yaml`。

---

## 项目结构

```
JeacsonBlog/
├── docs/                          # VuePress 源目录（站点根）
│   ├── .vuepress/                 # VuePress 配置与资源
│   │   ├── config.ts             # 站点主配置（bundler、locales、markdown 插件）
│   │   ├── theme.ts              # hopeTheme 主题配置（插件、博客、Feed、导航）
│   │   ├── client.ts             # 客户端配置（引入主题预设 SCSS）
│   │   ├── navbar/               # 导航栏配置（zhNavbar.ts / enNavbar.ts）
│   │   ├── sidebar/              # 侧边栏配置（zhSidebar.ts / enSidebar.ts）
│   │   ├── styles/               # 自定义样式
│   │   │   ├── config.scss
│   │   │   └── palette.scss      # 主题色 $theme-color: #778aa9
│   │   └── public/assets/img/    # 静态图片资源（logo、favicon、avatar、首页背景）
│   ├── README.md                 # 中文主页（home: true, layout: Blog）
│   ├── about/                    # 关于页面
│   ├── complain_diary/           # 随笔/牢骚
│   ├── en/                       # 英文版页面（结构精简）
│   ├── learningNote/             # 学习笔记（核心内容）
│   │   ├── JSNote/               # JavaScript / ES6+
│   │   ├── vueNote/              # Vue2 / Vue3
│   │   │   ├── VUE2/
│   │   │   └── VUE3/
│   │   ├── TypeScriptNote/       # TypeScript
│   │   ├── Computer_Network/     # 计算机网络
│   │   ├── Ros2_Note/            # ROS2 机器人操作系统
│   │   │   ├── co_me/            # 通信机制（旧目录）
│   │   │   ├── co_me_2/          # 通信机制（新目录）
│   │   │   ├── coor_trans/       # 坐标变换
│   │   │   └── launch_rosbag2/   # launch 与 rosbag2
│   │   ├── coding_skill/         # 编码技术
│   │   ├── Principles_of_Computer_Composition/
│   │   └── Principles_of_Automatic_Control_Related/
│   ├── postMortem/               # 踩坑心得
│   │   ├── deploy/
│   │   └── markdown_render/
│   └── wiki/                     # LLM Wiki 知识库层（见下方 Wiki Schema）
│       ├── index.md              # 维基总目录
│       ├── log.md                # append-only 操作日志
│       ├── sources/              # 按博客分类生成的知识域摘要
│       ├── entities/             # 主题/领域聚合页
│       └── concepts/             # 具体知识点深度页
├── .github/workflows/             # GitHub Actions 工作流
│   └── deploy-website.yml        # 自动构建并部署到 gh-pages 分支
├── package.json                   # 项目脚本与依赖
├── pnpm-workspace.yaml            # pnpm 工作区配置（仅包含根目录）
├── .npmrc                         # pnpm 配置：node-linker=hoisted
├── .commitlintrc.js               # cz-git + conventional commits 配置（中文交互）
└── AGENTS.md                      # 本文件
```

---

## 构建与开发命令

所有命令通过 `package.json` 中的 scripts 提供，使用 pnpm 执行：

```bash
# 本地开发服务器（热重载）
pnpm run docs:dev

# 构建生产站点（输出到 docs/.vuepress/dist/）
pnpm run docs:build
```

**注意**：`package.json` 中 `test` 脚本未配置（`echo "Error: no test specified" && exit 1`）。本项目目前没有自动化测试。

---

## VuePress 配置要点

### 多语言

- 默认语言：`/` → `zh-CN`
- 英文路径：`/en/` → `en-US`
- 主页、导航栏、侧边栏均按语言分离配置

### 主题关键功能（vuepress-theme-hope）

- **博客模式**：启用 `blog: true`，作者信息、头像、社交媒体链接在 `theme.ts` 的 `blog` 字段配置
- **评论**：Waline，serverURL 为 `https://blogcomment.jeacsonsnake.com/`
- **Feed**：RSS / Atom / JSON 三种格式，过滤主页与无内容页面，作者默认名 `xxx`
- **Markdown 增强**：KaTeX 数学公式、图片大小指定、脚注、上下标、Tabs、自定义属性
- **图标**：使用阿里 iconfont 字体图标

### 自定义 Markdown 插件

在 `docs/.vuepress/config.ts` 中通过 `extendsMarkdown` 注册了 `markdown-it-multimd-table`，支持多行、无表头等扩展表格语法。

---

## 内容组织与 Frontmatter 约定

### 原始笔记（`docs/learningNote/`、`docs/postMortem/`、`docs/complain_diary/`）

原始笔记使用如下 frontmatter：

```yaml
---
title: <页面标题>
icon: <iconfont 图标名>
category:
  - <主分类>
  - <次分类>
tag:
  - <标签1>
  - <标签2>
---
```

常用 `category` 值包括：`JavaScript`、`Web`、`Computer`、`robot`、`ROS`、`Network`、`VUE`、`Skill`、`TypeScript` 等。

- 目录下的 `README.md` 通常作为该分类的入口页，可设置 `article: false` 避免被博客列表收录
- 笔记中的图片使用相对路径引用，如 `./assets/xxx.jpg`

### 特殊页面

- **主页**：`docs/README.md` 使用 `home: true`、`layout: Blog`、`heroFullScreen: true`
- **Wiki 页面**：见下方 Wiki Schema 部分的 frontmatter 约定

---

## Wiki 层 Schema

Wiki 目录为 `docs/wiki/`（也作为普通 Markdown 页面被 VuePress 渲染）。

### 三个层次

| 目录 | 职责 | 说明 |
|------|------|------|
| `wiki/sources/` | 知识域摘要 | 对应博客每个分类的摘要页，由 LLM 阅读 `docs/learningNote/<category>/` 后生成/更新。每个文件代表一个知识域的整体概览。 |
| `wiki/entities/` | 实体页 | 主题/领域级别的聚合，如 `JavaScript.md`、`ROS2.md`，从 source 页派生，关联多个相关概念。 |
| `wiki/concepts/` | 概念页 | 具体知识点的深度页面，如 `Reduce方法.md`、`坐标变换.md`，通常对应一篇或多篇源笔记核心内容提炼 |

### Wiki 页面 frontmatter

```yaml
---
title: <页面标题>
description: <简短描述，1-2句话>
type: source | entity | concept
tags: [<topic1>, <topic2>]
sources: [<相关的 docs/ 路径>]   # 仅 entity 和 concept
related:
  - "[[../concepts/xxx]]"
  - "[[../entities/xxx]]"
lastUpdated: <YYYY-MM-DD>
---
```

### 核心操作

#### Ingest（新笔记或更新）

1. **阅读源文件**：完整读取 `docs/learningNote/<category>/<file>.md`
2. **判断影响范围**：
   - 全新领域 → 创建 `docs/wiki/sources/<category>.md`
   - 已有领域 → 更新对应的 `docs/wiki/sources/<category>.md`
3. **提炼概念**：提取关键概念，检查 `docs/wiki/concepts/`：
   - 有 → 更新，补充新信息，标注矛盾
   - 无 → 创建 `docs/wiki/concepts/<concept-name>.md`
4. **更新实体**：检查 `docs/wiki/entities/` 中的相关实体页，更新关联
5. **更新 index.md**：将新页面加入总目录
6. **记录 log**：在 `docs/wiki/log.md` 追加 `## [YYYY-MM-DD] ingest | <source file>`

#### Query（查询）

1. 先读 `docs/wiki/index.md` 找到相关页面
2. 深入阅读相关 source、entity、concept 页面
3. 如需更深细节，再去 `docs/` 读对应源笔记
4. 给出回答，并询问是否需要将回答沉淀为新的 concept 页

#### Lint（健康检查）

1. 检查 `docs/wiki/concepts/` 中是否有孤立页面（无 inbound link）
2. 检查是否有页面引用了已删除/移动的源笔记
3. 检查 `docs/wiki/sources/` 和对应 `docs/` 是否还有同步（源删了但 summary 没更新）
4. 检查 `docs/wiki/index.md` 是否与实际页面一致
5. 将问题汇报给用户

### index.md 格式

```markdown
---
title: JeacsonBlog Wiki Index
---

# JeacsonBlog Wiki

## Sources（知识域摘要）
- [[./sources/JavaScript.md]] — ...

## Entities（实体/主题）
- [[./entities/JavaScript.md]] — ...

## Concepts（具体概念）
- [[./concepts/Reduce方法.md]] — ...

## 最近更新
<!-- 引用 log.md 最后 5 条 -->
```

### log.md 格式

```markdown
---
title: Wiki Log
---

## [2026-04-17] init | 初始化 Wiki 层
## [2026-04-17] ingest | docs/learningNote/JSNote/Reduce方法.md
```

**关键原则**：

1. `docs/` 是**只读**的。LLM 永远不修改 `docs/` 下的**任何**原始笔记文件。
2. **Wiki 是增量维护的**。每次 ingest 不要重写整个文件，要做增量更新。
3. **Log 是 append-only 的**。不要删除或修改历史 log 条目。
4. **Ingest 前先读 `docs/wiki/index.md` 和 `docs/wiki/log.md`**，了解 wiki 当前状态。
5. **Wiki 页面要有 inbound links**。创建新 concept 时，检查相关 entity 和 source 是否需要添加 link。
6. 当 `docs/` 有笔记被删除时，**同步清理** wiki 层中 orphaned 的页面或引用。

---

## 部署流程

部署完全由 GitHub Actions 自动化完成（`.github/workflows/deploy-website.yml`）：

1. **触发条件**：`push` 到 `master` 分支，或手动触发 `workflow_dispatch`
2. **环境**：`ubuntu-latest`，Node.js 20，pnpm 8
3. **步骤**：
   - `actions/checkout@v4`（`fetch-depth: 0`，保留完整 git 历史以支持 "最近更新时间"）
   - `pnpm/action-setup@v2` 安装依赖
   - `pnpm docs:build` 构建（设置 `NODE_OPTIONS=--max-old-space-size=4096`）
   - 写入自定义域名 `blog.jeacsonsnake.com` 到 `docs/.vuepress/dist/CNAME`
   - 使用 `crazy-max/ghaction-github-pages@v3` 推送到 `gh-pages` 分支
4. **线上托管**：GitHub Pages + Cloudflare DNS 代理

**Agent 注意事项**：

- 不要手动运行 `git commit` / `git push` / `git rebase` 等操作，除非用户明确要求
- 构建输出目录 `docs/.vuepress/dist/` 与临时目录 `.temp/`、`.cache/` 已被 `.gitignore` 排除

---

## 提交规范

项目使用 **Conventional Commits** 配合 **cz-git** 进行交互式提交：

- 配置文件：`.commitlintrc.js`
- 交互语言：中文
- 可用 type：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`revert`、`chore`
- 快捷别名：`fd` → `docs: fix typos`
- issue 前缀支持：`link`、`closed`

提交时建议使用 `git cz`（若已全局安装 commitizen）或直接通过 cz-git 交互完成。

---

## 代码与内容风格指南

### TypeScript / VuePress 配置

- VuePress 配置文件使用 TypeScript（`.ts`）
- 导航栏与侧边栏配置分离到独立文件，按语言导出
- 主题色通过 `docs/.vuepress/styles/palette.scss` 统一定义

### Markdown 内容

- 使用标准 Markdown + VuePress 扩展语法
- 代码块标注语言以正确高亮（`javascript`、`python`、`bash`、`yaml` 等）
- 图片放在同级 `assets/` 目录，使用相对路径
- 使用 VuePress 提示容器：`::: tip`、`::: note`、`::: warning` 等
- 数学公式使用 KaTeX：`$...$` 或 `$$...$$`

### 文件命名

- 中文文件名允许使用，但在 URL 中会被编码（如 `Reduce方法.md`）
- 日期格式文件常见于 ROS2 笔记（`2024_09_12.md`、`2025_03_11.md`）
- 尽量不使用空格，若必须使用则在 VuePress 内部处理为下划线或编码形式

---

## 安全与隐私注意事项

1. **Waline 评论服务**：serverURL 指向独立部署的后端 `blogcomment.jeacsonsnake.com`，前端配置中仅暴露服务端点，不包含数据库密钥
2. **GitHub Actions**：使用 `GITHUB_TOKEN` 自动授权推送到 `gh-pages`，无需在仓库中存储长期 Personal Access Token
3. **无环境变量文件**：站点为纯静态博客，不依赖 `.env` 文件，无需处理 API Key 或数据库连接字符串
4. **静态资源**：`docs/.vuepress/public/` 下的所有文件会在构建时原样复制到输出目录，避免放置敏感信息

---

## 故障排查速查

| 现象 | 可能原因 | 解决 |
|------|---------|------|
| 构建时内存溢出 | Vite 处理大量 Markdown 页面 | 已配置 `NODE_OPTIONS=--max-old-space-size=4096` |
| 侧边栏/导航栏不更新 | 配置在 `zhSidebar.ts` / `zhNavbar.ts` 中硬编码 | 修改对应 ts 文件后重新构建 |
| 图片 404 | 路径错误或图片未放入 `public/` 或同级 `assets/` | 检查相对路径或移至 `public/assets/img/` |
| 评论加载失败 | Waline 服务端不可用或域名配置变更 | 检查 `theme.ts` 中的 `serverURL` |
| Feed 生成报错 | 某页面 content 为空或 frontmatter 异常 | 查看构建日志中 `No content:` 提示，补充页面内容或排除页面 |

---

*本文件由 AI Agent 根据实际项目内容生成，应与项目实际结构保持同步。若项目配置发生重大变更，请同步更新本文件。*
