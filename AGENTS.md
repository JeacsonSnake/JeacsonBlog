# JeacsonBlog — AGENTS.md

本文件面向 AI Coding Agent，说明项目架构、构建流程、内容规范及维护约定。本项目是一个基于 VuePress 2 的个人博客与知识库系统，主要语言为中文（zh-CN）。

---

## 项目概览

JeacsonBlog 是一个使用 VuePress 2.0.0-rc.31 + vuepress-theme-hope 2.0.0-rc.110 构建的静态博客站点，托管于 GitHub Pages，并通过 GitHub Actions 自动部署。站点同时承载三大部分：

1. **博客笔记层** (`docs/learningNote/`、`docs/postMortem/`、`docs/complain_diary/`) — 手写的原始学习笔记、踩坑记录与随笔，是 source of truth
2. **LLM Wiki 层** (`docs/wiki/`) — 由 LLM Agent 增量维护的知识库，对博客内容进行摘要、实体关联与概念提炼
3. **AI 行业报告归档层** (`docs/Scheduled_Automatic_AI_Industry_Analysis_Report/`，`docs/en/` 下有同名镜像) — Hermes Agent 生成的每日/每月 AI 行业报告，经 `briefing-archive-*` 分支自动归档

线上地址：<https://blog.jeacsonsnake.com>

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 静态站点生成器 | VuePress `2.0.0-rc.31`（要求 Node.js >= 22.18） |
| 主题 | vuepress-theme-hope `2.0.0-rc.110` |
| 构建工具 | Vite 8 + Rolldown（`@vuepress/bundler-vite` `2.0.0-rc.31`） |
| 前端框架 | Vue 3.5 |
| 样式 | SCSS（`sass-embedded` 1.106） |
| 包管理器 | pnpm 12（`nodeLinker: hoisted`；CI 用 `pnpm/action-setup@v6`，v6.1.0 起支持 pnpm 12） |
| 评论系统 | Waline（`@waline/client` 3.16.1） |
| 数学渲染 | KaTeX `0.18.11` |
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
│   │   ├── navbar/               # 导航栏配置（index.ts 汇总，zhNavbar.ts / enNavbar.ts）
│   │   ├── sidebar/              # 侧边栏配置（index.ts 汇总，zhSidebar.ts / enSidebar.ts）
│   │   ├── styles/               # 自定义样式
│   │   │   ├── config.scss       # 主题色 $theme-color: #778aa9
│   │   │   └── palette.scss      # 主题调色板覆盖（当前为空，使用默认值）
│   │   └── public/assets/img/    # 静态图片资源（logo、favicon、avatar、首页背景）
│   ├── README.md                 # 中文主页（home: true, layout: Blog）
│   ├── about/                    # 关于页面
│   ├── complain_diary/           # 随笔/牢骚
│   ├── en/                       # 英文版页面（结构精简，含 AI 报告镜像）
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
│   │   ├── deploy/               # 部署相关
│   │   ├── markdown_render/      # Markdown / 渲染问题
│   │   ├── sp_for_LLM/           # 供 LLM 使用的长报告与复盘
│   │   └── tiny_tips/            # 零散小技巧
│   ├── Scheduled_Automatic_AI_Industry_Analysis_Report/  # Hermes Agent 每日/每月 AI 行业报告
│   │   ├── daily/                # 日报（中文）
│   │   ├── monthly/              # 月报（中文）
│   │   └── README.md             # 分类入口（article: false）
│   └── wiki/                     # LLM Wiki 知识库层（见下方 Wiki Schema）
│       ├── index.md              # 维基总目录
│       ├── log.md                # append-only 操作日志
│       ├── sources/              # 按博客分类生成的知识域摘要
│       ├── entities/             # 主题/领域聚合页
│       └── concepts/             # 具体知识点深度页
├── .github/workflows/             # GitHub Actions 工作流
│   ├── docs.yml                   # 构建部署 + wiki/briefing 分支自动开 PR
│   └── daily-to-master.yml        # daily → master 守卫合并
├── package.json                   # 项目脚本与依赖
├── pnpm-workspace.yaml            # pnpm 工作区配置
├── .commitlintrc.js               # cz-git + conventional commits 配置（中文交互）
└── AGENTS.md                      # 本文件
```

---

## 构建与开发命令

构建/开发命令通过 `package.json` 中的 scripts 提供，使用 pnpm 执行。环境要求：Node.js >= 22.18（VuePress rc.31 的 engines）、pnpm 12。

```bash
# 安装依赖（CI 使用 pnpm install --frozen-lockfile）
pnpm install

