---
title: 计算机组成原理
icon: 'aptop-code'
---

## 简述

在这个目录当中都是有关计算机组成原理相关笔记。如有错误还请帮忙指正！

## 机器数(Machine Number)

### 1. 简介

当一个十进制数转换为机器能够识别的二进制数时，能被完美以二进制进行表示而不存在无限不循环小数位的数被称为**机器数(Machine Number)**。

### 2. 计算标准 --- IEEE-754

IEEE二进制浮点数算术标准（IEEE 754）是20世纪80年代以来最广泛使用的浮点数运算标准，为许多CPU与浮点运算器所采用。这个标准定义了表示浮点数的格式（包括负零-0）与反常值（denormal number）），一些特殊数值（无穷（Inf）与非数值（NaN）），以及这些数值的“浮点数运算符”；它也指明了四种数值舍入规则和五种例外状况（包括例外发生的时机与处理方式）。
IEEE 754规定了四种表示浮点数值的方式：单精确度（32位）、双精确度（64位）、延伸单精确度（43比特以上，很少使用）与延伸双精确度（79比特以上，通常以80位实现）。

在这里先使用**单精度(single precision)**与**双精度(double precision)**进行计算。其中**单精度(single precision)浮点数**的**偏移量(bias)**为**127**，而**双精度(double precision)浮点数**的**偏移量(bias)**为**1023**。这两个偏移量会以字母`b`作表示。

在线转换器网站(仅支持英文): [click](https://www.h-schmidt.net/FloatConverter/IEEE754.html)

IEEE754标准的32位浮点数格式为：

![IEEE754标准的32位浮点数格式](./assets/img/IEEE754_standard_32-bit_floating-point_format.jpg)

其中：

- 符号位(sign/s) 占据1位，用于表示正负号.`0`表示正数，`1`表示负数.

- 指数偏移位(biased exponent/e') 占据31位至23位共8位，用于表示以2位底的指数.

- 小数位(mantissa/m) 占据剩余的22位至0位共23位. 用于存储尾数.

### 3.十进制转机器数(二进制)

在以二进制格式存储十进制浮点数时, 首先需要**把十进制浮点数表示为二进制格式**, 以十进制数20.5举例，它会被转换为:
**(20.5)~10~ = (10100.1)~2~**

然后, 需要把这个**二进制数转换为以2为底的指数形式**:

`10100.1 = 1.01001 * 2^4`

这里的转换思想为：将小数点移至个位数后，则以2为底的指数值为小数点移动的总位数。在这里小数点移动了4位，则以2为底的指数值为4.

:::info
用 *二进制数* 表示 *十进制浮点数* 时, 表示为 **尾数*指数** 的形式, 并把 **尾数的小数点放在第一位和第二位之间**, 然后 **保证第一位数非0**, 这个处理过程叫做 **规范化(normalized)**
:::

在 `1.01001 * 2^4` 这个值中:

- `1.01001`代表的是**小数位**，我们需要取小数点后的值，即`01001`。当然，因为这些值所占位数只有5位，还没有到达23位，因此我们需要对其进行补齐，即最终被补齐为`0100 1000 0000 0000 000`;

- `4` 是偏移前的指数(unbiased exponent)，一般会被表示为 `e`.

    [上文](./README.md#2-计算标准-----ieee-754)有提到, 32位单精度浮点数的偏移量(b)为127, 所以这里需要加上偏移量(即`e' = e + b`)。
    此时得到的 **指数偏移位(e')** 就是 `4 + 127 = 131`。

    最后我们将 *131* 转换为二进制，就会得到: **(131)~10~ = (1000 0011)~2~**

由此我们得到了:

- **指数偏移位(biased exponent/e')** = `1000 0011`
- **小数位(mantissa/m)** = `0100 1000 0000 0000 000`
- 并且已知 `(20.5)~10~`是正数，因此**符号位(sign/s)** = `0`.

将三个部分进行组装后，最终得到的结果就是：`0 1000 0011 0100 1000 0000 0000 000`, 也就是 `0x41A 4000`:

![Result after convert 20.5 to the Machine Number](./assets/img/Result_after_convert_20.5_to_the_Machine_Number.png)

## 未完待续