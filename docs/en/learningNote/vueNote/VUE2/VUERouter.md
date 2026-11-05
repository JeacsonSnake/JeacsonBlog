---
title: VUERouter
icon: 'server'
date: 2022-05-19
category:
- VUE
- Web
tag:
- VUE2
- Router
---

## Overview

These are the notes I produced back when I was learning vue-router. They've now been completely tidied up from the image version into an electronic format you can read.

## 0. A quick intro

### 0.1 What is routing?

Routing is a set of key-value mapping relationships; you can think of it as key-value pairs.

### 0.2 What is a router?

A router is the thing that manages several routes.

### 0.3 Why use a router?

To get an "SPA app" => features: **the page doesn't refresh, components come out separately**

### 0.4 What is "VUERouter" ?

The core plugin for managing component routes; you can install it with a package manager.

Taking pnpm as an example: `pnpm i vue-router@3 -D`

::: tip

How component routes map:

- path - component (e.g. './foo', foo ) → front-end routing

- path - function [e.g. '/func', func()] → back-end routing

:::

## 1. Basic routing

::: tip

     Here we assume src has several folders such as conponents and Pages, and that Pages has two files, About.vue and Home.vue

:::

Under the src folder, create a new router folder, and create the entry file index.js inside it

```javascript
// in index.js
// import vueRouter
import VueRouter from 'vue-router'

// import route components
import About from '../pages/About'
import Home from '../pages/Home'

// create a new router & export it as default
export default new VueRouter({
    routers:[
        {
            path: '/about',
            component: About
        },
        {
            path: '/home',
            component: Home   
        }
    ]
})
```

Then in **App.vue**:

```vue
<template>
    <div>

        <div class = 'navbar'>
            // switch routes with the router
            <router-link class = 'about' active-class = 'active' to = '/about'>About</router-link>
            <router-link class = 'home' active-class = 'active' to = '/home'>Home</router-link>
        </div>

        <div class = 'display'>
            // declare where the component is displayed
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

::: tip

1. About and Home here are called "route components", and they're usually put in a Pages folder **on the same level as** conponents;

2. For performance, once a route component is switched away from it's usually **destroyed outright** (unless you configure it specially);

3. Every component has its own route property, which holds that component's own routing info. But the whole app **has one and only one** router, which you can get through this component's *$router* property.

:::

## 2. Nested routes (multi-level routing)

::: tip

    Here we likewise assume src has several folders such as conponents and Pages, and that Pages has four files: About.vue, Home.vue, News.vue, Message.vue

:::

Under the src folder, create a new router folder, and create the entry file index.js inside it

```javascript
// in index.js
// import vueRouter
import VueRouter from 'vue-router'

// import route components
import About from '../pages/About'
import Home from '../pages/Home'
import News from '../pages/News'
import Message from '../pages/Message'

// create a new router & export it as default
export default new VueRouter({
    routers:[
        {
            path: '/about',
            component: About
        },
        {
            path: '/home',
            component: Home,
            // use the children property to nest the other two route components as second-level routes
            children: [
                {    
                    path: '/news',
                    component: News
                },
                {
                    path: '/message',
                    component: Message 
                }
            ]
        }
    ]
})
```

Then in **Home.vue**:

```vue
<template>
    <div>
        <h2>Here is home component</h2>
        <div class = 'navbar'>
            // switch routes with the router
            <router-link class = 'news' active-class = 'active' to = '/home/news'>News</router-link>
            <router-link class = 'message' active-class = 'active' to = '/home/message'>Message</router-link>
        </div>

        <div class = 'display'>
            // declare where the component is displayed
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

## 3. Passing params through routes (query params)

Use the to parameter to pass params to the tag you're jumping to.

::: tip

    Here we likewise assume src has several folders such as conponents and Pages, and that Pages has five files: About.vue, Home.vue, News.vue, Message.vue, Detail.vue. And we need to pass params to Detail.

:::

Under the src folder, create a new router folder, and create the entry file index.js inside it

