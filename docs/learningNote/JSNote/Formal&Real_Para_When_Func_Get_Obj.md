---
category:
  - JavaScript
  - Web
tag:
- JavaScript
- problem
---
# 有关JS函数读取传入对象属性值时，形参与实参所带来的问题

在JavaScript函数当中，当我们传入对象时，可以通过直接读取对象属性以获取属性值，以下为例：

```javascript
function inputObj (object) {
    ......
    let getValue = object.someProps;
    ......
}
```

但是需要注意，在传入对象后使用 "." 所引用的属性值必须为实参（也就是希望读取的对象的属性必须是实际的值）。

例如如下例子，在这个例子里，我们将属性值也传入函数中。当我们读取时，就不能使用以下这种方法：

```javascript
function getObjAndProp (object, prop) {
    let getValue = object.prop;
}
```

因为这样的方法会使 JavaScript 将 prop 解析为字符串值，并尝试读取该对象中名字为 “prop” 的参数，而不是尝试使用传入的参数，也就是实参进行读取。但很明显 props 只是形参，这使得读取会出现比较大的问题。

此时我们应该 **将读取方式改为object[prop]**，参照如下方法：

```javascript
function getObjAndPropCorrectly (object, prop) {
    ......
    let getValue = object[prop];
    ......
}
```

在这种情况下，JavaScript就会将prop解析为变量而不是字符串值，解决了使用形参读取传入对象属性的问题。
