---
title: The Object.defineproperty Method
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## Brief

Object.defineProperty is a fairly advanced function under the Object class in JavaScript; it can use its built-in *getter* and *setter* to modify the data passed in. It was generally used by the various old JS frameworks for reactive data. Because the method is inherently bloated and better replacements now exist, most frameworks today prefer the new Proxy/Reflect approach from ES6.

## A simple sample

```javascript
        let number = 18;
        let person = {
            name: 'Jeasfds',
            sex: ' male'
        }

        Object.defineProperty(person, 'ages', {
            // value: 18,
            enumerable: true,//controls whether the property can be enumerated (false by default)
            writable:true,//controls whether the property can be modified (false by default)
            configurable:true,//controls whether the property can be deleted (false by default)


            //when someone reads the 'age' property of 'person', the get function (getter) is called, and its return value is the age value
            get() {
                return number;
            },
            //when someone modifies the 'age' property of 'person', the set function (setter) is called, and it receives the specific new value
            set(value) {
                number = value;
            }
        })

```

::: important
This article was translated by Hermes Agent; the original text can be found at ../../learningNote/JSNote/defineproperty方法.md. The translation is for reference only.
Translation time: 2026-11-05
:::