# 本地开发服务器（热重载）
pnpm run docs:dev

# 构建生产站点（输出到 docs/.vuepress/dist/）
pnpm run docs:build
```

**注意**：`package.json` 中 `test` 脚本未配置（`echo "Error: no test specified" && exit 1`）。本项目目前没有自动化测试。

---

## VuePress 配置要点

### 站点基础配置

- `config.ts`：站点标题/描述、`base: '/'`、`locales`（`/` 与 `/en/`），使用 `viteBundler()` 构建
- `theme.ts`：通过 `hopeTheme()` 配置博客、评论、Feed、加密、多语言导航/侧边栏，并从 `.env` 读取加密页密码

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

在 `docs/.vuepress/config.ts` 中通过 `extendsMarkdown` 注册了 `markdown-it-multimd-table`，当前配置为 `headerless: true`、`multibody: true`、`autolabel: true`（支持无表头表格、多行表体、自动表头标签）；`multiline` 与 `rowspan` 处于关闭状态。

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

常用 `category` 值包括：`Computer`、`robot`、`ROS`、`Web`、`VUE`、`Network`、`JavaScript`、`TypeScript`、`basic`、`Skill`、`自动控制原理相关`。

- 目录下的 `README.md` 通常作为该分类的入口页，只写 `article: false`、`title`、`icon`，不写 `category` / `tag`
- `tag` 常见值有 `VUE3`、`VUE2`、`advanced`、`JavaScript`、`COMPARE` 等，用于博客标签页聚合
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
| `wiki/sources/` | 知识域摘要 | 对应博客每个分类的摘要页，由 LLM 阅读对应 `docs/` 源笔记（`learningNote/`、`postMortem/` 等）后生成/更新。每个文件代表一个知识域的整体概览。 |
| `wiki/entities/` | 实体页 | 主题/领域级别的聚合，如 `JavaScript.md`、`ROS2.md`，从 source 页派生，关联多个相关概念。 |
| `wiki/concepts/` | 概念页 | 具体知识点的深度页面，如 `Reduce方法.md`、`坐标变换.md`，通常对应一篇或多篇源笔记核心内容提炼 |

### Wiki 页面 frontmatter

```yaml
---
title: <页面标题>
description: <简短描述，1-2句话>
type: source | entity | concept
tags: [<topic1>, <topic2>]
sources: [<相对 docs/ 的路径>]     # 可选；concept 最常见，部分 source/entity 也有
related:                            # 可选，wikilink
  - "[[../concepts/xxx]]"
  - "[[../entities/xxx]]"
