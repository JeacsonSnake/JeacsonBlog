---
title: VUE3的数据响应式是如何实现的？（中）
category:
- VUE
- Web
tag:
- VUE3
- advanced
order: 2
---

## 简述

这里会从源码实现原理，向你介绍VUE3是如何实现数据响应式的。这里是中篇。

参考: [Vue Mastery-Vue3 Recativity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## 上篇回顾

在上篇中，为了实现数据响应式我们对自己的代码进行了三次改装，让它看起来越来越像常见的响应式引擎：

- [将"更新用函数"存入合适存储区——Set](./VUE3的数据响应式_上.md#将更新用函数存入合适存储区set)
- [将所有的set存储区串成一个map](./VUE3的数据响应式_上.md#将所有的set存储区串成一个map)
- [将所有的map串成weakmap](./VUE3的数据响应式_上.md#将所有的map串成weakmap)

在该篇中，我们将会参考VUE3响应式，一步步完成我们自己写的响应式引擎。

## 我想要让他们自动起来——引文

在上篇结束时我们有提到：

> 直到目前为止，我们还是只能使用手动的更新来监测我们希望监测的值，而没有办法使*响应式对象*中*特定属性*的*更新用函数* **Set** 自动地重新运行。

我们仍在通过亲自调用 `track()` 和 `trigger()` 函数来记录与触发我们所写的 `effect()`。但是很明显，我们更希望这个引擎能够自动调用它们。那么有没有什么方法，可以在引擎获取与配置相应属性时去调用这些函数呢？

## JS数据是怎么读取和修改的？—— getter 与 setter

如果你对JS有较为深入的了解，你可能会知道在通常情况下，JavaScript中的数据是通过 `getter` 方法与 `setter` 方法进行读取和修改的。当JS希望读取某个数据时，它会调用 `getter` 方法进行读取；而如果JS希望修改某个数据时，它会调用 `setter` 方法进行设置。在这些方面，JS是自动对其进行处理的。

> 等下，也就是说，假设我们使用某种方法，使JS可以在 `getter` 方法中调用 `track()`，然后在 `setter` 方法中调用 `trigger()`，那不就可以实现引擎的自动调用了吗？

是这样的。基本上来说，如果引擎访问了某个对象中的某个属性，或者说使用了 `get` 方法，那么这个时候就是我们希望调用 `track()` 去保存我们所写的 `effect()`的时候；而如果引擎修改了某个对象中的某个属性，或者说使用了 `set` 方法，那么这个时候就是我们希望调用 `trigger()` 去运行我们之前所保存的 `effect()` 的时候。

## 原生之初 —— Object.defiineProperty

在ES2015之前，大部分的响应式引擎，包括VUE在内，都使用了 JavaScript 身上有关 Object 类的方法：**Object.defiineProperty** 来进行数据的检测。

简单来说，它可以用其内置的 `getter` 与 `setter` 两个函数对传入的数据进行修改操作。因为在JavaScript设定中，当它希望读取某个数据时，它会优先调用 **Object.defiineProperty** 身上的 `getter` 方法进行读取；而如果它希望修改某个数据时，它会优先调用 **Object.defiineProperty** 身上的 `setter` 方法进行设置。在这时，我们就可以通过自定义这两个方法，来实现响应式的数据了。

:::tip
想了解更多有关 **Object.defiineProperty** 如何配置的内容，可以看看同样在博客内的[这篇文章](../../JSNote/defineproperty方法.md)。
:::

但是 **Object.defiineProperty** 这个方法作为ES5的一个老版本方法，某种意义上已经变得较为臃肿过时了。因此我们可以使用ES6上的新特性 —— **Reflect** 与 **Proxy**。

## 新生代 —— Proxy 与 Reflect

下文会针对 Proxy 与 Reflect 如何进行代理的问题进行相关介绍：

### 1.Reflect

Reflect 是一个内置的对象，它提供了拦截 JavaScript 操作的方法。
举个例子，例如之前包裹 `price` 与 `quantity` 的 **product** 对象：

```javascript
let product = {price = 5, quantity = 2}
```

当我们希望读取这个对象的属性时，我们可以使用以下三种方式可以读取：

1. 使用典型的 *点表示法*：

    ```javascript
    console.log("quantity的值为：" + product.quantity)
    ```

2. 使用第二典型的 *中括号表示法*：

    ```javascript
    console.log("quantity的值为：" + product['quantity'])
    ```

3. 使用的 *Reflect* 的 *get方法*，也是我们希望使用的方法：

    ```javascript
    console.log("quantity的值为：" + Reflect.get(product, 'quantity'))
    ```

你可能会疑问：
> Reflect.get 看起来好像和之前我们写的函数差不多？之前我们使用 `weakMap` 后所定义的 `track` 函数也是传入*target* 与 *key* 这两个参数。

是的，但是与 *点表示法* 和 *中括号表示法* 两种方法相比， *Reflect* 有着不同的能力。这里先卖个关子，等我们知道 Proxy 是什么之后，就会自然知道为什么使用 Reflect 了。

### 2.Proxy

简单而言，Proxy 在默认情况下，可以被作为某一个对象的代理值，而 Proxy 自身也是一个对象。
举个例子，例如之前包裹 `price` 与 `quantity` 的 **product** 对象：

```javascript
let product = {price = 5, quantity = 2}
```

如果我们尝试创建一个用于代理 `product` 的 Proxy 对象，那么在参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)等相关文档后，我们就会做出以下配置：

```javascript
let proxiedProduct = new Proxy(product, {})
```

当我们作出如上配置，并尝试调用 `console.log(proxiedProduct.quantity)` 来输出时，JS会采取以下步骤：

- 调用 Proxy, 在此指的是 proxiedProduct；
- Proxy 调用 它所代理的对象, 在此指的是 product；
- 对象返回指定的值, 在此指的是 product.quantity，给 Proxy；
- Proxy 将值呈现在控制台日志上。

由此我们可以得知，Proxy 所做的这套流程，实质上是一种对象委托。当使用 `Proxy(target, handler)` 这个构造器函数进行 Proxy 构造时：

- 传入的第一个值 `target` 指的是希望使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个 Proxy ）。
- 而第二个值 `handler` 通常会传入一个 *通常以函数作为属性* 的对象，各属性中的函数分别定义了在执行各种操作时代理 Proxy 的相关行为。

## 如何拥抱新生代 —— 使用 Reflect 配置 Proxy 的 handler

在 handler 当中，我们可以传入一个用于拦截 *类似于属性查找、枚举或者函数调用等基本操作* 的**捕捉函数**。
所以在我们的例子中，我们可以这么做：

```javascript
let product = {price = 5, quantity = 2}
let proxiedProduct = new Proxy(product, {
    get(target, key) {
        return target[key]
    }
})
console.log(proxiedProduct.quantity)
```

与 **Object.defiineProperty** 类似，使用 getter 就可以在读取某个数据时对JS进行拦截。但是在这里，我们会使用 Reflect 替代第二典型的 *中括号表示法*：

```javascript
let product = {price = 5, quantity = 2}
let proxiedProduct = new Proxy(product, {
    get(target, key, receiver) {
        return Reflect.get(target, key, receiver)
    }
})
console.log(proxiedProduct.quantity)
```

你可能会发现，传入的参数多了一个 `receiver`。而这就是Reflect的其中一个与众不同的能力。对于 **getter** 而言，这个 `receiver` 参数可以保证，当我们的对象从其他的对象中继承了 *同名的值或者对象* 时，this指针可以正确指向子对象而不是父对象。从而避免了Vue2中的一些响应式警告。

:::tip
想知道更深层次的答案，可以参考[javascript.info - 代理一个 getter](https://zh.javascript.info/proxy#dai-li-yi-ge-getter), 希望看英文的话也可以看→[javascript.info 中有关 Proxying a getter 的内容](https://javascript.info/proxy?tdsourcetag=s_pctim_aiomsg#proxying-a-getter)
:::

我们同样可以以此定义set方法：

```javascript
let product = {price = 5, quantity = 2}
let proxiedProduct = new Proxy(product, {
    set(target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver)
    }
})
console.log(proxiedProduct.quantity)
proxiedProduct.quantity = 4
console.log(proxiedProduct.quantity)
```

其中很明显的多了修改后的值 `value`。

## 把 handler 封装起来

为了让上面的代码更像VUE3中的源码，让我们对 handler 进行一个封装：

- 我们创建一个函数，并取名为 **reactive**。如果你使用组合式API进行VUE3程序的书写，你可能会熟悉这个词;
- 在函数内部创建 `handler` 常量，使用其将之前所定义好的 `getter` 和 `setter` 进行封装;
- 让函数返回Proxy代理对象。

具体代码如下：

```javascript
function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            return Reflect.get(target, key, receiver)
        },

        set(target, key, value, receiver) {
            return Reflect.set(target, key, value, receiver)
        }
    }
    return new Proxy(target, handler)
}
```

这样定义之后，当我们需要声明一个对象时，只需要传递它到 `reactive` 函数中，让该函数返回一个代理对象，就可以以这个代理对象作为原始对象进行使用。
对于之前封装的 product 对象，就会变成这样：

```javascript
let product = reactive({price = 5, quantity = 2})
```

## 回到原来的代码 —— 让三板斧自动运行起来

让我们把原来的代码拷贝过来：

```javascript
// targetMap 相关

const targetMap = new WeakMap()

function track(target, key) {

    // 以传入的对象作为 target，找到对应的 depMap 值
    let depMap = targetMap.get(target)
    // 万一还没有 depMap，那咱就创一个新的
    if (!depMap) {
        targetMap.set(target, (depMap = new Map()))
    }

    // 以传入的属性值作为 key，找到对应的 dep 值
    let dep = depMap.get(key)
    // 万一还没有 dep，那咱就创一个新的
    if (!dep) {
        depMap.set(key, (dep = new Set()))
    }
    // 将定义好的 effect 添加入 dep
    dep.add(effect)
}

function trigger(target, key) {

    // 以传入的对象作为 target，找到对应的 depMap 值
    let depMap = targetMap.get(target)
    // 万一还没有 depMap，那咱就创一个新的
    if (!depMap) {
        // 如果 depMap 不存在就不用运行，直接跳过
        return
    }
    
    // 以传入的属性值作为key，找到对应的dep值
    let dep = depMap.get(key)
    // 如果 dep 存在
    if (dep) {
        // 遍历 dep 内的所有 effect 并触发运行
        dep.forEach((effect) => {effect()})
    }
    // 如果 dep 不存在就不用运行，直接跳过
}
```

```javascript
// 主要程序


let product = {price = 5, quantity = 2}
let total = 0

...

let effect = () => { total = product.price * product.quantity }// 缩减为箭头函数

...

// 首先声明要对属性进行跟踪，这里以 price 为例
track(product, "price")
// 其次执行一次更新用函数，以获取首次的 total 值
effect()
console.log('total = ' + total)

product.price = 10
// 在更新`price`之后调用`trigger(product, "price")`方法
trigger(product, "price")
console.log('total = ' + total)
```

根据[前文](./VUE3的数据响应式_中.md#js数据是怎么读取和修改的-getter-与-setter)所述，我们要将这三个函数塞入[上一节](./VUE3的数据响应式_中.md#把-handler-封装起来)我们所创建的 `reactive` 函数中，以实现响应式数据。

```javascript
// reactiveFunction相关
...

function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            // 先将 获得的数值进行保存
            let result = Reflect.get(target, key, receiver)
            // 声明要对target的key进行跟踪
            track(target, key)
            // 返回 result
            return result
        },

        set(target, key, value, receiver) {
            // 先将旧的数值进行保存
            let oldValue = Reflect.get(target, key, receiver)
            // 为目标属性赋予新的值，并将得到的结果进行赋值
            let result = Reflect.set(target, key, value, receiver)
            // 如果新旧数值不相等
            if (oldValue != result) {
                // 在更新 target的key 之后调用 trigger() 方法
                trigger(target, key)
            }
            return result
        }
    }
    return new Proxy(target, handler)
}

...
```

搞定！现在原来的代码就可以被修改为：

```javascript
// 主要代码

let product = {price = 5, quantity = 2}
let total = 0
...

let effect = () => { total = product.price * product.quantity }// 缩减为箭头函数

...
// 首先声明要对属性进行跟踪，这里已经在effect生效的时候触发track函数，因此删除

// 其次执行一次更新用函数，以获取首次的 total 值
effect()
console.log('total = ' + total)

product.price = 10
// 在更新`price`之后，原则上已经调用了`trigger()`方法，因此删除

console.log('total = ' + total)
```

然后你的代码就变成了 **数据响应式** 的了！🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
*... 当然还有些BUG我们还没处理就是了。*

## 小总结

在这篇文章中，我们成功地将我们的代码实现了响应式数据。为了实现它，我们使用了Reflect 与 Proxy 两个 ES6 的新语法，让它看起来越来越像我们希望了解的Vue3语法：

- [如何拥抱新生代 —— 使用 Reflect 配置 Proxy 的 handler](./VUE3的数据响应式_中.md#如何拥抱新生代--使用-reflect-配置-proxy-的-handler)
- [把-handler-封装起来](./VUE3的数据响应式_中.md#把-handler-封装起来)
- [回到原来的代码--让三板斧自动运行起来](./VUE3的数据响应式_中.md#回到原来的代码--让三板斧自动运行起来)

但是在我们的代码中还存在着一些 Bug。不过没关系，我们会在下一篇中统一对其进行修正。
