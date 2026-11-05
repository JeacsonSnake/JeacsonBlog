---
title: What Is Symbol
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## Definition — a primitive data type that never repeats

`Symbol` is a new primitive data type introduced by ES6, standing for a unique value. It is the seventh data type in the JavaScript language.

::: info
The first six are: undefined, null, Boolean, String, Number and Object.
:::

Primitive data types are not created with the new keyword, so it is created like this:

```javascript
let Sym = Symbol()
```

You can pass in a string (deescription) as the argument to serve as a label:

```javascript
let Sym = Symbol('Diff description')

```

## Characteristics

- Unique

    ```javascript
    let Sym1 = Symbol('a')
    let Sym2 = Symbol('b')
    console.log(Sym1 === Sym2) // prints false
    ```

- Cannot be used with the new keyword to create an object

    ```javascript
    let Sym1 = new Symbol('a')  // illegal
    let Sym2 = Symbol('b')  // legal
    ```

- A Symbol value cannot take part in numeric operations, and cannot be implicitly converted to a string

    ```javascript
    let Sym = new Symbol('calculate')
    let Num = Sym + 5 // Type Error
    ```

    But you can convert a Symbol to a string with the `toString()` method; the string has the format `"Symbol(description)"`

    ```javascript
    let Sym = new Symbol('calculate')
    let StrSym = toString(Sym) // string: "Symbol('calculate')"
    ```

- As an object property key it cannot use the `.` operator, but it can use square brackets `[]`

    ```javascript
    let Sym = Symbol('Obj Symbol')
    let obj = {
        'name': 'Paul',
        'key': Sym,
        [Sym]: 'Im a symbol'
    }
    console.log(obj.key) // legal
    console.log(obj[key]) // legal
    console.log(obj.Sym) // illegal
    console.log(obj[Sym]) // legal
    ```

- As an object property it cannot be iterated over by loops such as for...in and for...of, nor is it returned by - - Object.keys, Object.getOwnPropertyNames or JSON.stringify

```javascript
let obj = {};
let sym = Symbol('mySymbol');
obj[sym] = 'I am a Symbol!';

// for...in
for (let key in obj) {
    console.log(key); // nothing printed
}

// for...of
for (let key of Object.keys(obj)) {
    console.log(key); // nothing printed
}

// Object.keys
console.log(Object.keys(obj)); // prints an empty array []

// Object.getOwnPropertyNames
console.log(Object.getOwnPropertyNames(obj)); // prints an empty array []

// JSON.stringify
console.log(JSON.stringify(obj)); // prints "{}"
```

- The Object.getOwnPropertySymbols method gets you all the Symbol property names of an object

    ```javascript
    let obj = {
        'name': 'Paul',
        [Symbol('Obj Symbol1')]: 'Im a symbol'
        [Symbol('Obj Symbol2')]: 'Im a symbol two'
    }
    targetObjSymbolArr = Object.getOwnPropertySymbols(obj) //targetObjSymbolArr = [Symbol('Obj Symbol1'), Symbol('Obj Symbol2')]

    ```

- Reflect.ownKeys returns key names of every kind, both ordinary ones and Symbol ones

```javascript
let obj = {
  prop1: 'value1',
  prop2: 'value2',
  [Symbol('symbolKey')]: 'symbolValue'
};

let keys = Reflect.ownKeys(obj);

console.log(keys);
// prints: [ 'prop1', 'prop2', Symbol(symbolKey) ]
```

::: important
This article was translated by Hermes Agent; the original text can be found at ../../learningNote/JSNote/Symbol.md. The translation is for reference only.
Translation time: 2026-11-05
:::