```javascript
// in index.js
// import vueRouter
import VueRouter from 'vue-router'

// import route components
import About from '../pages/About'
import Home from '../pages/Home'
import News from '../pages/News'
import Message from '../pages/Message'
import Detail from '../pages/Detail'

// create a new router & export it as default
export default new VueRouter({
    routers:[
        {
            path: '/about',
            component: About
        },
        {
            path: '/home',
            component: Home,
            children: [
                {    
                    path: '/news',
                    component: News
                },
                {
                    path: '/message',
                    component: Message,
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        path: 'detail',
                        component: Detail
                    ]
                }
            ]
        }
    ]
})
```

Suppose the template tag of **Detail.vue** is:

```vue
<template>
    <div>
        <h2>Here is Deail component</h2>
        <div class = 'displayul'>
            <ul>
                <li> code: {{$route.query.id}} </li>
                <li> title: {{$route.query.title}} </li>
            </ul>
        </div>

    </div>
</template>

...
```

This file wants to read the passed params through $route, so in **Message.vue** you can define the params passed to to in two ways:

1. The string form

    ```vue
    <template>
        <div>
            <h2>Here is Message component</h2>
            <div class = 'navbar'>
                <ul>
                    <li v-for = 'm in messagelist' :key="m.id">
                        // switch routes with the router
                        <router-link class = 'detail' active-class = 'active' to ="`/home/message/detail?id:${m.id}&title=${m.title}`">{{m.title}}</router-link>
                    </li>
                </ul>
            </div>

            <div class = 'display'>
                // declare where the component is displayed
                <router-view></router-view>
            </div>

        </div>
    </template>

    ...

    <script>
        export default {
            name: 'Message',
            data(){
                return {
                    messagelist:[
                        {id:'001', title:'message 001'},
                        {id:'002', title:'message 002'},
                        {id:'003', title:'message 003'},
                    ]
                }
            }
        }

    </script>
    ```

2. The object form (**generally the recommended** one)

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // switch routes with the router
                    <router-link 
                        class = 'detail' 
                        active-class = 'active' 
                        to ="{
                                path:'/home/message/detail',
                                query:{
                                    id:m.id,
                                    title:m.title
                        }`"
                    >
                        {{m.title}}
                    </router-link>
                </li>
            </ul>
        </div>

        <div class = 'display'>
            // declare where the component is displayed
            <router-view></router-view>
        </div>

    </div>
</template>

...


<script>
    export default {
        name: 'Message',
        data(){
            return {
                messagelist:[
                    {id:'001', title:'message 001'},
                    {id:'002', title:'message 002'},
                    {id:'003', title:'message 003'},
                ]
            }
        }
    }

</script>
```

## 4. Named routes

To make route jumps simpler, we can give them names.

For example, in the case above (3. Passing params through routes), we can change this in index.js:

```javascript
...

                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        path: 'detail',
                        component: Detail
                   ]
...
```

into this:

```javascript
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        name: 'detail', // new
                        path: 'detail',
                        component: Detail
                    ]
```

Then in the component that references it, you can use `name: 'detail'` in place of `path: '/home/message/detail'` to simplify the path jump.

## 5. Passing params through routes (param params)

Use the to parameter to pass params to the tag you're jumping to.

::: tip

    Here we likewise assume src has several folders such as conponents and Pages, and that Pages has five files: About.vue, Home.vue, News.vue, Message.vue, Detail.vue. And we need to pass **params** to Detail.

:::

Under the src folder, create a new router folder, and create the entry file index.js inside it

```javascript
// in index.js
// import vueRouter
import VueRouter from 'vue-router'

// import route components
import About from '../pages/About'
import Home from '../pages/Home'
import News from '../pages/News'
import Message from '../pages/Message'
import Detail from '../pages/Detail'

// create a new router & export it as default
export default new VueRouter({
    routers:[
        {
            path: '/about',
            component: About
        },
        {
            path: '/home',
            component: Home,
            children: [
                {    
                    path: '/news',
                    component: News
                },
                {
                    path: '/message',
                    component: Message,
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        name: "detail", // it must be named for this to work
                        path: 'detail/:id/:title', // you have to configure params by hand
                        component: Detail
                    ]
                }
            ]
        }
    ]
})
```

Suppose the template tag of **Detail.vue** is:

```vue
<template>
    <div>
        <h2>Here is Deail component</h2>
        <div class = 'displayul'>
            <ul>
                <li> code: {{$route.param.id}} </li>
                <li> title: {{$route.param.title}} </li>
            </ul>
        </div>

    </div>
</template>

...
```

