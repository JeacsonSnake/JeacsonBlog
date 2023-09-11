---
title: VUE3的数据响应式是如何实现的？（三）
category:
- VUE
- Web
tag:
- VUE3
- advanced
order: 3
---

## 简述

这里会从源码实现原理，向你介绍VUE3是如何实现数据响应式的。这里是下篇。

参考: [Vue Mastery-Vue3 Recativity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## 上篇回顾

在上一篇中，为了实现数据响应式，我们使用了Reflect 与 Proxy 两个 ES6 的新语法，让它看起来越来越像我们希望了解的Vue3语法：

- [如何拥抱新生代 —— 使用 Reflect 配置 Proxy 的 handler](./VUE3的数据响应式_中.md#如何拥抱新生代--使用-reflect-配置-proxy-的-handler)
- [把 handler 封装起来](./VUE3的数据响应式_中.md#把-handler-封装起来)
- [回到原来的代码 —— 让三板斧自动运行起来](./VUE3的数据响应式_中.md#回到原来的代码--让三板斧自动运行起来)

在该篇中，我们将会继续参考VUE3响应式，修补在上一篇章中所遗留下来的BUG。

## 原来的代码出现了问题

首先让我们把原先的代码拷贝过来：

```javascript
// targetMap相关

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
import { reactive } from './reactiveFunction.js'

let product = reactive({price = 5, quantity = 2})
let total = 0
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

这些代码有什么问题呢？

## 第一个BUG. 每读取一次就要重跑一次

对于现在的 `main.js` 而言，以上的代码都没有啥问题。那么，让我们加一行代码，看看有什么问题。

```javascript
// 主要程序
import { reactive } from './reactiveFunction.js'

let product = reactive({price = 5, quantity = 2})
let total = 0
let effect = () => { total = product.price * product.quantity }// 缩减为箭头函数
...
// 首先声明要对属性进行跟踪，这里已经在effect生效的时候触发track函数，因此删除

// 其次执行一次更新用函数，以获取首次的 total 值
effect()
console.log('total = ' + total)

price = 10
// 在更新`price`之后，原则上已经调用了`trigger()`方法，因此删除

console.log('修改了price之后，price的值变为：' + product.price) // 新加的代码

console.log('total = ' + total)
```

当我们加上 `console.log('修改了price之后，price的值变为：' + product.price)` 这行代码之后，当JS运行到这里时，我们的代码会让它怎么做？

> 调用 Proxy handler 里面的 get 方法？

然后呢？

> 使用 Reflect.get 函数 获取值？

再然后？

> 调用 track 方法？

问题就出现在这里！

我们原来希望的是 “只要 *更新用函数* 被调用时， 我们就让程序调用 *track* 方法，将 *更新用函数*  放入 Set 中”，对吧？

但是对现在的代码而言，无论你是不是 *更新用函数*，只要你有调用一次 Proxy handler 里面的 get 方法，就会 ~~执行一次 track 方法，然后跑一遍 weakMap、Map、Set，再检查有没有把effect放进去了，然后检查结束，然后再一步步跑出来，然后返回结果~~。

是不是没啥必要？我们只需要让 *更新用函数* 被调用时， 再使程序调用 *track* 方法 就可以了。所以我们需要改一下。

### activeEffect 变量 与 独立的 effect 函数

我们引入一个 activeEffect 变量，用它保存现在正在运行中的 *更新用函数* 。

```javascript
...
let activeEffect = null
...
```

再创建一个独立的 effect 函数，让它传入原来的 *更新用函数* 作为参数。并执行以下步骤：

```javascript
...
function effect(eff) {
    // 首先将传入的参数赋值给 activeEffect
    activeEffect = eff
    // 然后运行 activeEffect
    activeEffect()
    // 最后重新将其设置为 null
    activeEffect = null
}
...
```

那么对于原来的 *更新用函数*，我们就需要将其改写为：

```javascript
// 主要程序
...
effect(() => { 
    total = product.price * product.quantity 
})
...

```

 并且由于在调用新的 `effect函数` 之后，他可以自行调用传入的匿名函数，因此我们可以删除原来的代码中 有关 *直接调用 effect函数* 的部分。

```javascript
// 主要程序

let product = reactive({price = 5, quantity = 2})
let total = 0
...

effect(() => { 
    total = product.price * product.quantity 
})

...
// 首先声明要对属性进行跟踪，这里已经在effect生效的时候触发track函数，因此删除

// 其次执行一次更新用函数，以获取首次的 total 值，这里已经在effect调用的时候触发，因此删除
// effect()  ← NEW COMMENTS
console.log('total = ' + total)

product.price = 10
// 在更新`price`之后，原则上已经调用了`trigger()`方法，因此删除

console.log('修改了price之后，price的值变为：' + product.price)

console.log('total = ' + total)
```

当然，这还远没有结束。

### 在 track 内部进行修改

我们需要更新下 `track`函数， 让他去使用这个新的 **activeEffect**。

:::info
这是原来的 `track`函数：

```javascript
// targetMap相关

const targetMap = new WeakMap()

// 这里把之前写的 activeEffect 和 effect 函数给放过来
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
...
```

:::

按照我们之前所说的，“只有 *更新用函数* 被调用时， 我们才让程序调用 *track* 方法，将 *更新用函数*  放入 Set 中”。
但是在现在这个条件下，这句话就变成了：“只有 *effect函数* 被调用，activeEffect 出现了不为 null 的情况时， *track* 方法才可以将 *更新用函数*，也就是这里已经被匿名函数赋了值的 activeEffect, 放入 Set 中”。我们按照这个方法写一下。

```javascript
// targetMap相关

const targetMap = new WeakMap()

// 这里把之前写的 activeEffect 和 effect 函数给放过来
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
...
```

:::tip
为什么这里可以使用 activeEffect 变量进行限制？因为在之前的情况下：

- 无论是在 **调用旧的 effect 函数** 还是在 **获取对应数值** 的时候，由于需要读取对象中的响应式数据，一定会*经过 getter* 而 *调用 track 方法*；
- track 方法并没有做过多的限制， 因此 **无法判断** 程序是由于什么原因进行调用的。

而对于之后拥有了 activeEffect 的情况下而言：

- 无论是在 **调用新的 effect 函数** 还是 **获取对应数值** 的时候，由于需要读取对象中的响应式数据，一定会 *经过 getter* 而 *调用 track 方法*；
- track 方法在此时 **必须判断** 是否有 activeEffect 存在，才可以进行下一步：
    activeEffect 在没被赋值时为null，而 **新的 effect 函数** 被调用时会：
        - 先“将匿名函数赋值给 activeEffect ”，此时 activeEffect 值为 匿名函数本身；
        - “调用 activeEffect ”；
        - 经过 “调用了 新的 effect → 读取对象中响应式数据 → 经过 getter” 流程后，
        - 最后才会“ 调用 track 方法”。
    而此时，activeEffect 值为 匿名函数本身，不为null，因此会继续执行。
    换句话说，只有 activeEffect 存在时，track函数 才可以运行，否则会直接 return

因此这里可以使用 activeEffect 变量进行限制。
:::

于是BUG No.1 修复成功。

## 找其他BUG之前，先来丰富下原来的代码

让我们把主要代码做得更丰富一点：

- 添加一个变量 `salePrice`表示销售价, 初始值为0。
- 添加一个新的 effect 以计算 `salePrice`
- 添加多个新的 console.log()，以输出更改前后的 `total` 与 `salePrice` 值。

```javascript
// 主要程序

let product = reactive({price = 5, quantity = 2})
let total = 0

let salePrice = 0 //  ← NEW
...

effect(() => { 
    total = product.price * product.quantity 
})

effect(() => { 
    salePrice = product.price * 1.2
}) //  ← NEW

...

console. log( '更新前， total 值为 ${total} (应为 10)， salePrice 值为 ${salePrice} (应为 6)')  //  ← NEW

product.quantity = 3 
console. log( '更新后， total 值为 ${total} (应为 15)，salePrice 值为 ${salePrice} (应为 6)')  //  ← NEW

product.price = 10  //  ← NEW
console. log( '二次更新后， total 值为 ${total} (应为 30)，salePrice 值为 ${salePrice} (应为 12)')  //  ← NEW

```

你可能会想着：
> 如果我在effect-total当中调用salePrice进行计算，会发生什么呢？

会有BUG。🤯

## 原来的代码还有问题存在

当我们将计算方式改为:

```javascript
effect(() => {
    total = salePrice * product.quantity
})

effect(() => { 
    salePrice = product.price * 1.2
}) //  ← NEW
```

的时候。一旦我们修改了 product.price，那么total会发生什么？

total无法改变。因为很明显: salePrice 还不是一个响应式的数据。即使你使 salePrice 发生了数据上的更新，也无法使 total 对其提出响应。

那么我们应该如何使 salePrice 变成一个响应式的数据呢？

在VUE3 的 compositions API中，我们可以使用ref() 函数进行实现。

## ref() 函数

:::info
`ref()` 函数接受一个值，并返回一个可响应、可变的 Ref 对象。在该对象中，拥有一个单独的属性 `.value` 来指向对应的值。
:::

对于上述的代码，当我们使用`ref()`函数时，它们应该被改写为：

```javascript
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

```

这里为了之后代码运行的准确性，将两个 `effect` 的位置进行了调换，并在`salePrice`后调用`.value`。

那么对于我们当前自己写的响应式引擎，我们应该要怎么定义`ref()`函数呢？

这里有两种方法：

### 依然使用reactive()函数实现🤯

简单的调用 `reactive()` 函数，将ref接收到的传参传入reactive函数中：

```javascript
function ref(initialValue) {
    return reactive({ value: initialValue })
}
```

在这个例子中，可以。但是在 VUE3 中，并不是直接调用该函数进行实现的。

:::tip VUE3不使用该方法定义ref()的原因

其一:
ref() 的适用范围最开始就被定义为： "只暴露一个属性，也就是 'value' 本身"。如果我们使用 `reactive()` 函数进行定义，那么在技术上说，我们就可以在使用了`ref()` 进行定义的数据(例如对象)身上添加更多新的属性。而这样就违背了 `ref` 这个函数的定义了。

毕竟 `ref` 只应该被当成**为包装一个内部值进行服务**的简单函数，而不应该被当成一个通常我们所使用的繁杂的响应式对象。

其二：
在VUE中，`ref`返回的对象实际上有些较为特殊的标记属性，这些标记属性可以使VUE3通过`isRef`等相关的判断语句，判断出这个对象是一个`ref`对象还是一个常用响应式对象。这在很多情况下是较为必要的。

其三：
性能问题。即使`ref`返回的对象有些其他的标记属性，它的判断复杂程度也比常用响应式对象来得简单得多。因此使用下文中所提供的方法会使`ref`的编译更为迅速。

:::

所以我们不妨来看看VUE3是怎么做的：

### 返璞归真——使用对象访问器(Javascript 自身的 计算属性)Object Accessor

对象访问器是用于获取/设定值的函数。你可以简单理解为 JS 自带的 getter 与 setter (不是 Object.defineproporty 的那个)。
让我们先看一个例子：

```javascript
let user = {
    firstName = 'Word',
    lastName = 'Press',

}
```

让我们在里面声明两个函数：

```javascript
let user = {
    firstName = 'Word',
    lastName = 'Press',
    get fullName() { 
        return `${this.firstName} ${this.lastName}`
    },

    set fullName(value) {
        [this.firstName, this.lastName] = value.split(' ')  
    }

}
```

当我们需要获取 fullName 时:

```javascript
console.log("全名为 " + `${user.fullName}` )
```

当我们需要修改 fullName 时:

```javascript
user.fullName = 'Vue Press'
```

这便是在 fullName 中使用 getter 和 setter 的正确方法。

那么在VUE3中是如何使用这类函数定义ref()的呢？它的核心思想是这样的：

```javascript
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
```

虽然VUE3源码中对于`ref()`函数的定义会更复杂一点点，但是它的核心思想差不多是这样的。

由此，主要程序变为：

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

:::tip
如果你查阅了vue3的源码，你可能会发现，ref也是可以传入一个对象的。虽然这并不是vue所推荐的创建响应式对象的选项，但是为了防止你执意使用它，vue添加了一个判断语句。

以下是vue针对ref的源码(这些是你在源码上执行build之后可以看到的代码，具体操作可以看之后的[这一篇](./VUE3的数据响应式_补.md#引入vue3源码))：

```javascript
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (shared.hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, newVal);
    }
  }
}
```

你会发现：VUE在设置`.value`的时候使用了`this._value = __v_isShallow ? value : toReactive(value)`语句。

而同样在源码中， `toReactive()` 函数是这样的：

```javascript
const toReactive = (value) => shared.isObject(value) ? reactive(value) : value;

```

你可以先不了解`shared`是什么，毕竟他不在我们的文章范围内，但是你应该可以通过这个函数的命名发现，它是用于**判断传入的值是不是一个对象**的。因此你可以通过这个三元表达式发现：

$\text{当VUE通过该函数判断到ref()函数传入了一个对象之后，依然会调用reactive()函数进行}$
$\text{响应式对象的创建。而通常情况下，他只是简单地将这个值进行返回。}$

所以为了让整个代码编译的时间稍微短那么一点点，还是老老实实用`reactive()`函数创建响应式对象吧！
:::

## 小总结

在这篇文章中，我们修复了代码遗留的两个BUG，分别是：

- [无论是否调用更新用函数都会执行track的问题](./VUE3的数据响应式_下.md#原来的代码出现了问题)
- [将更新用函数所绑定的值用于另一更新用函数导致的缺失响应式数据的问题](./VUE3的数据响应式_下.md#原来的代码还有问题存在)

我们使用了以下方法进行了修复：

- [引入 activeEffect 变量使 track 函数判断调用者](./VUE3的数据响应式_下.md#activeeffect-变量-与-独立的-effect-函数)
- [使用Object Accessor 定义ref函数以保存更新用函数所对应响应式数据](./VUE3的数据响应式_下.md#返璞归真使用对象访问器javascript-自身的-计算属性object-accessor)

---

你可能学过VUE的 Composition API, 那么这时你可能会想：

> 说了这么多，为啥这里使用两个 effect 去定义需要被计算才可以得出的变量？
> 我为啥不用计算属性(computed properties)直接写呢？

因此下一章节，我们将继续修订我们的代码。甚至让它在直接调用VUE自身同名函数时，也可以成功运行。
