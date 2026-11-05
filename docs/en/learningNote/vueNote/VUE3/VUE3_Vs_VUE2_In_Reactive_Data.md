---
title: How Vue3 and Vue2 differ in data reactivity
category:
  - VUE
  - Web
tag:
  - VUE3
  - COMPARE
---
## 1. How Vue3 and Vue2 differ when it comes to object data reactivity

In vue2, all data is hijacked underneath with Object.defineProperty() to achieve data reactivity. That means when a piece of data is an object, vue can't watch the elements inside that object, so the values in the object can't be made reactive.

```javascript
let o = {};

Object.defineProperty(o, 'prop1' {
    //make the property deletable
    configurable: true,
    //called when someone reads a property of o
    get() {
        return object.prop1;
    },
    //called when someone modifies a property of o
    set(value) {
        object.prop1 = value;
    }
})

Object.defineProperty(o, 'prop2' {
    //make the property deletable
    configurable: true,
    //called when someone reads a property of o
    get() {
        return object.prop2;
    },
    //called when someone modifies a property of o
    set(value) {
        object.prop2 = value;
    }
})
......
```

But in vue3, when a piece of data is an object, it proxies the object underneath with the Proxy module (new syntax from ES6), that is, it calls the reactive function (and of course, if you define the object with the ref function, ref will help call the reactive function for you)

```javascript
new Proxy(object, {
    //called when someone reads a property of object
    get(target, prop) {
        return target[prop];
    },
    //called when someone modifies a property of object, or adds a new property to object
    set(target, prop, value) {
        target[prop] = value;
    }
    //called when someone deletes a property of object
    deleteProperty(target, prop) {
        return delete target[prop];
    }
})
```

On top of that, for the maintainability of the framework, we read objects through the Reflect module:

```javascript
new Proxy(object, {
    //called when someone reads a property of object
    get(target, prop) {
        return Reflect.get(target, prop);
    },
    //called when someone modifies a property of object, or adds a new property to object
    set(target, prop, value) {
        Reflect.set(target, prop, value);
    }
    //called when someone deletes a property of object
    deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    }
})
```

In short, the principle behind vue3's reactivity is:

- through the Proxy module: intercept changes to any property on the object, including reading and writing property values, adding properties, deleting properties, etc.;
  
- through the Reflect module: operate on the properties of the proxied object, that is, the source object.

References:

Proxy:

<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy>

Reflect:

<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect>

## 2. How Vue3 and Vue2 differ in data reactivity when a new property is added to reactive data

In Vue2, once we've created a reactive object, we can't add a new reactive property onto that reactive object directly.

For example, in the following code:

```javascript
...
// assume the following properties are defined in vue2's data
let product = {
    price: 5,
    quatity: 2
}
...
```

Suppose we add a new property "name" directly onto that reactive object:

```javascript
product.name = 'shoes'
```

When we try to read it, it prints out just fine:

```javascript
console.log("product.name is now " + `${product.name}`)
```

But suppose we modify it, and then try to read it again:

```javascript
product.name = 'socks'

console.log("product.name is now " + `${product.name}`)
```

You'll find that the property hasn't changed. Because it was never reactive data to begin with.

::: tip Why?
In Vue2, the get and set hooks are added to each property separately when we define the object; in other words, when we try to define it with `product.name`, this newly added property doesn't get added to the original object as reactive data. So if we need to add the property from outside, we have to use Vue2's built-in set method:

```javascript
Vue.set(product, name, 'shoes')
```

But in VUE3, because all data is proxied through the Proxy function, when we add a new property directly onto that reactive object, it will definitely go through the Proxy function's handler to be added. So a property added after the original object was created is guaranteed to be reactive data.

:::

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../../learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Reactive_Data.md. The translation is for reference only.
Translation time: 2026-11-05
:::