This file wants to read the passed params through $route, so in **Message.vue** you can define the params passed to to in two ways:

1. The string form

    ```vue
    <template>
        <div>
            <h2>Here is Message component</h2>
            <div class = 'navbar'>
                <ul>
                    <li v-for = 'm in messagelist' :key="m.id">
                        // switch routes with the router
                        <router-link class = 'detail' active-class = 'active' to ="`/home/message/detail/${m.id}/${m.title}`">{{m.title}}</router-link>
                    </li>
                </ul>
            </div>

            <div class = 'display'>
                // declare where the component is displayed
                <router-view></router-view>
            </div>

        </div>
    </template>

    ...

    <script>
        export default {
            name: 'Message',
            data(){
                return {
                    messagelist:[
                        {id:'001', title:'message 001'},
                        {id:'002', title:'message 002'},
                        {id:'003', title:'message 003'},
                    ]
                }
            }
        }

    </script>
    ```

2. The object form (**generally the recommended** one)

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // switch routes with the router
                    <router-link 
                        class = 'detail' 
                        active-class = 'active' 
                        to ="{
                                name:'detail', // here you can only use the name property, not path
                                query:{
                                    id:m.id,
                                    title:m.title
                        }`"
                    >
                        {{m.title}}
                    </router-link>
                </li>
            </ul>
        </div>

        <div class = 'display'>
            // declare where the component is displayed
            <router-view></router-view>
        </div>

    </div>
</template>

...


<script>
    export default {
        name: 'Message',
        data(){
            return {
                messagelist:[
                    {id:'001', title:'message 001'},
                    {id:'002', title:'message 002'},
                    {id:'003', title:'message 003'},
                ]
            }
        }
    }

</script>
```

## 6. Configuring props on a route

This config lets a route component receive params more conveniently.

::: tip

    Here we likewise assume src has several folders such as conponents and Pages, and that Pages has five files: About.vue, Home.vue, News.vue, Message.vue, Detail.vue. And we need to pass **params** to Detail.

:::

Under the src folder, create a new router folder, and create the entry file index.js inside it

Then there are three ways to configure props:

### 6.1 The object form

```javascript
// config identical to before is not repeated here
...
export default new VueRouter({
    routers:[
        ...
        {
            path: '/home',
            component: Home,
            children: [
                ...
                {
                    path: '/message',
                    component: Message,
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        name: "detail", // it must be named for this to work
                        path: 'detail/:id/:title', // you have to configure params by hand
                        component: Detail，
                        // pass an object as the value of the props property
                        props:{
                            a:1,
                            b: "Hello",
                            c: true
                        }
                    ]
                }
            ]
        }
    ]
})
```

### 6.2 The boolean form

When props is given a boolean and it's true, **all the params** received by that route component are passed to the component as **props**.

```javascript
// config identical to before is not repeated here
...
export default new VueRouter({
    routers:[
        ...
        {
            path: '/home',
            component: Home,
            children: [
                ...
                {
                    path: '/message',
                    component: Message,
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        name: "detail", // it must be named for this to work
                        path: 'detail/:id/:title', // you have to configure params by hand
                        component: Detail，
                        // set the props property to the boolean value true
                        props:true
                    ]
                }
            ]
        }
    ]
})
```

### 6.3 The function form (widely used)

```javascript
// config identical to before is not repeated here
...
export default new VueRouter({
    routers:[
        ...
        {
            path: '/home',
            component: Home,
            children: [
                ...
                {
                    path: '/message',
                    component: Message,
                    // use the children property to nest the remaining route component as a third-level route
                    children: [
                        name: "detail", // it must be named for this to work
                        path: 'detail/:id/:title', // you have to configure params by hand
                        component: Detail，
                        // use the props property as a function, with $route as its argument
                        props($route){
                            a:1,
                            b: "Hello",
                            c: true
                        }
                    ]
                }
            ]
        }
    ]
})
```

Once the props config is in place, the old `$route.param` in the template tag of **Detail.vue** can be left out:

```vue
<template>
    <div>
        <h2>Here is Deail component</h2>
        <div class = 'displayul'>
            <ul>
                <li> code: {{id}} </li>
                <li> title: {{title}} </li>
            </ul>
        </div>

    </div>
</template>
```