created: <YYYY-MM-DD>               # 可选：首次创建日期
updated: <YYYY-MM-DD>               # 最近一次更新日期，改动内容时同步 bump
---
```

字段说明：`sources` 用相对 `docs/` 的路径（如 `../../learningNote/JSNote/Reduce方法.md`）；`related` 用 wikilink。时间字段**统一用 `created` / `updated`（`YYYY-MM-DD`）**，个别页面还带 `confidence`。

> ⚠️ 不要在 Wiki 页面 frontmatter 里写 `lastUpdated: <日期>`。vuepress-theme-hope 把页面级 `lastUpdated` 定义为**布尔开关**（`true` / `false`，控制是否显示自动更新时间；全局已在 `docs/.vuepress/theme.ts` 里设为 `true`），写日期会让 `vuepress build` 刷出 `lastUpdated in frontMatter should be boolean` 警告。2026-10-25 之前用 `lastUpdated` 记日期的旧页面已全部迁移为 `updated`。

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

### Wiki 变更交付

- Wiki 变更在 `wiki-ingest-YYYY-MM-DD` 分支提交，**一次 push 只包含一个 commit**（PR 标题/正文取自 HEAD commit）
- 推送后由 `docs.yml` 的 `Create_LLM_Relate_Pr` 自动向 `master` 开 PR，不要直接 push `master`
- `briefing-archive-*` 分支只承载 AI 报告归档，PR 会自动 squash 进 `daily`，再由 `daily-to-master.yml` 合并到 `master`

### index.md 格式

```markdown
---
title: JeacsonBlog Wiki
---

# JeacsonBlog Wiki

> 基于 Karpathy LLM Wiki 模式构建的个人知识库。以博客原始笔记为 source of truth，由 LLM Agent 增量维护。
> Last updated: <YYYY-MM-DD>

## Sources（知识域摘要）
- [[./sources/JavaScript.md]] — ...

## Entities（实体/主题）
- [[./entities/JavaScript.md]] — ...

## Concepts（具体概念）
### JavaScript
- [[./concepts/Reduce方法.md]] — ...

## 最近更新
详见 [[./log.md]]
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

1. `docs/` 下除 `docs/wiki/` 外的原始笔记是**只读**的，LLM 永远不修改；只有 `docs/wiki/` 允许增量维护。
2. **Wiki 是增量维护的**。每次 ingest 不要重写整个文件，要做增量更新。
3. **Log 是 append-only 的**。不要删除或修改历史 log 条目。
4. **Ingest 前先读 `docs/wiki/index.md` 和 `docs/wiki/log.md`**，了解 wiki 当前状态。
5. **Wiki 页面要有 inbound links**。创建新 concept 时，检查相关 entity 和 source 是否需要添加 link。
6. 当 `docs/` 有笔记被删除时，**同步清理** wiki 层中 orphaned 的页面或引用。

---

## 部署与内容自动化

内容交付由两个 GitHub Actions 工作流协作完成。

### `.github/workflows/docs.yml`

- **触发**：push 到 `master`、`wiki-ingest-*`、`briefing-archive-*`，或手动 `workflow_dispatch`
- **Build_and_Deploy**（仅 `master` 分支）：
  - 环境：`ubuntu-latest` + Node.js 26 + pnpm 12
  - `actions/checkout@v4`（`fetch-depth: 0`，保留完整 git 历史以支持 "最近更新时间"）
  - `pnpm/action-setup@v6`（v6.1.0 起支持 pnpm 12）→ `setup-node`（`cache: pnpm`）→ `pnpm install --frozen-lockfile`
  - `pnpm docs:build`（`NODE_OPTIONS=--max-old-space-size=4096`，注入 `LOCK_ON_PASSWORD`）
  - 写入自定义域名 `blog.jeacsonsnake.com` 到 `docs/.vuepress/dist/CNAME`，用 `crazy-max/ghaction-github-pages@v5` 推送到 `gh-pages`
- **Create_LLM_Relate_Pr**（`wiki-ingest-*` / `briefing-archive-*`）：
  - 校验分支名格式（`wiki-ingest-YYYY-MM-DD(-suffix)?` / `briefing-archive-...`）
  - 用 HEAD commit 的标题与正文自动开 PR（所以一次 push 只应包含一个 commit）
  - `briefing-archive-*` 的 PR 自动 squash 进 `daily`，随后 dispatch `daily-to-master.yml`

### `.github/workflows/daily-to-master.yml`

