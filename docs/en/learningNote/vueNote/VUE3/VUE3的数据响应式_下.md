---
title: How is Vue 3's data reactivity implemented? (Part 3)
category:
- VUE
- Web
tag:
- VUE3
- advanced
order: 3
---

## Overview

Here I'll walk you through how Vue 3 implements data reactivity, starting from how the source is put together. This is part three.

Reference: [Vue Mastery — Vue 3 Reactivity](https://www.vuemastery.com/courses/vue-3-reactivity/)

## Recap of the previous part

In the previous post, to get data reactivity we used two new ES6 syntaxes, Reflect and Proxy, which made our code look more and more like the Vue 3 syntax we set out to understand:

- [Embracing the new generation — using Reflect to configure the Proxy handler](./VUE3的数据响应式_中.md#embracing-the-new-generation-—-using-reflect-to-configure-the-proxy-handler)
- [Wrapping the handler up](./VUE3的数据响应式_中.md#wrapping-the-handler-up)
- [Back to the original code — letting the three functions run by themselves](./VUE3的数据响应式_中.md#back-to-the-original-code-—-letting-the-three-functions-run-by-themselves)

In this post we'll keep following Vue 3's reactivity and patch up the BUGs left over from the previous part.

## The original code has a problem

First let's copy the original code over:

```javascript
// targetMap related

const targetMap = new WeakMap()

function track(target, key) {

    // use the passed object as target, find the matching depMap
    let depMap = targetMap.get(target)
    // in case there is no depMap yet, let's just make a new one
    if (!depMap) {
        targetMap.set(target, (depMap = new Map()))
    }

    // use the passed property value as key, find the matching dep
    let dep = depMap.get(key)
    // in case there is no dep yet, let's just make a new one
    if (!dep) {
        depMap.set(key, (dep = new Set()))
    }
    // add the effect we defined to dep
    dep.add(effect)
}

function trigger(target, key) {

    // use the passed object as target, find the matching depMap
    let depMap = targetMap.get(target)
    // in case there is no depMap yet, let's just make a new one
    if (!depMap) {
        // if depMap does not exist there is nothing to run, just skip
        return
    }
    
    // use the passed property value as key, find the matching dep
    let dep = depMap.get(key)
    // if dep exists
    if (dep) {
        // walk every effect in dep and run them
        dep.forEach((effect) => {effect()})
    }
    // if dep does not exist there is nothing to run, just skip
}
```

```javascript
// reactiveFunction related

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

```

```javascript
// main program
import { reactive } from './reactiveFunction.js'

let product = reactive({price = 5, quantity = 2})
let total = 0
let effect = () => { total = product.price * product.quantity }// cut down to an arrow function

...
// first declare that the property should be tracked; here track already fires when effect runs, so delete this

// then run the update function once to get the first value of total
effect()
console.log('total = ' + total)

product.price = 10
// after updating `price`, trigger() has in principle already been called, so delete this

console.log('total = ' + total)
```

So what's wrong with this code?

## BUG No.1 — it re-runs on every single read

For the current `main.js`, there's nothing wrong with the code above. So let's add one line of code and see what happens.

```javascript
// main program
import { reactive } from './reactiveFunction.js'

let product = reactive({price = 5, quantity = 2})
let total = 0
let effect = () => { total = product.price * product.quantity }// cut down to an arrow function
...
// first declare that the property should be tracked; here track already fires when effect runs, so delete this

// then run the update function once to get the first value of total
effect()
console.log('total = ' + total)

price = 10
// after updating `price`, trigger() has in principle already been called, so delete this

console.log('after changing price, price is now: ' + product.price) // the newly added line

console.log('total = ' + total)
```

When we add the line `console.log('after changing price, price is now: ' + product.price)`, what does our code make JS do when it gets here?

> Call the get method inside the Proxy handler?

And then?

> Use the Reflect.get function to get the value?

And then?

> Call the track method?

This is exactly where the problem shows up!

What we originally wanted was "as long as the *update function* is called, we let the program call *track*, to put the *update function* into the Set", right?

But with the current code, whether you're an *update function* or not, as soon as you call the get method inside the Proxy handler once, it will ~~run track once, then walk through weakMap, Map, Set, then check whether effect got put in, then finish checking, then walk back out step by step, and then return the result~~.

Pretty unnecessary, isn't it? All we need is for the program to call *track* only when the *update function* is called. So we need to change it.

### The activeEffect variable and a standalone effect function

We bring in an activeEffect variable, and use it to hold the *update function* that is currently running.

```javascript
...
let activeEffect = null
...
```

Then we create a standalone effect function, and have it take the old *update function* as its argument. And carry out the following steps:

```javascript
...
function effect(eff) {
    // first assign the passed argument to activeEffect
    activeEffect = eff
    // then run activeEffect
    activeEffect()
    // finally set it back to null
    activeEffect = null
}
...
```

So for the old *update function*, we need to rewrite it as:

```javascript
// main program
...
effect(() => { 
    total = product.price * product.quantity 
})
...

```

 And since after calling the new `effect function` it can call the anonymous function passed in by itself, we can delete the part of the original code that *calls the effect function directly*.

```javascript
// main program

let product = reactive({price = 5, quantity = 2})
let total = 0
...

effect(() => { 
    total = product.price * product.quantity 
})

...
// first declare that the property should be tracked; here track already fires when effect runs, so delete this

// then run the update function once to get the first value of total; that already fires when effect is called, so delete this
// effect()  ← NEW COMMENTS
console.log('total = ' + total)

product.price = 10
// after updating `price`, trigger() has in principle already been called, so delete this

console.log('after changing price, price is now: ' + product.price)

console.log('total = ' + total)
```

Of course, we're nowhere near done.

### Making changes inside track

We need to update the `track` function, and have it use this new **activeEffect**.

::: info
This is the old `track` function:

```javascript
// targetMap related

const targetMap = new WeakMap()

// here we bring over the activeEffect and effect functions written earlier
let activeEffect = null

function effect(eff) {
    // first assign the passed argument to activeEffect
    activeEffect = eff
    // then run activeEffect
    activeEffect()
    // finally set it back to null
    activeEffect = null
}

function track(target, key) {

    // use the passed object as target, find the matching depMap
    let depMap = targetMap.get(target)
    // in case there is no depMap yet, let's just make a new one
    if (!depMap) {
        targetMap.set(target, (depMap = new Map()))
    }

    // use the passed property value as key, find the matching dep
    let dep = depMap.get(key)
    // in case there is no dep yet, let's just make a new one
    if (!dep) {
        depMap.set(key, (dep = new Set()))
    }
    // add the effect we defined to dep
    dep.add(effect)
}
...
```

:::

As we said earlier, "only when the *update function* is called do we let the program call *track*, to put the *update function* into the Set".
But under the current conditions, that sentence turns into: "only when the *effect function* is called, and activeEffect is not null, can *track* put the *update function* — that is, the activeEffect which at this point has been assigned the anonymous function — into the Set". Let's write it that way.

```javascript
// targetMap related

const targetMap = new WeakMap()

// here we bring over the activeEffect and effect functions written earlier
let activeEffect = null

function effect(eff) {
    // first assign the passed argument to activeEffect
    activeEffect = eff
    // then run activeEffect
    activeEffect()
    // finally set it back to null
    activeEffect = null
}

function track(target, key) {
    // if activeEffect is not null
    if (activeEffect) {
        // use the passed object as target, find the matching depMap
        let depMap = targetMap.get(target)
        // in case there is no depMap yet, let's just make a new one
        if (!depMap) {
            targetMap.set(target, (depMap = new Map()))
        }

        // use the passed property value as key, find the matching dep
        let dep = depMap.get(key)
        // in case there is no dep yet, let's just make a new one
        if (!dep) {
            depMap.set(key, (dep = new Set()))
        }
        // add the activeEffect we defined to dep ← new
        dep.add(activeEffect)
    }
    
}
...
```

::: tip
Why can we use the activeEffect variable to restrict it here? Because in the earlier situation:

- Whether you were **calling the old effect function** or **reading the corresponding value**, since you need to read reactive data off the object, you would definitely *go through the getter* and *call the track method*;
- the track method didn't do much restricting, so it **couldn't tell** why the program was calling it.

Whereas once we have activeEffect, the situation is:

- Whether you're **calling the new effect function** or **reading the corresponding value**, since you need to read reactive data off the object, you will definitely *go through the getter* and *call the track method*;
- the track method at this point **must check** whether activeEffect exists before it can go any further:
    activeEffect is null when it hasn't been assigned, and **the new effect function** does the following when called:
        - first "assign the anonymous function to activeEffect", at which point activeEffect's value is the anonymous function itself;
        - "call activeEffect";
        - after going through the flow "called the new effect → read reactive data off the object → went through the getter",
        - only then does it "call the track method".
    And at that point activeEffect's value is the anonymous function itself, not null, so it carries on executing.
    In other words, only when activeEffect exists can the track function run; otherwise it returns straight away.

So the activeEffect variable can be used to restrict it here.
:::

And so BUG No.1 is fixed.

## Before hunting other BUGs, let's fatten up the original code

Let's make the main code a bit richer:

- add a variable `salePrice` for the sale price, starting at 0.
- add a new effect to calculate `salePrice`
- add several new console.log() calls, to print the `total` and `salePrice` values before and after the changes.

```javascript
// main program

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

console. log( 'before the update, total is ${total} (should be 10), salePrice is ${salePrice} (should be 6)')  //  ← NEW

product.quantity = 3 
console. log( 'after the update, total is ${total} (should be 15), salePrice is ${salePrice} (should be 6)')  //  ← NEW

product.price = 10  //  ← NEW
console. log( 'after the second update, total is ${total} (should be 30), salePrice is ${salePrice} (should be 12)')  //  ← NEW

```

You might be thinking:
> What happens if I call salePrice inside effect-total to do the calculation?

There'll be a BUG. 🤯

## The original code still has a problem

When we change the calculation to:

```javascript
effect(() => {
    total = salePrice * product.quantity
})

effect(() => { 
    salePrice = product.price * 1.2
}) //  ← NEW
```

then once we modify product.price, what happens to total?

total can't change. Because obviously: salePrice still isn't reactive data. Even if you update salePrice, total can't react to it.

So how do we make salePrice reactive data?

In Vue 3's Composition API, we can use the ref() function to do it.

## The ref() function

::: info
The `ref()` function takes a value and returns a reactive, mutable Ref object. In that object there is a single property `.value` that points at the corresponding value.
:::

For the code above, when we use the `ref()` function, it should be rewritten as:

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

Here, for the sake of the code running correctly later on, the two `effect`s have been swapped around, and `.value` is called after `salePrice`.

So how should we define the `ref()` function for the reactive engine we've written ourselves?

There are two ways:

### Just implement it with reactive() 🤯

Simply call the `reactive()` function, passing into it whatever ref receives:

```javascript
function ref(initialValue) {
    return reactive({ value: initialValue })
}
```

In this example, that works. But in Vue 3, that's not how it's actually implemented.

::: tip Why Vue 3 doesn't define ref() this way

First:
The scope of ref() was defined from the very start as: "only expose one property, namely 'value' itself". If we define it with the `reactive()` function, then technically we could add more new properties to the data defined with `ref()` (an object, say). And that goes against the definition of the `ref` function.

After all, `ref` should only be treated as **a simple function that serves to wrap an internal value**, and not as one of the complicated reactive objects we normally use.

Second:
In Vue, the object returned by `ref` actually carries some rather special marker properties, and those markers let Vue 3 tell, through `isRef` and similar checks, whether this object is a `ref` object or an ordinary reactive object. That's necessary in a lot of cases.

Third:
Performance. Even though the object returned by `ref` carries some other marker properties, checking it is much simpler than checking an ordinary reactive object. So using the approach given below makes `ref` compile faster.

:::

So let's take a look at how Vue 3 does it:

### Back to basics — using an object accessor (JavaScript's own computed property), Object Accessor

An object accessor is a function used to get/set a value. You can simply think of it as JS's built-in getter and setter (not the Object.defineproporty kind).
Let's look at an example first:

```javascript
let user = {
    firstName = 'Word',
    lastName = 'Press',

}
```

Let's declare two functions inside it:

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

When we need to get fullName:

```javascript
console.log("the full name is " + `${user.fullName}` )
```

When we need to change fullName:

```javascript
user.fullName = 'Vue Press'
```

And that is the correct way to use a getter and setter in fullName.

So how does Vue 3 use this kind of function to define ref()? Its core idea is this:

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

The definition of the `ref()` function in the Vue 3 source is a little more complicated, but its core idea is roughly this.

With that, the main program becomes:

```javascript
// main program

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

console. log( 'before the update, total is ${total} (should be 12)  , salePrice is ${salePrice} (should be 6)')  //  ← NEW

product.quantity = 3 
console. log( 'after the update, total is ${total} (should be 18), salePrice is ${salePrice} (should be 6)')  //  ← NEW

product.price = 10  //  ← NEW
console. log( 'after the second update, total is ${total} (should be 36), salePrice is ${salePrice} (should be 12)')  //  ← NEW

```

::: tip
If you've looked at the Vue 3 source, you may have noticed that ref can be passed an object too. That isn't the option Vue recommends for creating reactive objects, but just in case you insist on using it, Vue added a check.

Here is Vue's source for ref (this is what you see after running a build on the source; see [this post](./VUE3的数据响应式_补.md#introducing-the-vue-3-source) later for the details):

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

You'll notice: when Vue sets `.value` it uses the statement `this._value = __v_isShallow ? value : toReactive(value)`.

And also in the source, the `toReactive()` function looks like this:

```javascript
const toReactive = (value) => shared.isObject(value) ? reactive(value) : value;

```

You don't need to know what `shared` is for now — it's outside the scope of this article — but you should be able to tell from the function's name that it's used to **check whether the value passed in is an object**. So from that ternary you can see:

$\text{once VUE has used this function to work out that an object was passed to ref(), it will still call reactive() to}$
$\text{create the reactive object. Normally, though, it simply returns the value.}$

So to shave a tiny bit off the whole compile time, just be a good kid and use the `reactive()` function to create reactive objects!

:::

## Wrap-up

In this post we fixed two BUGs left in the code, namely:

- [the problem that track runs whether or not the update function is called](./VUE3的数据响应式_下.md#the-original-code-has-a-problem)
- [the problem of missing reactive data when a value bound to one update function is used by another update function](./VUE3的数据响应式_下.md#the-original-code-still-has-a-problem)

We used the following methods to fix them:

- [bringing in the activeEffect variable so track can tell who's calling](./VUE3的数据响应式_下.md#the-activeeffect-variable-and-a-standalone-effect-function)
- [using an Object Accessor to define the ref function, so the reactive data corresponding to the update function is kept](./VUE3的数据响应式_下.md#back-to-basics-—-using-an-object-accessor-javascript-s-own-computed-property-object-accessor)

---

You may have learned Vue's Composition API, in which case you might be thinking:

> After all that, why use two effects here to define a variable that has to be computed?
> Why not just write it with computed properties?

So in the next chapter we'll keep revising our code. We'll even make it run successfully when it directly calls Vue's own functions of the same name.

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../learningNote/vueNote/VUE3/VUE3的数据响应式_下.md). The translation is for reference only.
Translation time: 2026-11-05
:::
