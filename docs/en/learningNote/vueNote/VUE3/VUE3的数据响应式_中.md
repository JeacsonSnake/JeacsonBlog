---
title: How is Vue 3's data reactivity implemented? (Part 2)
category:
- VUE
- Web
tag:
- VUE3
- advanced
order: 2
---

## Overview

This is where I walk you through how Vue 3 implements data reactivity, starting from how the source is put together. This is part two.

Reference: [Vue Mastery — Vue 3 Reactivity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## Recap of part one

In part one we reworked our own code three times to achieve data reactivity, and it ended up looking more and more like the reactive engines you normally meet:

- [Storing the "update function" in a suitable container — a Set](./VUE3的数据响应式_上.md#storing-the-update-function-in-a-suitable-container-—-a-set)
- [Stringing all the Sets together into a Map](./VUE3的数据响应式_上.md#stringing-all-the-sets-together-into-a-map)
- [Stringing all the Maps together into a WeakMap](./VUE3的数据响应式_上.md#stringing-all-the-maps-together-into-a-weakmap)

In this part we'll follow Vue 3's reactivity and finish our own reactive engine, step by step.

## Making them run on their own — a quotation

At the end of part one I wrote:

> Up to this point we can still only use manual updates to observe the values we want to observe; there is no way to make the *update function* **Set** of a *specific property* on a *reactive object* re-run by itself.

We were still calling `track()` and `trigger()` by hand to record and fire our `effect()`. But obviously we would rather the engine called them for us. So is there some way to get those functions invoked when the engine reads and sets the properties in question?

## How does JS read and modify data? — getter and setter

If you know JS reasonably well, you probably know that data in JavaScript is normally read and modified through a `getter` method and a `setter` method. When JS wants to read a value it calls the `getter`; when it wants to change a value it calls the `setter`. JS handles all of that for you automatically.

> Hold on — so if we can somehow make JS call `track()` inside the `getter` and `trigger()` inside the `setter`, the engine would call them automatically, wouldn't it?

Exactly. Broadly speaking: if the engine accesses a property on an object, that is, uses the `get` method, that is the moment we want to call `track()` and save the `effect()` we wrote; and if the engine modifies a property on an object, that is, uses the `set` method, that is the moment we want to call `trigger()` and run the `effect()` we saved earlier.

## In the beginning — Object.defiineProperty

Before ES2015, most reactive engines — Vue included — detected changes with a method on JavaScript's own Object class: **Object.defiineProperty**.

Put simply, it can modify the data you pass in through its built-in `getter` and `setter` functions. Under JavaScript's rules, when it wants to read a value it prefers the `getter` on **Object.defiineProperty**; when it wants to change a value it prefers the `setter` on **Object.defiineProperty**. At that point we can define both ourselves and get reactive data.

::: tip
If you want to know more about how **Object.defiineProperty** is configured, there is [a post on this blog](../../JSNote/defineproperty方法.md) about exactly that.
:::

But **Object.defiineProperty** is an old ES5 method and has, in a sense, grown bloated and dated. So we can reach for the new features in ES6 — **Reflect** and **Proxy**.

## The new generation — Proxy and Reflect

Below I'll go through how proxying works with Proxy and Reflect:

### 1.Reflect

Reflect is a built-in object that provides methods for intercepting JavaScript operations.
Take the **product** object that wrapped `price` and `quantity` earlier:

```javascript
let product = {price = 5, quantity = 2}
```

When we want to read a property off that object, there are three ways to do it:

1. The classic *dot notation*:

    ```javascript
    console.log("the value of quantity is: " + product.quantity)
    ```

2. The second most classic, *bracket notation*:

    ```javascript
    console.log("the value of quantity is: " + product['quantity'])
    ```

3. *Reflect*'s *get method*, which is the one we want:

    ```javascript
    console.log("the value of quantity is: " + Reflect.get(product, 'quantity'))
    ```

You may be wondering:
> Reflect.get looks much like the functions we wrote before? The `track` function we defined back when we used `weakMap` also took *target* and *key*.

True — but compared with *dot notation* and *bracket notation*, *Reflect* has different powers. I'll keep you in suspense: once we know what Proxy is, why we use Reflect becomes obvious.

### 2.Proxy

Put simply, a Proxy can act as the proxy value of some object, and the Proxy is itself an object.
Take the **product** object that wrapped `price` and `quantity` earlier:

```javascript
let product = {price = 5, quantity = 2}
```

If we try to create a Proxy object to proxy `product`, then after consulting [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and friends we would write:

```javascript
let proxiedProduct = new Proxy(product, {})
```

When we configure it like that and call `console.log(proxiedProduct.quantity)` to print, JS takes these steps:

- It calls the Proxy, here `proxiedProduct`;
- the Proxy calls the object it proxies, here `product`;
- the object returns the requested value, here `product.quantity`, to the Proxy;
- the Proxy puts that value into the console log.

From this we can see that what a Proxy does is, in essence, object delegation. When you construct a Proxy with the `Proxy(target, handler)` constructor function:

- the first argument, `target`, is the object you want the Proxy to wrap (it can be any kind of object, including a native array, a function, or even another Proxy);
- the second, `handler`, is normally an object *whose properties are usually functions*, and each function defines what the proxy does when a given operation runs.

## Embracing the new generation — using Reflect to configure the Proxy handler

Inside the handler we can pass a **trap function** that intercepts *basic operations such as property lookup, enumeration or function calls*.
So in our example we can write:

```javascript
let product = {price = 5, quantity = 2}
let proxiedProduct = new Proxy(product, {
    get(target, key) {
        return target[key]
    }
})
console.log(proxiedProduct.quantity)
```

Like **Object.defiineProperty**, using a getter lets us intercept JS when it reads a value. Here, though, we use Reflect in place of the second most classic *bracket notation*:

```javascript
let product = {price = 5, quantity = 2}
let proxiedProduct = new Proxy(product, {
    get(target, key, receiver) {
        return Reflect.get(target, key, receiver)
    }
})
console.log(proxiedProduct.quantity)
```

You may notice an extra `receiver` argument. Here is how the ES6 source describes this `get` trap:

```typescript
/**
 * A trap for getting a property value.
 * @param target The original object which is being proxied.
 * @param p The name or `Symbol` of the property to get.
 * @param receiver The proxy or an object that inherits from the proxy.
 */

```

In plain words: `target` is the original object being proxied, `p` is the name — or `Symbol` — of the property being read, and `receiver` is the proxy itself or an object that inherits from it.

And this is one of Reflect's distinctive powers. For a **getter**, the `receiver` argument guarantees that when our object inherits a *value or object of the same name* from another object, `this` points correctly at the child object rather than the parent — which avoids some of the reactivity warnings you get in Vue 2.

::: tip
For a deeper answer, see [javascript.info — proxying a getter](https://zh.javascript.info/proxy#dai-li-yi-ge-getter); if you would rather read it in English, go to [javascript.info on proxying a getter](https://javascript.info/proxy?tdsourcetag=s_pctim_aiomsg#proxying-a-getter).
:::

We can define the set method the same way:

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

Here the obviously new argument is `value`, the value being written.

## Wrapping the handler up

To make the code above look more like Vue 3's own source, let's wrap the handler:

- create a function and call it **reactive** — if you write Vue 3 with the Composition API, the word will be familiar;
- inside the function, create a `handler` constant that wraps the `getter` and `setter` we defined;
- have the function return the Proxy object.

The code:

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

With that in place, when we need to declare an object we just pass it to `reactive` and use the proxy it returns as if it were the original object.
Our earlier product object becomes:

```javascript
let product = reactive({price = 5, quantity = 2})
```

## Back to the original code — letting the three functions run by themselves

Let's copy the original code over:

```javascript
// targetMap related

const targetMap = new WeakMap()

function track(target, key) {

    // use the passed object as target, find the matching depMap
    let depMap = targetMap.get(target)
    // if there is no depMap yet, make a new one
    if (!depMap) {
        targetMap.set(target, (depMap = new Map()))
    }

    // use the passed property as key, find the matching dep
    let dep = depMap.get(key)
    // if there is no dep yet, make a new one
    if (!dep) {
        depMap.set(key, (dep = new Set()))
    }
    // add the effect we defined to dep
    dep.add(effect)
}

function trigger(target, key) {

    // use the passed object as target, find the matching depMap
    let depMap = targetMap.get(target)
    // if there is no depMap yet, make a new one
    if (!depMap) {
        // if depMap does not exist there is nothing to run, so skip
        return
    }
    
    // use the passed property as key, find the matching dep
    let dep = depMap.get(key)
    // if dep exists
    if (dep) {
        // walk every effect in dep and run it
        dep.forEach((effect) => {effect()})
    }
    // if dep does not exist there is nothing to run, so skip
}
```

```javascript
// main program


let product = {price = 5, quantity = 2}
let total = 0

...

let effect = () => { total = product.price * product.quantity }// cut down to an arrow function

...

// first declare that the property should be tracked, price here as an example
track(product, "price")
// then run the update function once to get the first value of total
effect()
console.log('total = ' + total)

product.price = 10
// after updating `price`, call `trigger(product, "price")`
trigger(product, "price")
console.log('total = ' + total)
```

As [discussed above](./VUE3的数据响应式_中.md#how-does-js-read-and-modify-data-—-getter-and-setter), we want to stuff these three functions into the `reactive` function we built in [the previous section](./VUE3的数据响应式_中.md#wrapping-the-handler-up) to get reactive data.

```javascript
// reactiveFunction related
...

function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            // save the value we get first
            let result = Reflect.get(target, key, receiver)
            // declare that the key on target should be tracked
            track(target, key)
            // return result
            return result
        },

        set(target, key, value, receiver) {
            // save the old value first
            let oldValue = Reflect.get(target, key, receiver)
            // assign the new value to the target property and keep the result
            let result = Reflect.set(target, key, value, receiver)
            // if old and new values differ
            if (oldValue != result) {
                // call trigger() after updating the key on target
                trigger(target, key)
            }
            return result
        }
    }
    return new Proxy(target, handler)
}

...
```

Done! The original code can now be rewritten as:

```javascript
// main program

let product = {price = 5, quantity = 2}
let total = 0
...

let effect = () => { total = product.price * product.quantity }// cut down to an arrow function

...
// first declare that the property should be tracked; since the track function already fires when effect runs, delete this

// then run the update function once to get the first value of total
effect()
console.log('total = ' + total)

product.price = 10
// after updating `price`, trigger() has in principle already been called, so delete this

console.log('total = ' + total)
```

And with that your code has become **reactively aware**! 🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
*...though there are still a few bugs we haven't dealt with.*

## Wrap-up

In this post we got our code to implement reactive data. To do it we used two new ES6 features, Reflect and Proxy, which made it look more and more like the Vue 3 syntax we set out to understand:

- [Embracing the new generation — using Reflect to configure the Proxy handler](./VUE3的数据响应式_中.md#embracing-the-new-generation-—-using-reflect-to-configure-the-proxy-handler)
- [Wrapping the handler up](./VUE3的数据响应式_中.md#wrapping-the-handler-up)
- [Back to the original code — letting the three functions run by themselves](./VUE3的数据响应式_中.md#back-to-the-original-code-—-letting-the-three-functions-run-by-themselves)

There are still a few bugs in our code, though. Never mind — we'll fix them all in the next post.

::: important
This article was translated by Hermes Agent; the original text can be found at [here](../../../learningNote/vueNote/VUE3/VUE3的数据响应式_中.md). The translation is for reference only.
Translation time: 2026-11-05
:::