- **触发**：`workflow_dispatch` + 每日 `12:17 UTC` 定时兜底
- 使用 GitHub App（`DAILY_MERGE_APP_ID` / `DAILY_MERGE_APP_PRIVATE_KEY`）与 `master-merge` environment
- **守卫**：`daily` 相对 `master` 的变更必须全部位于归档白名单（`docs/Scheduled_Automatic_AI_Industry_Analysis_Report/{daily,monthly}/*.md` 及 `docs/en/` 下同名路径）；越权变更会开 issue 并失败
- 通过后 `git merge --no-ff` 并 push `master`

### 分支模型

- `master`：生产内容，push 触发构建部署
- `daily`：AI 报告归档的集成分支，只接收归档目录变更
- `wiki-ingest-*` / `briefing-archive-*`：LLM 临时工作分支，经 PR 汇入
- `gh-pages`：部署产物分支，由 Action 写入

**Agent 注意事项**：

- 不要手动运行 `git commit` / `git push` / `git rebase` 等操作，除非用户明确要求
- 构建输出目录 `docs/.vuepress/dist/` 与临时目录 `.temp/`、`.cache/` 已被 `.gitignore` 排除
- `daily` 与 `master` 的合并由自动化守卫接管，不要手工把归档以外的改动推到 `daily`

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
- 主题色由 `docs/.vuepress/styles/config.scss` 的 `$theme-color: #778aa9` 定义；`palette.scss` 用于覆盖主题内置调色板，目前为空

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
2. **环境变量**：`.env` 已被 `.gitignore` 忽略、仅存在于本地，提供 `LOCK_ON_PASSWORD`——`theme.ts` 通过 `import "dotenv/config"` 读取，用于 `/complain_diary/lock_on/` 加密页；CI 构建时改用 `secrets.LOCK_ON_PASSWORD` 注入。不要提交 `.env`，也不要在页面中回显密码。
3. **GitHub Actions 凭据**：部署使用 `GITHUB_TOKEN`；`daily-to-master.yml` 使用 GitHub App（`DAILY_MERGE_APP_ID` / `DAILY_MERGE_APP_PRIVATE_KEY`）并受 `master-merge` environment 保护，仓库不需要长期 Personal Access Token。
4. **静态资源**：`docs/.vuepress/public/` 下的所有文件会在构建时原样复制到输出目录，避免放置敏感信息

---

## 故障排查速查

| 现象 | 可能原因 | 解决 |
|------|---------|------|
| 构建时内存溢出 | Vite 处理大量 Markdown 页面 | CI 已配置 `NODE_OPTIONS=--max-old-space-size=4096`；本地可手动设置同样的环境变量 |
| 侧边栏/导航栏不更新 | 配置在 `sidebar/`、`navbar/` 下的 ts（经 `index.ts` 汇总） | 修改对应文件后重新构建 |
| 图片 404 | 路径错误或图片未放入 `public/` 或同级 `assets/` | 检查相对路径或移至 `public/assets/img/` |
| 评论加载失败 | Waline 服务端不可用或域名配置变更 | 检查 `theme.ts` 中的 `serverURL` |
| Feed 生成报错 | 某页面 content 为空或 frontmatter 异常 | 查看构建日志中 `No content:` 提示，补充页面内容或排除页面 |
| 构建报 `Preprocessor dependency "sass-embedded" not found` | 依赖未安装，或运行环境禁止 Vite 派生子进程（受限沙箱常见） | 确认 Node >= 22.18 且已 `pnpm install`；在受限沙箱中需放开进程创建与文件访问 |
| 升级后出现 `unmet peer katex` | `@mdit/plugin-katex-slim` 要求 `^0.18.9`，而 0.19 超出 `@vuepress/plugin-markdown-math` 的 peer 范围 | 保持 `katex@0.18.x`（当前 0.18.11），不要升到 0.19 |
| CI 安装失败或找不到 pnpm | `pnpm/action-setup` 版本过旧，不支持 pnpm 12 | 使用 `pnpm/action-setup@v6`（>= 6.1.0） |

---

*本文件由 AI Agent 根据实际项目内容生成，应与项目实际结构保持同步。若项目配置发生重大变更，请同步更新本文件。*
