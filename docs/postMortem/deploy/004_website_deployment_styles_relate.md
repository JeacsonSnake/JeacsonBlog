---
title: 004_部署网站时，加载不出CSS/JS相关样式的问题
date: 2023-09-06
icon: 'box-archive'
category: deploy
tag:
  - domain
  - Github Action
---

## 前提

在部署该博客后，又尝试在GITHUB Pages 上部署了另一个项目[博饼·状元筹](https://github.com/JeacsonSnake/bobing-jettonman-ALLinONE)。结果部署上去之后，发现加载不出CSS/JS相关样式，开启开发者工具后发现针对该类文件的请求全部404

## 解决方案

因为该项目部署时所在的网址是有类似于 `baseURL` 的访问路径，因此所有 `CSS`/`JS` 相关样式都在 `baseURL/css` 或者 `baseURL/js` 下，因此需要进行设置，将该类静态资源文件在服务器上的基本路径设置为 **"\baseURL\"** 才能够实现正确的读取

::: tip 具体方法
该项目是使用VUE2作为项目架构的，因此假设项目部署在域名为 `https://www.example.com/my-app/` 的服务器上，那么可以在项目的 **vue.config.js** 中将publicPath设置为 `/my-app/` ，以确保静态资源的访问路径正确。

示例代码如下：

```javascript
    // vue.config.js
    module.exports = {
        publicPath: '/my-app/'
    }
```

需要注意的是，publicPath选项只对通过Vue CLI进行打包构建的项目有效。

:::
