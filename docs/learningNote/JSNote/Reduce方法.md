---
title: Reduce 方法
category:
  - JavaScript
  - Web
tag:
- JavaScript
- advanced
---

## 简述

reduce() 方法是 Javascript 中内置的数组方法。它一般用于数组的压缩。

## 定义

1.reduce() 方法可以接收两个参数，一个为回调函数，另一个为 InitialValue, 即传给函数的初始值;

这里的 InitialValue 的值可以是包括但不限于数字，数组或者对象等的值，例如 `0` / `[]` / `{}` 等。当然也可以不传，非必需值。

2.reduce() 方法接收的函数会作为该数组的累加器，使数组中的每个值以既定的顺序（从左到右，即升序）开始缩减，并最终计算为**一个**值。

这个值同样可以是包括但不限于数字，数组或者对象等的值, 这个值由该函数的输出以及 InitialValue 共同决定。

:::tip

reduce() 对于空数组而言是**不会**执行回调函数的。所以调用该方法的数据**必须为非空数组**。

:::

## 示例

reduce() 方法一般的使用示例如下：

```javascript

let arr = [...]
let InitialValue = ...

sum = arr.reduce((prev, cur, index, arr) => {
    
    }, InitialValue)

```

其中 reduce() 方法的第一个参数——回调函数中可以接收四个参数，分别为:

- prev: 函数传进来的初始值或上一次回调的返回值 (previous)

- cur: 数组中当前处理的元素值 (current value)

- index: 当前元素索引 (current index)

- arr: 当前元素所属的数组本身

### 简单示例(数组内元素相加)

这里做最简单的将数组中所有数值进行相加的操作:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]

sum = arr.reduce((prev, cur, index, arr) => {
    console.log(prev, cur, index);
    return prev + cur;
})
console.log(arr, sum);

```

则输出的结果为:

```powershell

输出结果
1 2 1
3 3 2
6 4 3
10 4 4
14 6 5
20 8 6
[1, 2, 3, 4, 4, 6, 8] 28

```

此时由于我们还没有赋予初值, 因此上面的例子index是从数组的第一个元素 **1** 开始的，因此对第一次回调而言，prev 的值为数组的第一个值，cur 的值是数组的第二个值。而由于数组长度是7，因此reduce函数会循环6次，并在最后一次return后由于没有其他的cur值而跳出循环。

而当我们添加 InitialValue 时：

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = 0

sum = arr.reduce((prev, cur, index, arr) => {
    console.log(prev, cur, index);
    return prev + cur;
}, InitialValue)

console.log(arr, sum);

```

则输出的结果为:

```powershell

输出结果
0 1 0
1 2 1
3 3 2
6 4 3
10 4 4
14 6 5
20 8 6
[1, 2, 3, 4, 4, 6, 8] 28

```

此时对第一次回调而言，prev 的值为 InitialValue 值，cur 的值是数组的第一个值。而且由于增加了 InitialValue 值，因此reduce函数会循环7次而不是6次。

### 另一个示例(计算数组内元素出现次数)

这里做另一个示例，计算数组内元素出现次数，并存入对象。同样使用简单示例中的数组:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = {} // 这里的值必须为对象

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

则输出的结果为:

```powershell

输出结果
{} 1 0
{'1': 1} 2 1
{'1': 1, '2': 1} 3 2
{'1': 1, '2': 1, '3': 1} 4 3
{'1': 1, '2': 1, '4': 1} 4 4
{'1': 1, '2': 1, '4': 2} 6 5
{'1': 1, '2': 1, '4': 2, '6': 1} 8 6
{'1': 1, '2': 1, '4': 2, '6': 1, '8': 1}

```

### 另一个示例(数组内元素去重)

这里做另一个示例，将数组内元素进行去重，并存入对新数组。同样使用简单示例中的数组:

```javascript

let arr = [1, 2, 3, 4, 4, 6, 8]
let InitialValue = [] // 这里的值必须为数组

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

则输出的结果为:

```powershell

输出结果
[1, 2, 3, 4, 6, 8]

```

### 另一个示例(数组多维转一维)

这里做另一个示例，将数组多维转一维，并存入对新数组。同样使用简单示例中的数组，但将其调整为多维:

```javascript

let arr = [[1, [2]], 3, [4], [4, [6, 8]]]
let InitialValue = [] // 这里的值必须为数组

flatArr = arr.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    return prev.concat(Array.isArray(cur) ? newArr(cur) : cur)
}, InitialValue)

console.log(countObj);

```

则输出的结果为:

```powershell

输出结果
[1, 2, 3, 4, 4, 6, 8]

```
