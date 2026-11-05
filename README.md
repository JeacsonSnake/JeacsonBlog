# JeacsonBlog

这里是我的个人博客页面源码，第一次使用vuepress，有任何与该项目相关的问题请联系我进行讨论。
网址: [主页 | JeacsonBlog](https://blog.jeacsonsnake.com/)

## 使用相关技术

- vuepress + vite
- 使用主题为 Vuepress Theme Hope
- GitHub Pages 挂载
- Github Action 自动部署
- Cloudflare 作相关DNS代理，以裸连网站

## 博客更新时间&内容

不定时，更新内容包括但不限于：前后端相关\计算机网络相关\嵌入式相关\机器人相关\自己发的小牢骚\甚至各种自己感兴趣但用处不是很大的的边角料知识

**2026-04 新增：** 尝试基于 Andrej Karpathy's LLM Wiki 进行博客 Wiki 搭建。之后使用 Hermes Agent 进行每日 Wiki ingest，以实现自建 AI-integrated 知识库。

## License / 许可

本仓库的**代码**与**内容**分开授权：

- **代码**（`docs/.vuepress/` 下的配置与样式、`.github/` 工作流、`package.json`、锁文件及其他构建脚本）：
  采用 **MIT**，全文见 [LICENSE](./LICENSE)。
  **`LICENSE` 中的 MIT 仅适用于上述源码，不适用于博客文档内容**；该 MIT 文本中提到的
  “associated documentation files” 指软件自身的文档（如代码注释），不含本站内容。
- **内容**（`docs/**` 下的全部文章、笔记、Wiki、日报/月报、其中的图片及其 `/en/` 译文）：
  采用 **CC BY-SA 4.0**，完整法律文本与适用范围见 [LICENSE-content](./LICENSE-content)。
- **文中的原创代码片段**：另按 **MIT** 提供，可单独按 MIT 取用；来自第三方的片段除外。
- **第三方内容**（转载文章、课程/教材截图、引用段落等）：版权归原作者，**不在上述授权范围内**，
  清单见 [NOTICE](./NOTICE)，受影响页面顶部另有说明。

转载或引用本站内容时，建议署名格式：

```text
"JeacsonBlog" by Jeacson She, licensed under CC BY-SA 4.0. Source: <页面 URL>
```

---

This repository licenses **code** and **content** separately:

- **Code** (VuePress config and styles under `docs/.vuepress/`, workflows under `.github/`,
  `package.json`, lockfile and other build scripts): **MIT**, see [LICENSE](./LICENSE).
  The MIT license in `LICENSE` applies to the source code only, not to the blog content;
  the "associated documentation files" mentioned in the MIT text means documentation of the
  software itself (e.g. code comments), not the content of this site.
- **Content** (everything under `docs/**` — posts, notes, wiki pages, daily/monthly reports,
  their images and the `/en/` translations): **CC BY-SA 4.0**, full legal text and scope in
  [LICENSE-content](./LICENSE-content).
- **Code snippets authored by the maintainer and embedded in the content**: additionally
  available under **MIT**, unless they come from a third-party source.
- **Third-party material** (reposted articles, course/textbook screenshots, quoted passages):
  remains the property of its respective owners and is **not** covered by the above licenses;
  see [NOTICE](./NOTICE) and the notice at the top of the affected pages.
