---
category:
  - VUE
  - Web
tag:
  - VUE3
  - COMPARE
---
# Vue3 与 Vue2 在数据响应式上的区别

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
