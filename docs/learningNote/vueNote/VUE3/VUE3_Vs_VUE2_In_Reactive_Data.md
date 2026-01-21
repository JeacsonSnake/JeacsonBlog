---
title: Vue3 与 Vue2 在数据响应式上的区别
category:
  - VUE
  - Web
tag:
  - VUE3
  - COMPARE
---
## 一、Vue3 与 Vue2 在对象数据响应式上的区别

在 vue2 中，所有数据在底层都是通过使用Object.defineProperty()进行劫持后实现数据响应的。这使得如果一个数据为对象时，vue 无法对这个对象里面的元素进行监听，导致对象里的值无法实现响应式。

```javascript
let o = {};

Object.defineProperty(o, 'prop1' {
    //使属性可删除
    configurable: true,
    //有人读取o的某个属性时调用
    get() {
        return object.prop1;
    },
    //有人修改o的某个属性时调用
    set(value) {
        object.prop1 = value;
    }
})

Object.defineProperty(o, 'prop2' {
    //使属性可删除
    configurable: true,
    //有人读取o的某个属性时调用
    get() {
        return object.prop2;
    },
    //有人修改o的某个属性时调用
    set(value) {
        object.prop2 = value;
    }
})
......
```

但是在 vue3 中，如果一个数据为对象，则会在底层使用Proxy（ES6 的新语法）模块进行对象的代理，也就是调用 reactive 函数（当然如果使用了 ref 函数进行对象的定义，ref会直接帮助调用 reactive 函数）

```javascript
new Proxy(object, {
    //有人读取object的某个属性时调用
    get(target, prop) {
        return target[prop];
    },
    //有人修改object的某个属性，或者为object添加新的属性值时调用
    set(target, prop, value) {
        target[prop] = value;
    }
    //有人删除object的某个属性时调用
    deleteProperty(target, prop) {
        return delete target[prop];
    }
})
```

在此基础上，为了框架的可维护性，我们会使用Reflect模块进行对象的读取：

```javascript
new Proxy(object, {
    //有人读取object的某个属性时调用
    get(target, prop) {
        return Reflect.get(target, prop);
    },
    //有人修改object的某个属性，或者为object添加新的属性值时调用
    set(target, prop, value) {
        Reflect.set(target, prop, value);
    }
    //有人删除object的某个属性时调用
    deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    }
})
```

总而言之， vue3响应式的实现原理为：

- 通过Proxy(代理)模块：拦截对象中任意属性的变化，包括：属性值的读写、属性的添加、属性的删除等；
  
- 通过Reflect(反射)模块：对被代理对象，即源对象的属性进行操作。

参考：

Proxy:

<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy>

Reflect:

<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect>

## 二、响应式数据上增加新的属性时，Vue3 与 Vue2 在数据响应式上的区别

在Vue2中，当我们创建一个响应式对象之后，没法直接在该响应式对象上添加新的响应式属性。

例如，在以下代码中:

```javascript
...
// 这里认为在vue2的data中定义了如下属性
let product = {
    price: 5,
    quatity: 2
}
...
```

假设我们通过直接在该响应式对象上添加了一个新的属性"name":

```javascript
product.name = 'shoes'
```

当我们尝试读取它的时候，他可以正常输出：

```javascript
console.log("product.name is now " + `${product.name}`)
```

但是假设我们修改了它，然后再尝试读取时：

```javascript
product.name = 'socks'

console.log("product.name is now " + `${product.name}`)
```

会发现该属性并没有被改变。因为它本来就不是一个响应式数据。

::: tip 为什么？
在Vue2中，get 和 set 的钩子是在我们定义该对象时被分别添加到各个属性下的，换句话说，当我们尝试使用 `product.name` 进行定义时，这个新增的属性不会以一个响应数据的形式添加到原有的对象中。因此如果我们需要在外部添加该属性，我们就需要使用Vue2自带的set方法：

```javascript
Vue.set(product, name, 'shoes')
```

但是在VUE3中，因为所有的数据都使用了Proxy函数进行了代理，因此当我们直接在该响应式对象上添加新的属性时，他便一定会经过Proxy函数的handler进行添加。于是这个在原对象创建后才被添加入的属性就一定会是响应式数据。

:::
