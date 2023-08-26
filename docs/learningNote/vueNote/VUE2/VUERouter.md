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

::: tip

组件路由的对应规则：

- 路径 - 组件 (e.g. './foo', foo ) →前端路由

- 路径 - 函数 [e.g. '/func', func()] → 后端路由

:::

## 一、基本路由

::: tip

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

::: tip

1. 这里的 About，Home 被称为“路由组件”，一般被放入与conponents**同级**的Pages文件夹下；

2. 为了性能的优化，一个路由组件在被切换之后，通常会被**直接销毁**(除非对其进行特殊配置)；

3. 每个组件都有自己的 route 属性，在该属性中存放着组件自身的路由信息。但是整个应用**有且只有一个** router，你可以通过该组件的 *$router* 属性进行获取。

:::

## 二、嵌套路由（多级路由）

::: tip

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

::: tip

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

::: tip

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

## 六、路由的props配置

该配置可以让路由组件更方便的收到参数。

::: tip

    这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue，Detail.vue 五个文件。并且需要对Detail进行**params**传参。

:::

在src文件夹下，新建router文件夹，并在该文件夹下创建入口文件index.js

则有以下三种方法对props进行配置:

### 6.1 对象写法

```javascript
// 与之前相同的配置不在此赘述
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
                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        name: "detail", // 必须命名才能使用
                        path: 'detail/:id/:title', //需要自己手动配置params
                        component: Detail，
                        // props属性值传入对象
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

### 6.2 布尔值写法

当props传入布尔值时，若为真，则会将该路由组件所收到的**所有params参数**以**props**的形式传给该组件。

```javascript
// 与之前相同的配置不在此赘述
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
                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        name: "detail", // 必须命名才能使用
                        path: 'detail/:id/:title', //需要自己手动配置params
                        component: Detail，
                        // props属性值设置bool值为true
                        props:true
                    ]
                }
            ]
        }
    ]
})
```

### 6.3 函数写法（广泛使用）

```javascript
// 与之前相同的配置不在此赘述
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
                    // 使用children属性将剩余路由组件作为三级路由嵌套
                    children: [
                        name: "detail", // 必须命名才能使用
                        path: 'detail/:id/:title', //需要自己手动配置params
                        component: Detail，
                        // props属性值作为函数使用，以$route作为传入参数
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

有了props配置后，**Detail.vue**的template标签下原先的`$route.param`可以被省略：

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

但是在它的script标签下：

```vue
<script>
export default {
        name: 'Message',
        props: ['id','title'] // 需要添加props属性
    }

</script>
```

## 七、router 的 replace 属性

::: tip

已知：浏览器中的网站在存储历史记录时，一般会使用两种写入方式：

1. PUSH模式
   在用户浏览新网页(组件)时，将网页地址PUSH进存储栈。这使得用户**可以**通过浏览器的“前进”、“后退”进行页面跳转。

2. REPLACE模式
   在用户浏览新网页(组件)时，直接将旧的网页地址REPLACE为新的。这使得用户**无法**通过浏览器的“前进”、“后退”进行页面跳转。

:::

路由组件的跳转方式默认为PUSH。但是在router-link标签下可以使用 replace 属性，将原有的组件以REPLACE模式直接跳转。例：

`<router-link replace class = "..." to = "...">... </router-link>`

## 八、编程式路由导航

如果我们不使用to属性针对不同的路由组件进行跳转，或者当我们希望使用`@click`等方法实现路由跳转时，我们可以使用`$route.push` 或者`$router.replace` 进行编程式的路由导航。

::: tip

    这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue，Detail.vue 五个文件。并且需要对Detail进行**query**传参。

:::

例如当**message.vue** 里的template标签被修改为使用按钮进行跳转：

```vue
<-- message.vue !-->
<template>
    <div>
        <h2>Here is Message component</h2>
        <div class = 'navbar'>
            <ul>
                <li v-for = 'm in messagelist' :key="m.id">
                    // 借助 router 实现路由切换,但是删除了to
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
            // 声明组建的呈现位置
            <router-view></router-view>
        </div>

    </div>
</template>
```

则可以使用以下方法进行跳转：

```vue
<-- message.vue !-->
<script>
    export default {
        name: 'Message',
        data(){
            ...
        },
        methods:{
        // 1. push方法
            pushShow(m){
                this.$router.push({
                    name:'detail',
                    query:{
                        id:m.id,
                        title:m.title
                    }
                })
            }，
        // 2. replace方法
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

只要在`<button>`标签中使用`@click = "pushShow(m)"`或`@click = "replaceShow(m)"`

:::tips

如果你对比下，你可能会发现，在这两个函数下的配置，与to标签下的配置是相同的。

:::

## 九、缓存路由组件

为了使不展示的路由组件依然保持挂载而不被销毁，我们可以将这个路由组件进行缓存。

::: tip

这里同样假设src文件夹下有conponents，Pages等多个文件夹，其中Pages中有 About.vue，Home.vue, News.vue, Message.vue，Detail.vue 五个文件。

:::

假设我们希望News.vue保持挂载不被销毁。那么我们可以在用于展示它的母文件Home.vue中使用`<keep-alive>`标签

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
            // 在声明组件的呈现位置添加keep-alive标签，并标注包含的标签名
            <keep-alive include=“News”>
            <router-view></router-view>
        </div>

    </div>
</template>

...
```

:::tip

1. 如果希望包含多个，可以使用 `:include = "["nameA", "nameB"]"`进行包含。

2. 如果要缓存全部，直接使用该标签就可以，不需要再添加include属性

:::

## 十、路由组件独有的生命周期钩子

路由组件拥有两个独有的生命周期钩子，分别为：

1. activated()

2. deactivated()

其中activated()函数在路由组件被激活时使用，而当路由组件返回未被激活状态时，会调用deactivated()函数。

一般会和定时器进行配合使用，在路由组件被激活时使用activated()函数开启定时器，而当路由组件返回未被激活状态时，调用deactivated()函数清除定时器。

## 十一、路由守卫

当我们希望用户在进行过权限相关的操作之后才可以进入某些页面，例如登录后才可以进入详情页面时，我们可以使用路由守卫来校验权限，保护路由的安全。

在vuerouter中有内置了相关函数，可以在路由切换前或者路由切换后进行调用。

一共有以下三种方法进行路由守卫的设置：

### 11.1 全局守卫

可以为全局配置守卫。

在index.js 中：

```javascript
...
//新建 router 
const router = new VueRouter({
    routes:[
        // 相关路由配置操作
    ]
})

// 1. 全局前置守卫：在 router 创建后使用beforeEach方法
router.beforeEach((to, from, next) => {
    // 进行条件判断(假设去往的路由组件的meta.isAuth变量为真时需要进行校验)
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

// 2. 全局后置守卫：在 router 创建后使用afterEach方法
router.afterEach((to, from, next) => {
    // 进行条件判断(假设去往的路由组件的meta.isAuth变量为真时需要进行校验)
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

### 11.2 独享守卫

可以为某一个组件配置其独享的守卫。

在index.js 中：

```javascript
...
//新建 router 
const router = new VueRouter({
    routes:[
        // 相关路由配置操作
        path: 'xxx',
        component: xxx,
        // 使用 beforeEnter 进行独享守卫配置
        beforeEnter((to, from, next) => {
            // 进行条件判断(假设去往的路由组件的meta.isAuth变量为真时需要进行校验)
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

    独享守卫只有前置类型，而没有后置类型。

:::

### 11.3组件内守卫

和独享守卫差不多，但是并不是在index.js创建路由时进行配置，而是在希望设置的组件自身的`script`标签内使用`beforeRouteEnter`和`beforeRouteLeave`两个函数进行配置。

例：在App.vue中：

```vue
<script>
    export default {
    ...
    // beforeRouteEnter: 当用户通过路由规则，进入该组件时会被调用
    beforeRouteEnter(to, from, next){
        // 进行条件判断(假设去往的路由组件的meta.isAuth变量为真时需要进行校验)
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

    // beforeRouteLeave: 当用户通过路由规则，离开该组件时会被调用
    beforeRouteLeave(to, from, next){
        // 进行条件判断(假设去往的路由组件的meta.isAuth变量为真时需要进行校验)
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

## 十二、路由器的两种工作模式

路由器存在两种工作模式：hash模式和history模式。而路由器的缺省工作模式为hash模式。

::: tip

在任意一个网址中，跟在原网址的`#`符号后传输的各种参数等被成为hash值

例： 在`https://jeacsonsnake.github.io/JeacsonBlog/learningNote/vueNote/VUE2/VUERouter.html#%E4%BA%8C%E3%80%81%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1-%E5%A4%9A%E7%BA%A7%E8%B7%AF%E7%94%B1`中，`#%E4%BA%8C%E3%80%81%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1-%E5%A4%9A%E7%BA%A7%E8%B7%AF%E7%94%B1``一般会被称为hash值

hash值不会作为网址路径的一部分发送给服务器，即不会被包含在http请求中。

:::

如果路由器工作模式为hash模式：

- 地址会带上`#`

- 如果通过第三方手机APP分享该内容时，由于App校验较为严格，该地址会被标记为不合法

- 但是这种工作模式的兼容性好

如果路由器工作模式为history模式：

- 地址不变

- 但是这种工作模式的兼容性差，应用部署上线时需要后端人员配合以解决刷新页面时服务端可能会出现的404问题

那么**如何修改路由器工作模式？**

```javascript
...
export default new router({
    ...
    // 添加 mode 属性
    mode: history
    ...
})
```
