---
title: 什么是Symbol
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## 定义——一个不会重复的原始数据类型

`Symbol`是ES6引入的一种新的原始数据类型，表示独一无二的值。它是JavaScript语言的第七种数据类型。

::: info
前六种是：undefined、null、布尔值(Boolean)、字符串(String)、数值(Number)、对象(Object)。
:::

基本数据类型不适用以new关键字新增, 因此它的创建方式如下：

```javascript
let Sym = Symbol()
```

其中你可以通过传入字符串(deescription)作为参数以作相关的标识：

```javascript
let Sym = Symbol('Diff description')

```

## 特点

- 独一无二

    ```javascript
    let Sym1 = Symbol('a')
    let Sym2 = Symbol('b')
    console.log(Sym1 === Sym2) // 输出 false
    ```

- 不能使用new关键字创建对象

    ```javascript
    let Sym1 = new Symbol('a')  // 不合法
    let Sym2 = Symbol('b')  // 合法
    ```

- Symbol值无法参与数值运算，无法通过隐式转换转为字符串

    ```javascript
    let Sym = new Symbol('calculate')
    let Num = Sym + 5 // Type Error
    ```

    但是可以用`toString()`方法将Symbol转为字符串，该字符串格式为`"Symbol(description)"`

    ```javascript
    let Sym = new Symbol('calculate')
    let StrSym = toString(Sym) // string: "Symbol('calculate')"
    ```

- 作为对象属性键无法用`.`运算符，但是可以使用方括号`[]`

    ```javascript
    let Sym = Symbol('Obj Symbol')
    let obj = {
        'name': 'Paul',
        'key': Sym,
        [Sym]: 'Im a symbol'
    }
    console.log(obj.key) // 合法
    console.log(obj[key]) // 合法
    console.log(obj.Sym) // 不合法
    console.log(obj[Sym]) // 合法
    ```

- 作为对象属性，无法被循环遍历，如for...in、for...of，也不会被- - Object.keys、Object.getOwnPropertyNames、JSON.stringify返回

```javascript
let obj = {};
let sym = Symbol('mySymbol');
obj[sym] = 'I am a Symbol!';

// for...in
for (let key in obj) {
    console.log(key); // 没有输出
}

// for...of
for (let key of Object.keys(obj)) {
    console.log(key); // 没有输出
}

// Object.keys
console.log(Object.keys(obj)); // 输出空数组 []

// Object.getOwnPropertyNames
console.log(Object.getOwnPropertyNames(obj)); // 输出空数组 []

// JSON.stringify
console.log(JSON.stringify(obj)); // 输出 "{}"
```

- Object.getOwnPropertySymbols方法，可以获取对象的所有 Symbol 属性名

    ```javascript
    let obj = {
        'name': 'Paul',
        [Symbol('Obj Symbol1')]: 'Im a symbol'
        [Symbol('Obj Symbol2')]: 'Im a symbol two'
    }
    targetObjSymbolArr = Object.getOwnPropertySymbols(obj) //targetObjSymbolArr = [Symbol('Obj Symbol1'), Symbol('Obj Symbol2')]

    ```

- Reflect.ownKeys可以返回所有类型的键名，包括常规键名和 Symbol 键名

```javascript
let obj = {
  prop1: 'value1',
  prop2: 'value2',
  [Symbol('symbolKey')]: 'symbolValue'
};

let keys = Reflect.ownKeys(obj);

console.log(keys);
// 输出：[ 'prop1', 'prop2', Symbol(symbolKey) ]
```
