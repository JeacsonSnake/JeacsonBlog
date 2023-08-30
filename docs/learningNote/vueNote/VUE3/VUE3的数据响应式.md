---
title: VUE3的数据响应式是如何实现的？
category:
- VUE
- Web
tag:
- VUE3
- advanced
---

## 简述

这里会从源码实现原理，向你介绍VUE3是如何实现数据响应式的。

参考: [Vue Mastery-Vue3 Recativity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## 从简单的模板开始讲起

让我们首先创建一个简单的 Vue App 以及一个html模板：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js"></script>

<body>
    <div id = "app">
        <div>Price: ${{ price }}</div>
        <div>Total: ${{ price * quantity}}</div>
        <div>Taxes: ${{ totalPriceWithTax }}</div>
    </div>
    
</body>


<script>
    let vm = new Vue({
        el: '#app',
        data: {
            price: 5.00,
            quantity: 2
        },
        computed: {
            totalPriceWithTax() {
                return this.price * this.quantity * 1.03
            }
        },

    })
</script>

</html>

```

已知当我们修改`price`为`10.00`时，Vue 可以知道如何更新HTML内的相关模板信息，并且可以修改计算属性中有关其的相关计算属性，并同时更新HTML内的相关模板信息。那么这里有一个问题：
**Vue是如何知道要以什么样的方式对其进行修改的？**

毕竟在原来的JavaScript代码中，假设我们拥有一个片段：

```javascript
let price = 5
let quantity = 2
let total = price * quantity
console.log(`total 的值为：${total}`)
```

很明显，这里的log会输出`total 的值为：10`。
但当我们对 `price` 进行修改时：

```javascript
price = 10
console.log(`total 的值为：${total}`)
```

很明显，这里的log依然会输出`total 的值为：10`。因为在这个片段里，Javascript的代码运行顺序，就是很简单的从上到下。因此即使你对`price` 进行了修改，`total`的值依然不会被受到任何修改。换句话说，在这一段JavaScript代码中，`total`的值并不能得到我们所希望的，**响应式的更新**。
那么为了使这段代码在`price`被修改(更新)后，可以重新计算并更新total的值，我们要使用什么样的方法呢？

## 响应式的三板斧

为了使这段代码在`price`被修改(更新)后，可以重新计算并更新total的值，我们应该尝试着将他放入某种储存类中，使其成为某种更新用函数，让他可以被多次调用。这样我们就可以在后期通过调用这个函数以实现较为方便的更新了。而且假设我们之后还有许多类似的需要拥有这个功能的变量，这就使得这些函数需要有一个共同存储的地方。听起来很麻烦，不过我们一步步来编写。

首先我们将这个更新用函数命名为`effect`，毕竟这个函数可以被认为是对`total`做出了某种*效果*:

```javascript
// 原有的定义
let total = price * quantity
// 修改之后的函数
let total = 0
let effect = function() {
    total = price * quantity
}

```

然后我们需要一个用于保存这个*更新用函数*的方法，当我们想要保存时，或者说希望对这个值进行跟踪时，就调用这个方法。我们将这个跟踪用函数命名为`track`:

```javascript
track()
```

最后我们需要一个用于触发这个*更新用函数*的方法，当我们更新了`price`时，就调用这个方法以触发之前所存储的更新用函数`effect()`。我们将这个触发用函数命名为`trigger`:

```javascript
trigger()
```

我们将这三个函数串联起来的话，大概是像这个样子：

```javascript
let price = 5
let quantity = 2
let total = 0
let effect = function() {
    total = price * quantity
}

// 声明要对total进行跟踪
track()
// 执行一次更新用函数，以获取首次的total值
effect()
...
// 在之后的某一次更新中，假设price 或者 quantity 收到了修改，则调用该函数进行触发
trigger()
```

## 函数有谱了，那要存哪里？

为了更加格式化的存储多个`effect`函数，我们需要使用某种哈希结构进行存储。为了使每个值只能在这个哈希结构中出现一次，它应该是一组唯一值的集合。由此我们会使用`Set`—— **集合对象**对其进行存储。
在这里我们一般会做如下定义：

```javascript
...
dep = new Set() // 代表依赖关系 “dependency”
let effect = () => { total = price * quantity }// 缩减为箭头函数
...
```

由此，我们就可以将[前文](./VUE3的数据响应式.md#响应式的三板斧)所说的 `track` 和 `trigger` 两个函数进行定义：

```javascript
function track() {
    dep.add(effect) // 将定义好的 effect 添加入 dep
}

function trigger() {
    dep.forEach((effect) => {effect()}) // 遍历所有 dep 内的 effect 并触发运行
}

```

由此，之前的代码变成了：

```javascript
let price = 5
let quantity = 2
let total = 0

dep = new Set() // 代表依赖关系 “dependency”
let effect = () => { total = price * quantity }// 缩减为箭头函数

function track() {
    dep.add(effect)
}

function trigger() {
    dep.forEach((effect) => {effect()})
}

// 声明要对total进行跟踪
track()
// 执行一次更新用函数，以获取首次的total值
effect()
...

```

于是在这种情况下，假设我们像最开始一样将`price`调整为10，即使我们尝试输出total时值依然没有变化，但是——**我们现在可以对其进行手动更新了**。只要在更新`price`之后调用`trigger()`方法，就可以实现手动的更新`total`值了。

## 未完待续
