---
title: VUERouter
icon: 'server'
category:
- VUE
- Web
tag:
- VUE2
- Router

---

## 简述

这里是当时学习vue-router时产出的相关笔记。目前还没完全整理，只有手写的图片版本。

## 零、简述

### 0.1 什么是路由？

路由是一组 key-value 的映射关系，可以理解为键值对。

### 0.2 什么是路由器？

路由器是管理多个路由的东西。

### 0.3 为何使用路由器？

为了实现“SPA应用” => 特点：**页面不刷新，组件分别出**

### 0.4 What is "VUERouter" ?

管理组件路由的核心插件，可以使用包管理器进行安装。

以pnpm为例: `pnpm i vue-router@3 -D`

::: tips

组件路由的对应规则：

- 路径 - 组件 (e.g. './foo', foo ) →前端路由

- 路径 - 函数 [e.g. '/func', func()] → 后端路由

:::

## 一、基本路由

::: tips

    这里假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue 两个文件

:::

在src文件夹下，新建router文件夹，并在该文件夹下创建入口文件index.js

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

之后在**App.vue**中：

```vue
<template>
    <div>

        <div class = 'navbar'>
            // 借助 router 实现路由切换
            <router-link class = 'about' active-class = 'active' to = '/about'>About</router-link>
            <router-link class = 'home' active-class = 'active' to = '/home'>Home</router-link>
        </div>

        <div class = 'display'>
            // 声明组件的呈现位置
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

::: tips

1. 这里的 About，Home 被称为“路由组件”，一般被放入与conponents**同级**的Pages文件夹下；

2. 为了性能的优化，一个路由组件在被切换之后，通常会被**直接销毁**(除非对其进行特殊配置)；

3. 每个组件都有自己的 route 属性，在该属性中存放着组件自身的路由信息。但是整个应用**有且只有一个** router，你可以通过该组件的 *$router* 属性进行获取。

:::

## 二、嵌套路由（多级路由）

::: tips

    这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue 四个文件

:::

在src文件夹下，新建router文件夹，并在该文件夹下创建入口文件index.js

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
            // 使用children属性将剩余两个路由组件作为二级路由嵌套
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

之后在**Home.vue**中：

```vue
<template>
    <div>
        <h2>Here is home component</h2>
        <div class = 'navbar'>
            // 借助 router 实现路由切换
            <router-link class = 'news' active-class = 'active' to = '/home/news'>News</router-link>
            <router-link class = 'message' active-class = 'active' to = '/home/message'>Message</router-link>
        </div>

        <div class = 'display'>
            // 声明组件的呈现位置
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

## 三、路由传参(query传参)

使用to参数项，对所跳转的标签进行传参。

::: tips

    这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue，Detail.vue 五个文件。并且需要对Detail进行传参。

:::

在src文件夹下，新建router文件夹，并在该文件夹下创建入口文件index.js

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
                    // 使用children属性将剩余路由组件作为三级路由嵌套
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

假设**Detail.vue**的template标签下为：

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

该文件希望通过$route对传入参数进行读取，则在**Message.vue**中可以使用两种写法对to所传参项进行定义：

1. 字符串写法

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // 借助 router 实现路由切换
                    <router-link class = 'detail' active-class = 'active' to ="`/home/message/detail?id:${m.id}&title=${m.title}`">{{m.title}}</router-link>
                </li>
            </ul>
        </div>

        <div class = 'display'>
            // 声明组件的呈现位置
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

2. 对象写法(一般**较为推荐**该写法)

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // 借助 router 实现路由切换
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
            // 声明组建的呈现位置
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

## 四、命名路由

为了简化路由的跳转，我们可以对其进行命名。

例如在上述情况(三、路由传参)下, 可以将index.js中的

```javascript
...

                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        path: 'detail',
                        component: Detail
                   ]
...
```

替换为：

```javascript
                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        name: 'detail', // new
                        path: 'detail',
                        component: Detail
                    ]
```

则在引用它的组件中可以使用 `name: 'detail'` 替换掉 `path: '/home/message/detail'` 以简化路径跳转。

## 五、路由传参(param传参)

使用to参数项，对所跳转的标签进行传参。

::: tips

    这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue，Detail.vue 五个文件。并且需要对Detail进行传参。

:::

在src文件夹下，新建router文件夹，并在该文件夹下创建入口文件index.js

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
                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        name: "detail", // 必须命名才能使用
                        path: 'detail/:id/:title', //需要自己手动配置params
                        component: Detail
                    ]
                }
            ]
        }
    ]
})
```

假设**Detail.vue**的template标签下为：

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

该文件希望通过$route对传入参数进行读取，则在**Message.vue**中可以使用两种写法对to所传参项进行定义：

1. 字符串写法

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // 借助 router 实现路由切换
                    <router-link class = 'detail' active-class = 'active' to ="`/home/message/detail/${m.id}/${m.title}`">{{m.title}}</router-link>
                </li>
            </ul>
        </div>

        <div class = 'display'>
            // 声明组件的呈现位置
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

2. 对象写法(一般**较为推荐**该写法)

```vue
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // 借助 router 实现路由切换
                    <router-link 
                        class = 'detail' 
                        active-class = 'active' 
                        to ="{
                                name:'detail', // 此处只能使用name而不能用path属性进行配置
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
            // 声明组建的呈现位置
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

![vue-router_part_2](./assets/img/vue-router_part_2.jpg)

![vue-router_part_3](./assets/img/vue-router_part_3.jpg)
