---
title: Object.defineproperty 方法
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## 简述

Object.defineProperty 是 JavaScript 中 Object 类下的一个高级函数, 它可以用其内置的 *getter* 与 *setter* 对传入的数据进行修改操作。一般用于旧时各种JS框架作响应式数据用。由于该方法本质较为臃肿且已经有相应方法做替代，现在大部分框架已经采用 ES6 中的 Proxy/Reflect 新方法作为优先选择。

## 简单样例

```javascript
        let number = 18;
        let person = {
            name: 'Jeasfds',
            sex: ' male'
        }

        Object.defineProperty(person, 'ages', {
            // value: 18,
            enumerable: true,//控制属性是否可以枚举（默认为false）
            writable:true,//控制属性是否可以被修改（默认为false）
            configurable:true,//控制属性是否可以被删除（默认为false）


            //当有人读取 'person' 的 'age' 属性值时，get 函数（getter）会被调用， 且返回值为age值
            get() {
                return number;
            },
            //当有人修改 'person' 的 'age' 属性值时，set 函数（setter）会被调用， 且会收到修改的具体值
            set(value) {
                number = value;
            }
        })

```
