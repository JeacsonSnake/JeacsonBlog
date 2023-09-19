---
title: 部署
icon: 'box-archive'
---

## 简述

一些在部署静态页面时踩坑后的总结向文章。

## 一、使用 Github Actions 将静态资源网页部署到Github Pages

### 1. 关于 GITHUB_TOKEN 权限

前提: 在创建 .github/workflow/docs.yml 文件之后针对内部配置进行了相关修订。

出现问题: 在使用 Github Actions 后 workflow 出现以下报错:

![GitHubActionFatalNO1](./assets/img/GitHubActionFatalNO1.jpg)

原因: workflow 在部署代码到 gh-pages 分支时需要对默认的 secrets.GITHUB_TOKEN 进行读写操作，但是仓库默认没有给予相关权限。

解决方法: 配置默认 GITHUB_TOKEN 权限。

以下引用自官方文档^[ [为存储库设置 GITHUB_TOKEN 的权限 - GitHub 文档](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#setting-the-permissions-of-the-github_token-for-your-repository) ]

> 默认情况下，当你在个人帐户中创建新存储库时，GITHUB_TOKEN 仅对 contents 和 packages 范围具有读取权限。 如果在组织中创建新存储库，则设置继承自组织设置中配置的内容。
>
> 在 GitHub.com 上，导航到存储库的主页。
>
> 在存储库名称下，单击 “设置”。 如果看不到“设置”选项卡，请选择  下拉菜单，然后单击“设置” 。
>
> 存储库标头的屏幕截图，其中显示了选项卡。 “设置”选项卡以深橙色边框突出显示。
>
> 在左侧边栏中，单击 “操作”，然后单击“常规” 。
>
> 在“工作流权限”下，选择是要让 GITHUB_TOKEN 对所有范围具有读写访问权限（允许设置），还是仅对 contents 和 packages 范围具有读取访问权限（受限设置）。
>
> 单击“保存”以应用设置。

### 2. 关于 Github Pages 源路径切换

前提: 经过上述操作后, Github Actions 成功运行。

出现问题: 即使声称已经成功对该网页进行部署，但是实际上并没有在指定的域名下找到对应的网页。

原因: 在使用该 workflow 进行项目打包后, 需要将 Github Pages 源路径切换至被打包的文件所在路径才可以获取到对应信息。

解决方法:

- 首先将项目自身setting中 Code and automation 下的 Pages>Build and deployment选项，修改Source为" Deploy from a branch"

- 然后将路径进行修改，如下图红圈:

![GitHubPagesSourcePath](./assets/img/GitHubPagesSourcePath.jpg)

## 二、使用 leancloud做数据库，将博客用评论功能 waline 部署到 vercel 服务端时发生的问题

参考:[vuepress-plugin-comment2 插件中有关 配置waline的相关文档](https://plugin-comment2.vuejs.press/zh/guide/waline.html)

### 1.客户端出现"500 Uninitialized"问题

前提：部署后在评论时一直提示"500 Uninitialized"。
尝试：经文档查找发现可能是需要首先在客户端进行注册，出现管理员账号之后才可以评论。

但是在尝试注册时，依然出现提示"500 Uninitialized"的问题。

解决方案： 排查后发现不知为何之前在vercel配置的有关LeanCloud的环境变量并没有保存。重新配置后点击保存即可。

### 2.无法正常加载评论的问题

:::info
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

#### I、在阿里云的相关配置

在[阿里云首页](https://www.aliyun.com/)点击"控制台"，点击"概览/资源概览/云解析DNS/控制台"，在"域名解析"中点击已经添加的域名，会跳转到"解析设置"页面。

- 点击"添加记录"
- 设置"记录类型"为"CNAME"
- 我习惯使用二级域名进行分类管理，因此在"主机记录"中填入"comment"，使解析后域名变为"comment.xxxxx.com"
- "解析请求来源"为"默认"
- "记录值"为"cname.vercel-dns.com"
- "TTL"不变，"10分钟"

点击确认即可。

#### II、在vercel的相关配置

在 vercel已经部署好的后端项目上，点击"setting",并作如下操作：

- 点击"Domains"
- 将解析后的域名输入框中，点击"Add"

结束。

#### III、在博客源码中的相关配置

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

## 三、博客自定义域名所带来的问题

(waiting for upload)
