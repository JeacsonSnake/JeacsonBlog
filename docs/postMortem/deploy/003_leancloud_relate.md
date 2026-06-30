---
title: 003_使用 leancloud 做数据库，将博客用评论功能 waline 部署到 vercel 服务端时发生的问题
date: 2023-08-25
icon: 'box-archive'
category: deploy
tag:
  - leancloud
  - waline
  - vercel
  - archived
---

参考:[vuepress-plugin-comment2 插件中有关 配置waline的相关文档](https://plugin-comment2.vuejs.press/zh/guide/waline.html)

:::caution
2026-06-29 更新：上述网站已被修改，现在请参考[VuePress 生态系统中有关 配置 waline 的相关文档](https://ecosystem.vuejs.press/zh/plugins/blog/comment/waline/)。（并且由于 leancloud **不再支持** ，内部相关配置已实际进入半弃用状态）
:::

## 1.客户端出现"500 Uninitialized"问题

前提：部署后在评论时一直提示"500 Uninitialized"。
尝试：经文档查找发现可能是需要首先在客户端进行注册，出现管理员账号之后才可以评论。

但是在尝试注册时，依然出现提示"500 Uninitialized"的问题。

解决方案： 排查后发现不知为何之前在vercel配置的有关LeanCloud的环境变量并没有保存。重新配置后点击保存即可。

## 2.无法正常加载评论的问题

::: info
由于写作习惯，这里所有有关域名的网址都做了化名(xxxxx.com)。
:::

前提：在博客尝试拉取评论时发现会出现无法正常加载的问题。具体表现为：

- 多次点击“refresh”按钮，但是无法获取到之前正常评论的信息；
- 在vercel网页版中，查找log却发现并没没有检测到相关的API请求。

解决方案: 参考waline官方GitHub discussion的[相关讨论](https://github.com/walinejs/waline/issues/1318)后得知：

> lizheming commented on Aug 27, 2022
> 群里了解了下，应该是 *.vercel.app 域名被 DNS 污染了，按照楼上说的绑定自定义域名，或者去其它服务上部署解决吧。

因此尝试通过以下人员所提供方案进行修复：

> elkan1788 commented on Sep 19, 2022
> 可以考虑使用免费域名+LeanCloud国际版本的部署方案，但就是速度慢一些，但服务还是正常的使用。
> 方案及效果： [使用自定义域名激活Vercel部署的Waline服务](https://lisenhui.cn/blog/use-custom-domain-active-vercel-waline.html)

我以前在阿里云有注册一个已备案的域名"xxxxx.com"，因此把以前没有用上的域名重新启用。相关配置如下：

### I、在阿里云的相关配置

在[阿里云首页](https://www.aliyun.com/)点击"控制台"，点击"概览/资源概览/云解析DNS/控制台"，在"域名解析"中点击已经添加的域名，会跳转到"解析设置"页面。

- 点击"添加记录"
- 设置"记录类型"为"CNAME"
- 我习惯使用二级域名进行分类管理，因此在"主机记录"中填入"comment"，使解析后域名变为"comment.xxxxx.com"
- "解析请求来源"为"默认"
- "记录值"为"cname.vercel-dns.com"
- "TTL"不变，"10分钟"

点击确认即可。

### II、在vercel的相关配置

在 vercel已经部署好的后端项目上，点击"setting",并作如下操作：

- 点击"Domains"
- 将解析后的域名输入框中，点击"Add"

结束。

### III、在博客源码中的相关配置

参考: [vuepress-theme-hope 指南/功能/评论](https://theme-hope.vuejs.press/zh/guide/feature/comment.html)

打开"docs\ .vuepress\ theme.ts" 或者类似的主题配置的源码，将这里替换为上面解析后的域名：

```typescript
...
    plugins: {
        ...
        comment: {
            provider: "Waline",

            // waline 模式下
            serverURL: "https://comment.xxxxx.com/", // your serverURL 👈将这里替换为上面解析后的域名
        },
        ...
    }
```

结束。
