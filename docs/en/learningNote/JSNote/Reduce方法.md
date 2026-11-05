---
title: The Reduce Method
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## Brief

reduce() is a built-in array method in Javascript. It is generally used to compress an array.

## Definition

1.reduce() takes two arguments: one is a callback function, the other is InitialValue, i.e. the initial value passed to the function;

The value of InitialValue here can be, but is not limited to, a number, an array or an object — `0` / `[]` / `{}` and so on. Of course you can also leave it out; it is not mandatory.

2.The function that reduce() takes acts as the accumulator for that array, making each value in the array start shrinking in a fixed order (left to right, i.e. ascending) and finally compute down to **one** value.

That value can likewise be, but is not limited to, a number, an array or an object; it is decided jointly by the output of the function and by InitialValue.

::: tip

For an empty array, reduce() does **not** run the callback. So the data you call this method on **must be a non-empty array**.

:::

## Example

A typical use of reduce() looks like this:

```javascript

let arr = [...]
let InitialValue = ...

sum = arr.reduce((prev, cur, index, arr) => {
    
    }, InitialValue)

```

The first argument of reduce() — the callback — can take four parameters:

- prev: the initial value passed into the function, or the return value of the previous callback (previous)

- cur: the value of the element currently being processed in the array (current value)

- index: the index of the current element (current index)

- arr: the array the current element belongs to

### A simple example (adding up the elements in an array)

Here is the simplest possible version — adding up every number in an array:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]

sum = arr.reduce((prev, cur, index, arr) => {
    console.log(prev, cur, index);
    return prev + cur;
})
console.log(arr, sum);

```

The output is:

```powershell

Output
1 2 1
3 3 2
6 4 3
10 4 4
14 6 5
20 8 6
[1, 2, 3, 4, 4, 6, 8] 28

```

Here, because we haven't given an initial value yet, index in the example above starts from the array's first element **1**, so for the first callback prev is the array's first value and cur is the array's second value. And since the array is 7 long, reduce() loops 6 times and breaks out after the last return because there are no more cur values.

Now when we add InitialValue:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = 0

sum = arr.reduce((prev, cur, index, arr) => {
    console.log(prev, cur, index);
    return prev + cur;
}, InitialValue)

console.log(arr, sum);

```

The output is:

```powershell

Output
0 1 0
1 2 1
3 3 2
6 4 3
10 4 4
14 6 5
20 8 6
[1, 2, 3, 4, 4, 6, 8] 28

```

Now for the first callback prev is the InitialValue and cur is the array's first value. And because InitialValue has been added, reduce() loops 7 times instead of 6.

### Another example (counting how often each element appears in an array)

Here's another example: count how many times each element appears in the array and store it in an object. Same array as in the simple example:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = {} // the value here must be an object

countObj = arr.reduce((prev, cur, index, arr) => {
    console.log(prev, cur, index);
    if (cur in prev) {
        prev[cur]++;
    } else {
        prev[cur] = 1;
    }
    return pre;
}, InitialValue)

console.log(countObj);

```

The output is:

```powershell

Output
{} 1 0
{'1': 1} 2 1
{'1': 1, '2': 1} 3 2
{'1': 1, '2': 1, '3': 1} 4 3
{'1': 1, '2': 1, '4': 1} 4 4
{'1': 1, '2': 1, '4': 2} 6 5
{'1': 1, '2': 1, '4': 2, '6': 1} 8 6
{'1': 1, '2': 1, '4': 2, '6': 1, '8': 1}

```

### Another example (de-duplicating the elements of an array)

Here's another example: de-duplicate the array's elements and store them in a new array. Same array as in the simple example:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = [] // the value here must be an array

reduceArr = arr.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    if (!prev.include(cur)) {
        return prev.concat(cur);
    } else {
        return prev;
    }
}, InitialValue)

console.log(countObj);

```

The output is:

```powershell

Output
[1, 2, 3, 4, 6, 8]

```

### Another example (flattening a multi-dimensional array into one dimension)

Here's another example: flatten a multi-dimensional array into one dimension and store it in a new array. Same array as in the simple example, but made multi-dimensional:

```javascript

let arr = [[1, [2]], 3, [4], [4, [6, 8]]]
let InitialValue = [] // the value here must be an array

flatArr = arr.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    return prev.concat(Array.isArray(cur) ? newArr(cur) : cur)
}, InitialValue)

console.log(countObj);

```

The output is:

```powershell

Output
[1, 2, 3, 4, 4, 6, 8]

```

::: important
This article was translated by Hermes Agent; the original text can be found at ../../learningNote/JSNote/Reduce方法.md. The translation is for reference only.
Translation time: 2026-11-05
:::
