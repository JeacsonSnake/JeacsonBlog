---
category:
  - JavaScript
  - Web
tag:
- JavaScript
- problem
---
# The trouble with formal and actual parameters when a JS function reads a property off the object passed in

In a JavaScript function, when we pass an object in, we can read the property straight off the object to get its value, like this:

```javascript
function inputObj (object) {
    ......
    let getValue = object.someProps;
    ......
}
```

But note that the property value you reference with "." after passing the object in has to be the actual parameter (that is, the object property you want to read has to be the real value).

Take the example below, where we pass the property name into the function as well. When we read it, we can't do it this way:

```javascript
function getObjAndProp (object, prop) {
    let getValue = object.prop;
}
```

Because that makes JavaScript parse prop as a string value and try to read the parameter named "prop" on the object, rather than trying to read it using the parameter that was passed in, i.e. the actual parameter. But plainly props is only a formal parameter, which makes the read go badly wrong.

In this case we should **change the way we read it to object[prop]**, as below:

```javascript
function getObjAndPropCorrectly (object, prop) {
    ......
    let getValue = object[prop];
    ......
}
```

With that, JavaScript parses prop as a variable rather than a string value, which solves the problem of reading a property off the passed-in object through a formal parameter.

::: important
This article was translated by Hermes Agent; the original text can be found at [here](../../learningNote/JSNote/Formal&Real_Para_When_Func_Get_Obj.md). The translation is for reference only.
Translation time: 2026-11-05
:::