But in its script tag:

```vue
<script>
export default {
        name: 'Message',
        props: ['id','title'] // you need to add the props property
    }

</script>
```

## 7. The router's replace attribute

::: tip

Known: when a website in the browser stores its history, it generally uses two ways of writing to it:

1. PUSH mode
   When the user browses a new web page (component), the page address is PUSHed onto the storage stack. This means the user **can** use the browser's "forward" and "back" to jump between pages.

2. REPLACE mode
   When the user browses a new web page (component), the old page address is directly REPLACEd with the new one. This means the user **cannot** use the browser's "forward" and "back" to jump between pages.

:::

The default jump mode for route components is PUSH. But under the router-link tag you can use the replace attribute to jump straight to the component in REPLACE mode. For example:

`<router-link replace class = "..." to = "...">... </router-link>`

## 8. Programmatic route navigation

If we don't use the to attribute to jump between route components, or when we want to use `@click` and the like to jump routes, we can use `$route.push` or `$router.replace` to do programmatic route navigation.

::: tip

    Here we likewise assume src has several folders such as conponents and Pages, and that Pages has five files: About.vue, Home.vue, News.vue, Message.vue, Detail.vue. And we need to pass **query** params to Detail.

:::

For example, when the template tag inside **message.vue** is changed to jump with a button:

```vue
<-- message.vue !-->
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // switch routes with the router, but to has been deleted
                    <router-link 
                        class = 'detail' 
                        active-class = 'active' 
                    >
                        {{m.title}}
                    </router-link>
                    <button > click to go </button>
                </li>

            </ul>
        </div>

        <div class = 'display'>
            // declare where the component is displayed
            <router-view></router-view>
        </div>

    </div>
</template>
```

Then you can jump with the following methods:

```vue
<-- message.vue !-->
<script>
    export default {
        name: 'Message',
        data(){
            ...
        },
        methods:{
        // 1. the push method
            pushShow(m){
                this.$router.push({
                    name:'detail',
                    query:{
                    id:m.id,
                        title:m.title
                    }
                })
            }，
        // 2. the replace method
            replaceShow(m){
                this.$router.replace({
                    name:'detail',
                    query:{
                    id:m.id,
                        title:m.title
                    }
                })
            }
        }
    }

</script>
```

You just use `@click = "pushShow(m)"` or `@click = "replaceShow(m)"` in the `<button>` tag

::: tip

If you compare them, you may notice that the config inside these two functions is the same as the config under the to tag.

:::

## 9. Caching route components

To keep a route component that isn't displayed still mounted instead of destroyed, we can cache that route component.

::: tip

Here we likewise assume src has several folders such as conponents and Pages, and that Pages has five files: About.vue, Home.vue, News.vue, Message.vue, Detail.vue.

:::

Suppose we want News.vue to stay mounted and not be destroyed. Then in Home.vue, the parent file that displays it, we can use the `<keep-alive>` tag

```vue
<template>
    <div>
        <h2>Here is home component</h2>
        <div class = 'navbar'>
            // switch routes with the router
            <router-link class = 'news' active-class = 'active' to = '/home/news'>News</router-link>
            <router-link class = 'message' active-class = 'active' to = '/home/message'>Message</router-link>
        </div>

        <div class = 'display'>
            // add a keep-alive tag where the component is declared to be displayed, and mark which tag names it includes
            <keep-alive include=“News”>
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

::: tip

1. If you want to include several, you can use `:include = "["nameA", "nameB"]"` to include them.

2. If you want to cache all of them, just use the tag on its own; you don't need to add the include attribute

:::

## 10. Lifecycle hooks unique to route components

Route components have two lifecycle hooks of their own, namely:

1. activated()

2. deactivated()

The activated() function is used when the route component is activated, and when the route component goes back to an inactive state, the deactivated() function is called.

They're usually used together with timers: use activated() to start the timer when the route component is activated, and call deactivated() to clear the timer when the route component goes back to an inactive state.

## 11. Route guards

When we want users to only get into certain pages after doing something permission-related — for example, only getting into a detail page after logging in — we can use route guards to check permissions and protect the safety of our routes.

vuerouter has built-in functions for this, which can be called before or after a route change.

There are three ways to set up route guards:

### 11.1 Global guards

You can configure guards globally.

In index.js:

```javascript
...
// create a new router 
const router = new VueRouter({
    routes:[
        // the related route config
    ]
})

