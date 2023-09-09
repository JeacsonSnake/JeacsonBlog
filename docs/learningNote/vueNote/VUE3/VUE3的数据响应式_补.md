---
title: VUE3的数据响应式是如何实现的？（四）
category:
- VUE
- Web
tag:
- VUE3
- advanced
order: 4
---

## 简述

这里会从源码实现原理，向你介绍VUE3是如何实现数据响应式的。这里是下篇的下篇。

参考: [Vue Mastery-Vue3 Recativity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## 上篇回顾

在上一篇中，我们修复了代码遗留的两个BUG，分别是：

- [无论是否调用更新用函数都会执行track的问题](./VUE3的数据响应式_下.md#原来的代码出现了问题)
- [将更新用函数所绑定的值用于另一更新用函数导致的缺失响应式数据的问题](./VUE3的数据响应式_下.md#原来的代码还有问题存在)

我们使用了以下方法进行了修复：

- [引入 activeEffect 变量使 track 函数判断调用者](./VUE3的数据响应式_下.md#activeeffect-变量-与-独立的-effect-函数)
- [使用Object Accessor 定义ref函数以保存更新用函数所对应响应式数据](./VUE3的数据响应式_下.md#返璞归真使用对象访问器javascript-自身的-计算属性object-accessor)

在该篇中，我们将会继续参考VUE3响应式，对我们自己写的代码进行丰富，直到它在直接调用VUE自身同名函数时，也可以成功运行。

## 原代码

让我们把原先的代码拷贝过来：

```javascript
// targetMap-activeEffect相关

const targetMap = new WeakMap()

let activeEffect = null

function effect(eff) {
    // 首先将传入的参数赋值给 activeEffect
    activeEffect = eff
    // 然后运行 activeEffect
    activeEffect()
    // 最后重新将其设置为 null
    activeEffect = null
}

function track(target, key) {
    // 如果 activeEffect 不为null
    if (activeEffect) {
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
        // 将定义好的 activeEffect 添加入 dep ← new
        dep.add(activeEffect)
    }
    
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

function ref(raw) {
    const r = {
        get value() {
            track(r, 'value')
            return raw
        },
        set value(newVal) {
            raw = newVal
            trigger(r, 'value')
        }
    }
    return r
}
...
```

```javascript
// reactiveFunction相关

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

```

```javascript
// 主要程序

let product = reactive({price = 5, quantity = 2})
let total = 0

let salePrice = ref(0) //  ← NEW
...

effect(() => { 
    salePrice.value = product.price * 1.2 //  ← NEW
})

effect(() => { 
    total = salePrice.value * product.quantity //  ← NEW
})

...

console. log( '更新前， total 值为 ${total} (应为 12)， salePrice 值为 ${salePrice} (应为 6)')  //  ← NEW

product.quantity = 3 
console. log( '更新后， total 值为 ${total} (应为 18)，salePrice 值为 ${salePrice} (应为 6)')  //  ← NEW

product.price = 10  //  ← NEW
console. log( '二次更新后， total 值为 ${total} (应为 36)，salePrice 值为 ${salePrice} (应为 12)')  //  ← NEW
```

## 在代码中加入计算属性

你可能学过VUE的 Composition API, 那么这时你可能会想：

> 说了这么多，为啥这里使用两个 effect 去定义需要被计算才可以得出的变量？
> 我为啥不用计算属性(computed properties)直接写呢？

确实，在我们所写的代码内使用计算属性是一个很好的机会。那么，如果我们这么做了，我们的主要程序会是什么样子？

我们把之前的使用effect函数定义的形式:

```javascript
let total = 0

let salePrice = ref(0) //  ← NEW

effect(() => { 
    salePrice.value = product.price * 1.2 //  ← NEW
})

effect(() => { 
    total = salePrice.value * product.quantity //  ← NEW
})
```

修改为这样：

```javascript
let total = computed(() => { 
    return salePrice.value * product.quantity //  ← NEW
})

let salePrice = computed(() => { 
    return product.price * 1.2 //  ← NEW
}) //  ← NEW

```

对于这个`computed 函数`，我们传入了一个匿名函数，然后让它返回了之前我们所写的相关计算公式所计算出的结果。

那么，既然我们从头开始建立了响应式，我们又该如何定义我们这里所写的`computed 函数`？

对此VUE3给出的回答是：计算属性应是响应式的，并且类似于 `ref函数`。

## 计算属性的定义

我们定义一个 `computed` 函数，并且将他的传参 (传入的函数) 命名为`getter`：

```javascript

function computed(getter) {

}

```

在这个函数里，我们需要做出以下几个动作：

- 使用`ref()`创建一个响应式引用，称为`result`；
- 为了监听传入的响应值，我们依然需要调用effect函数。但是传入effect函数的匿名函数中应将 getter 赋值给 result.value；
- 将响应式引用 `result` 返回。

```javascript

function computed(getter) {
    let result = ref()
    effect(() => {
        result.value = getter()
    })
    return result
}

```

像这样定义完`computed`函数后，当我们调用该函数进行计算属性的定义时，就可以实现响应式数据的效果。

:::tip 在ref()的基础上定义computed()

`ref`可以被认为是`computed`函数的基础版本，因为`computed`函数在核心上就是将`ref`函数与`effect`函数进行封装之后得到的。所以我们会先定义`ref`函数，之后再以此为基础，定义`computed`函数。如果想回忆下`ref`函数如何被定义的，可以看看[上一篇](./VUE3的数据响应式_下.md#ref-函数).

:::

## VUE3的数据响应式相对于VUE2而言的优势

请参阅同样在博客内的[这篇文章](./VUE3_Vs_VUE2_In_Reactive_Data.md).

## 尝试把写的代码替换成源码吧

到此为止，我们搭建了与VUE3中近似的响应式引擎，那么我们不妨尝试简单的插入些VUE3源码，看下我们的代码是否还能正常运行。

(Not completed.Maybe later for dive in source code)
