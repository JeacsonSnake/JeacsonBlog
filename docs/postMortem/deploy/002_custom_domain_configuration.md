---
title: 002_博客自定义域名所带来的问题
date: 2023-08-24
icon: 'box-archive'
category: deploy
tag:
  - domain
  - Github Action
---

## 前提

之前在阿里云买了一个域名一直没有用，于是尝试将这个博客的域名从原来的`github.io`转到现在这个域名。如同之前所说，这个博客使用了`vuepress`作为框架，并通过 `Github Action workflow` 将这个博客的源代码进行自动的打包、部署在 `Github Pages` 上。

## 尝试

在阿里云的工作台下，尝试通过“工作台/概览/资源概览/云解析DNS”中的相关设置进行调整。但是因为操作过于混杂，导致该域名出现了DNS被污染，导致无法正常导航的问题。

## 解决方案

将原先操作重置后，以如下方法进行：

::: info 相关定义
这里将原网址定义为：“youraccount.github.io/blog/”,

希望添加的自定义域名设置为：“blog.yourdomain.com”
:::

1. 打开阿里云“工作台/概览/资源概览/云解析DNS/域名解析”，点击需要解析的域名，进入“解析设置”.

2. 点击添加记录，以如下设定进行配置：

    ```JSON
    记录类型: "CNAME",
    主机记录: [blog]".yourdomain.com",
    解析请求来源: "默认"
    记录值: [原来的域名。例如 youraccount.github.io]
    TTL: "10分钟"
    ```

    并保存。等待一段时间（半分钟左右）尝试点击刚添加的栏目条的“生效检测”，如果可以正常解析到你添加的网址，则进入下一步。

3. 如果之前的部署位置是“youraccount.github.io/blog/”而不是“youraccount.github.io”，则查看下之前有没有修改该博客源代码打包后的base值，默认的键值对为："base: '/'"。←这个十分重要，因为如果没有修改，博客源代码在打包之后会出现css/js/图片等依赖相对路径的文件加载不出来的问题。修改后先PUSH，再进入下一步。

4. 修改`Github Action workflow`的设定文件，例如在本案例中 `.github\workflows` 下的 `docs.yml`。在有关**运行构建脚本**的相关语句后添加以下句式：

    ```yml
      # 写入自定义域名
      - name: Configure custom domain
        run: echo blog.yourdomain.com >> docs/.vuepress/dist/CNAME
    ```

    这样就使得每次打包后都可以自动生成CNAME文件，这对自定义域名的映射较为重要。修改完毕后PUSH，等待修改后`Github Action workflow`自动部署后进入下一步。

5. 将github页面上对应仓库的`Github Pages`选项内有关Custom Domain的输入框中填入自定义的域名，并点击保存。等待一段时间。

6. 结束！这样就可以使用自定义的域名进入自己的博客了。🎉
