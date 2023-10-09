---
title: 自动控制原理相关
icon: 'gears'
category:

- 自动控制原理相关

---

这里存放了一些自动控制原理相关的知识。

## S-Z变换表 (Table of s- and z-transforms)

|   | $f(t)$ | $F(s)$ | $f(kT)$ or $f(k)$ | $F(z)$ | name |
| :----: | :-----: | :----: | :----: | :----: | :---- |
| 1 | $\delta (t)$ | $1$ | $\delta(k)$ | 1 | 单位冲激 (unit impulse) |
| 2 | $\delta (t-t_d)$ | $e^{-t_ds}$ | $\delta (k-n)$ | $z^{-n}$ | 时延单位冲激(delayed unit impluse) |
| 3 | $u(t) = 1$ | $1 \over s$ | $u(k) = 1$ | ${z} \over {z-1}$ | 单位阶跃(unit step) |
| 4 | $t$ | $1 \over {s^2}$ | $kT$ | ${zT} \over {(z-1)^2}$ | 斜坡函数(ramp) |
| 5 | $t^2$ | $2\over{s^3}$ | $(kT)^2$ | ${z(z+1)T^2} \over {(z-1)^3}$ | 抛物线函数(parabola) |
| 6 |   |   | $a^k$ | $z \over {z-a}$ | 几何序列(geometric sequence) |
| 7 | $e^{-at}$ | ${1} \over {s+a}$ | $e^{-akT}$ | ${z} \over {z-e^{-aT}}$ | 自然指数(natural exponential) |
| 8 | $1-e^{-at}$ | ${1} \over {s(s+a)}$ | $1-e^{-akT}$ | ${(1-e^{-aT})z} \over {(z-1)(z-e^{-aT})}$ | 单位阶跃指数(unit step exponential) |
| 9 | $te^{-at}$ | ${1} \over {(s+a)^2}$ | $kTe^{-akT}$ | ${Tze^{-aT}} \over {(z-e^{-aT})^2}$ |   |
| 10 |   |   | $ka^{k-1}$ | ${z} \over {(z-a)^2}$ |   |
| 11 |   |   | $a^k-b^k$ | ${(a-b)z} \over {(z-a)(z-b)}$ |   |
| 12 | $sin \omega t$ | ${\omega} \over {s^2+\omega^2}$ | $sin \omega kT$ | ${z sin \omega T}\over{ z^2 - 2zcos\omega T + 1}$ | sine |
| 13 | $cos \omega t$ | ${s} \over {s^2+\omega^2}$ | $cos \omega kT$ | ${z(z - cos \omega T)}\over{ z^2 - 2zcos\omega T + 1}$ | cosine |
| 14 | $e^{-at}sin \omega t$ | ${s} \over {(s+a)^2+\omega^2}$ | $e^{-akT}sin \omega kT$ | ${ze^{-aT} sin \omega T}\over{ z^2 - 2ze^{-aT}cos\omega T + e^{-2aT}}$ | 自然欠阻尼(natural underdamped) |
| 15 | ${df}\over{dt}$ | $sF(s) - f(0)$ | （空置） | （空置） | 一阶导($1^{st}$ derivative) |
| 16 | ${d^2f}\over{dt^2}$ | $s^2F(s) - sf(0) - \frac{df(0)}{dt}$ | （空置） | （空置） | 二阶导($2^{nd}$ derivative) |
| 17 |   |   | $f(k-n)$ | $z^{-n}F(z)$ | 左移n时位(backward shift of *n*) |
| 18 | $f(t-t_d)$ | $e^{t_ds}F(s)$ |   |   | 时延(time delay) |
| 19 | （空置）  | （空置）  | $f(k+1)$ | $zF(s) - f(0)$ | 右移1时位(forward shift of one) |
| 20 | （空置）  | （空置）  | $f(k+2)$ | $sF(s) - f(0)$ | 右移2时位(forward shift of two) |
| 21 | $f(0)$ | $\lim\limits_{s\rightarrow\infin}sF(s)$ | $f(0)$ | $\lim\limits_{z\rightarrow\infin}F(z)$ | 初值(initial value) |
| 22 | $f(\infin)$ | $\lim\limits_{s\rightarrow 0}sF(s)$ | $f(\infin)$ | $\lim\limits_{z\rightarrow 1}(z-1)F(z)$ | 终值(final value) |

其中：

- 对于$t<0$的函数$f(t)=0$
- 对于$k<0$的函数$f(kT) = f(k) = 0$
- $k = 0, 1, 2,\dots$

## Z变换法

### 一、差分方程法

### 二、幂级数法

### 三、部分分式法

### 四、残差法

## Z逆变换法

### 一、差分方程法

例子：已知 $m(k) = \begin{cases} 1, &\text{k为偶数} \\ 0, &\text{k为奇数}\end{cases}$ ，当 $k = 0, 1, \dots , 4$ 时，

求函数 $y(k) = m(k) - m(k-1) - y(k - 1)$ 的值。

解：

$$y(k) = m(k) - m(k-1) - y(k - 1) \Rightarrow Y(z) = M(z) - z^{-1}M(z) - z^{-1}Y(z)$$

$$\Rightarrow \frac{Y(z)}{M(z)} = \frac{1 - z^{-1}}{1 + z^{-1}} = \frac{z-1}{z+1}$$

$\because m(k) = \begin{cases} 1, &\text{k为偶数} \\ 0, &\text{k为奇数}\end{cases}$

$$\Rightarrow M(z) = 1 + 0 + z^{-2} + 0 + z^{-4} + \dots = \frac{1}{1 - z^{-2}} = \frac{z^2}{z^2 - 1} $$

$$\therefore Y(z)= \frac{Y(z)}{M(z)} \times M(z) = \frac{z-1}{z+1} \times \frac{z^2}{z^2 - 1} = \frac{(z-1)z^2}{(z-1)(z+1)^2} = \frac{z^2}{(z+1)^2}$$

$\because Z[y(k)] = Y(z) \Rightarrow y(k) = Z^{-1}[Y(z)]$

$$\therefore y(k) = Z^{-1}[\frac{z^2}{(z+1)^2}]$$

### 二、幂级数法

### 三、部分分式法

### 四、残差法