// 1. global before guard: use the beforeEach method after the router is created
router.beforeEach((to, from, next) => {
    // do a condition check (assume we need to verify when the meta.isAuth variable of the route component we're going to is true)
    if (to.meta.isAuth) {
        if (match some condition){
            next()
        } else {
            console.log('Does not match! Will not go to that page!')
        }
    } else {
        next()
    }
})

// 2. global after guard: use the afterEach method after the router is created
router.afterEach((to, from, next) => {
    // do a condition check (assume we need to verify when the meta.isAuth variable of the route component we're going to is true)
    if (to.meta.isAuth) {
        if (match some condition){
            next()
        } else {
            console.log('Does not match! Will not go to that page!')
        }
    } else {
        next()
    }
})


export default router
```

### 11.2 Exclusive guards

You can configure a guard that belongs to one component alone.

In index.js:

```javascript
...
// create a new router 
const router = new VueRouter({
    routes:[
        // the related route config
        path: 'xxx',
        component: xxx,
        // use beforeEnter to configure an exclusive guard
        beforeEnter((to, from, next) => {
            // do a condition check (assume we need to verify when the meta.isAuth variable of the route component we're going to is true)
            if (to.meta.isAuth) {
                if (match some condition){
                    next()
                } else {
                    console.log('Does not match! Will not go to that page!')
                }
            } else {
                next()
            }
        })
    ]
})

export default router
```

::: tip

    Exclusive guards only come in the before type; there's no after type.

:::

### 11.3 In-component guards

Pretty much the same as exclusive guards, except they aren't configured when the router is created in index.js; instead you use the two functions `beforeRouteEnter` and `beforeRouteLeave` inside the `script` tag of the component you want to set them on.

Example: in App.vue:

```vue
<script>
    export default {
    ...
    // beforeRouteEnter: called when the user enters this component through the routing rules
    beforeRouteEnter(to, from, next){
        // do a condition check (assume we need to verify when the meta.isAuth variable of the route component we're going to is true)
        if (to.meta.isAuth) {
            if (match some condition){
                next()
            } else {
                console.log('Does not match! Will not go to that page!')
            }
        } else {
            next()
        }
    }，

    // beforeRouteLeave: called when the user leaves this component through the routing rules
    beforeRouteLeave(to, from, next){
        // do a condition check (assume we need to verify when the meta.isAuth variable of the route component we're going to is true)
        if (to.meta.isAuth) {
            if (match some condition){
                next()
            } else {
                console.log('Does not match! Will not go to that page!')
            }
        } else {
            next()
        }
    }


}
</script>
```

## 12. The router's two working modes

The router has two working modes: hash mode and history mode. And the router's default working mode is hash mode.

::: tip

In any URL, the various params that follow the `#` sign after the original address are called the hash value

Example: in `https://jeacsonsnake.github.io/JeacsonBlog/learningNote/vueNote/VUE2/VUERouter.html#%E4%BA%8C%E3%80%81%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1-%E5%A4%9A%E7%BA%A7%E8%B7%AF%E7%94%B1`, the `#%E4%BA%8C%E3%80%81%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1-%E5%A4%9A%E7%BA%A7%E8%B7%AF%E7%94%B1` is generally called the hash value

The hash value isn't sent to the server as part of the URL path, that is, it isn't included in the http request.

:::

If the router works in hash mode:

- the address carries a `#`

- if you share that content through a third-party mobile app, the address will be marked as invalid, because apps check more strictly

- but this working mode has good compatibility

If the router works in history mode:

- the address doesn't change

- but this working mode has poor compatibility; when you deploy the app, the back-end people need to help sort out the 404 problem the server may have when the page is refreshed

So **how do you change the router's working mode?**

```javascript
...
export default new router({
    ...
    // add the mode property
    mode: history
    ...
})
```

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../../learningNote/vueNote/VUE2/VUERouter.md). The translation is for reference only.
Translation time: 2026-11-05
:::
