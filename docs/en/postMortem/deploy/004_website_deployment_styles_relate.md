---
title: 004_CSS/JS styles not loading when deploying the site
date: 2023-09-06
icon: 'box-archive'
category: deploy
tag:
  - domain
  - Github Action
---

## Prerequisite

After deploying this blog, I tried deploying another project on GITHUB Pages, [Bobing · Zhuangyuan Chou](https://github.com/JeacsonSnake/bobing-jettonman-ALLinONE). Once it was up, the CSS/JS styles would not load, and opening the dev tools showed every request for that kind of file coming back 404.

## The solution

Because the URL that project is deployed at has an access path like a `baseURL`, all the `CSS`/`JS` styles sit under `baseURL/css` or `baseURL/js`, so you have to configure it: set the base path of those static assets on the server to **"\baseURL\"** for them to be read correctly

::: tip The details
That project uses VUE2 as its architecture, so assuming it is deployed on a server at the domain `https://www.example.com/my-app/`, you can set publicPath to `/my-app/` in the project's **vue.config.js** so the static assets are accessed at the right path.

Example code:

```javascript
    // vue.config.js
    module.exports = {
        publicPath: '/my-app/'
    }
```

Note that the publicPath option only works for projects bundled through Vue CLI.

:::

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../postMortem/deploy/004_website_deployment_styles_relate.md. The translation is for reference only.
Translation time: 2026-11-05
:::
