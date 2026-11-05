---
title: 002_The trouble a custom domain brought to the blog
date: 2023-08-24
icon: 'box-archive'
category: deploy
tag:
  - domain
  - Github Action
---

## Prerequisite

A while back I bought a domain on Alibaba Cloud and never used it, so I tried moving this blog's domain from the old `github.io` over to this one. As mentioned before, the blog uses `vuepress` as its framework and relies on a `Github Action workflow` to bundle the source and deploy it to `Github Pages` automatically.

## The attempt

In the Alibaba Cloud console I tried fiddling with the settings under "Workbench/Overview/Resource Overview/DNS Resolution". But the operations got too tangled, the domain ended up with DNS poisoning, and it would no longer resolve properly.

## The solution

After resetting what I had done, I went at it like this:

::: info Related definitions
Here the original address is defined as: "youraccount.github.io/blog/",

and the custom domain I want to add is set as: "blog.yourdomain.com"
:::

1. Open Alibaba Cloud's "Workbench/Overview/Resource Overview/DNS Resolution/Domain Resolution", click the domain you need resolved and go into "Resolution Settings".

2. Click add record and configure it as follows:

    ```JSON
    Record type: "CNAME",
    Host record: [blog]".yourdomain.com",
    Resolution request source: "default"
    Record value: [the original domain, e.g. youraccount.github.io]
    TTL: "10 minutes"
    ```

    Then save. Wait a bit (half a minute or so) and try the "check propagation" button on the row you just added; if it resolves to the address you added, move on to the next step.

3. If the previous deployment location was "youraccount.github.io/blog/" rather than "youraccount.github.io", check whether you ever changed the base value of the bundled blog source. The default key/value pair is: "base: '/'". ←This one matters a lot, because without the change the css/js/images and other relative-path dependencies of the bundled blog source fail to load. After changing it, PUSH first, then go on to the next step.

4. Edit the `Github Action workflow` config file, in this case `docs.yml` under `.github\workflows`. After the statements about **running the build script**, add the following:

    ```yml
      # write the custom domain
      - name: Configure custom domain
        run: echo blog.yourdomain.com >> docs/.vuepress/dist/CNAME
    ```

    That way the CNAME file gets generated automatically after every bundle, which matters quite a bit for mapping a custom domain. PUSH once you are done, wait for the `Github Action workflow` to deploy again and go on to the next step.

5. On the repo's `Github Pages` options on github, put the custom domain into the Custom Domain input box and click save. Wait a while.

6. Done! Now you can reach your blog through the custom domain. 🎉

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../postMortem/deploy/002_custom_domain_configuration.md). The translation is for reference only.
Translation time: 2026-11-05
:::
