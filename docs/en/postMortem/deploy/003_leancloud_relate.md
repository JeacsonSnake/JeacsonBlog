---
title: 003_Using leancloud as the database, and the trouble deploying the blog's waline comments to vercel
date: 2023-08-25
icon: 'box-archive'
category: deploy
tag:
  - leancloud
  - waline
  - vercel
  - archived
---

Reference: [the docs on configuring waline in the vuepress-plugin-comment2 plugin](https://plugin-comment2.vuejs.press/zh/guide/waline.html)

:::caution
2026-06-29 update: the site above has changed; please refer to [the docs on configuring waline in the VuePress ecosystem](https://ecosystem.vuejs.press/zh/plugins/blog/comment/waline/) instead. (And since leancloud is **no longer supported**, the related configuration inside is in practice half-deprecated by now.)
:::

## 1. The client shows "500 Uninitialized"

Prerequisite: after deploying, commenting keeps showing "500 Uninitialized".
The attempt: going through the docs, it looked like I first had to register on the client side, and only once an admin account existed could anyone comment.

But when I tried to register, "500 Uninitialized" still popped up.

The fix: after digging around I found that the LeanCloud-related environment variables I had configured in vercel earlier had somehow not been saved. Reconfiguring them and clicking save did it.

## 2. Comments won't load properly

::: info
Out of writing habit, every domain-related URL here is aliased (xxxxx.com).
:::

Prerequisite: when the blog tried to pull comments, they would not load. Concretely:

- clicking the "refresh" button over and over got nothing back, not even the comments that had worked before;
- in the vercel web console the logs showed no API request at all being received.

The fix: after reading [this discussion](https://github.com/walinejs/waline/issues/1318) in waline's official GitHub discussions I learned:

> lizheming commented on Aug 27, 2022
> asked around in the group, looks like the *.vercel.app domain got DNS-poisoned; bind a custom domain as the person above said, or deploy it on some other service.

So I tried fixing it with the approach these people suggested:

> elkan1788 commented on Sep 19, 2022
> you could go with a free domain plus the international version of LeanCloud, it is a bit slower, but the service is still usable.
> The approach and its results: [Using a custom domain to activate a Waline service deployed on Vercel](https://lisenhui.cn/blog/use-custom-domain-active-vercel-waline.html)

I had registered a domain "xxxxx.com" on Alibaba Cloud a while back and had it ICP-filed, so I put that unused domain to work. The configuration:

### I. The Alibaba Cloud side

On the [Alibaba Cloud homepage](https://www.aliyun.com/) click "Console", then "Overview/Resource Overview/DNS Resolution/Console", and in "Domain Resolution" click the domain you already added, which jumps to the "Resolution Settings" page.

- Click "Add Record"
- Set "Record Type" to "CNAME"
- I like subdomains for keeping things organised, so I put "comment" into "Host Record", making the resolved domain "comment.xxxxx.com"
- "Resolution Request Source" is "default"
- "Record Value" is "cname.vercel-dns.com"
- "TTL" unchanged, "10 minutes"

Click confirm and that is that.

### II. The vercel side

On the backend project already deployed on vercel, click "setting" and do this:

- Click "Domains"
- Type the resolved domain into the input box and click "Add"

Done.

### III. The blog source side

Reference: [vuepress-theme-hope guide/features/comments](https://theme-hope.vuejs.press/zh/guide/feature/comment.html)

Open "docs\ .vuepress\ theme.ts" or whatever the theme config source is in your project, and replace the domain here with the one that resolved above:

```typescript
...
    plugins: {
        ...
        comment: {
            provider: "Waline",

            // in waline mode
            serverURL: "https://comment.xxxxx.com/", // your serverURL 👈replace this with the domain that resolved above
        },
        ...
    }
```

Done.

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../postMortem/deploy/003_leancloud_relate.md. The translation is for reference only.
Translation time: 2026-11-05
:::
