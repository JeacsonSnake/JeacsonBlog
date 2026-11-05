---
title: Principles of Automatic Control
icon: 'gears'
category:

- 自动控制原理相关

---

This is where I keep the notes related to the principles of automatic control.

## S-Z transform table (Table of s- and z-transforms)

|   | $f(t)$ | $F(s)$ | $f(kT)$ or $f(k)$ | $F(z)$ | name |
| :----: | :-----: | :----: | :----: | :----: | :---- |
| 1 | $\delta (t)$ | $1$ | $\delta(k)$ | 1 | unit impulse |
| 2 | $\delta (t-t_d)$ | $e^{-t_ds}$ | $\delta (k-n)$ | $z^{-n}$ | delayed unit impulse |
| 3 | $u(t) = 1$ | $1 \over s$ | $u(k) = 1$ | ${z} \over {z-1}$ | unit step |
| 4 | $t$ | $1 \over {s^2}$ | $kT$ | ${zT} \over {(z-1)^2}$ | ramp |
| 5 | $t^2$ | $2\over{s^3}$ | $(kT)^2$ | ${z(z+1)T^2} \over {(z-1)^3}$ | parabola |
| 6 |   |   | $a^k$ | $z \over {z-a}$ | geometric sequence |
| 7 | $e^{-at}$ | ${1} \over {s+a}$ | $e^{-akT}$ | ${z} \over {z-e^{-aT}}$ | natural exponential |
| 8 | $1-e^{-at}$ | ${1} \over {s(s+a)}$ | $1-e^{-akT}$ | ${(1-e^{-aT})z} \over {(z-1)(z-e^{-aT})}$ | unit step exponential |
| 9 | $te^{-at}$ | ${1} \over {(s+a)^2}$ | $kTe^{-akT}$ | ${Tze^{-aT}} \over {(z-e^{-aT})^2}$ |   |
| 10 |   |   | $ka^{k-1}$ | ${z} \over {(z-a)^2}$ |   |
| 11 |   |   | $a^k-b^k$ | ${(a-b)z} \over {(z-a)(z-b)}$ |   |
| 12 | $sin \omega t$ | ${\omega} \over {s^2+\omega^2}$ | $sin \omega kT$ | ${z sin \omega T}\over{ z^2 - 2zcos\omega T + 1}$ | sine |
| 13 | $cos \omega t$ | ${s} \over {s^2+\omega^2}$ | $cos \omega kT$ | ${z(z - cos \omega T)}\over{ z^2 - 2zcos\omega T + 1}$ | cosine |
| 14 | $e^{-at}sin \omega t$ | ${s} \over {(s+a)^2+\omega^2}$ | $e^{-akT}sin \omega kT$ | ${ze^{-aT} sin \omega T}\over{ z^2 - 2ze^{-aT}cos\omega T + e^{-2aT}}$ | natural underdamped |
| 15 | ${df}\over{dt}$ | $sF(s) - f(0)$ | (empty) | (empty) | first derivative ($1^{st}$ derivative) |
| 16 | ${d^2f}\over{dt^2}$ | $s^2F(s) - sf(0) - \frac{df(0)}{dt}$ | (empty) | (empty) | second derivative ($2^{nd}$ derivative) |
| 17 |   |   | $f(k-n)$ | $z^{-n}F(z)$ | backward shift of *n* |
| 18 | $f(t-t_d)$ | $e^{t_ds}F(s)$ |   |   | time delay |
| 19 | (empty)  | (empty)  | $f(k+1)$ | $zF(s) - f(0)$ | forward shift of one |
| 20 | (empty)  | (empty)  | $f(k+2)$ | $sF(s) - f(0)$ | forward shift of two |
| 21 | $f(0)$ | $\lim\limits_{s\rightarrow\infin}sF(s)$ | $f(0)$ | $\lim\limits_{z\rightarrow\infin}F(z)$ | initial value |
| 22 | $f(\infin)$ | $\lim\limits_{s\rightarrow 0}sF(s)$ | $f(\infin)$ | $\lim\limits_{z\rightarrow 1}(z-1)F(z)$ | final value |

Where:

- For $t<0$, the function $f(t)=0$
- For $k<0$, the function $f(kT) = f(k) = 0$
- $k = 0, 1, 2,\dots$

## The Z-transform

### 1. Difference equation method

### 2. Power series method

### 3. Partial fraction method

### 4. Residue method

## The inverse Z-transform

### 1. Difference equation method

Example: given $m(k) = \begin{cases} 1, &k \text{ even} \\ 0, &k \text{ odd}\end{cases}$ , when $k = 0, 1, \dots , 4$,

find the value of the function $y(k) = m(k) - m(k-1) - y(k - 1)$.

Solution:

$$y(k) = m(k) - m(k-1) - y(k - 1) \Rightarrow Y(z) = M(z) - z^{-1}M(z) - z^{-1}Y(z)$$

$$\Rightarrow \frac{Y(z)}{M(z)} = \frac{1 - z^{-1}}{1 + z^{-1}} = \frac{z-1}{z+1}$$

$\because m(k) = \begin{cases} 1, &k \text{ even} \\ 0, &k \text{ odd}\end{cases}$

$$\Rightarrow M(z) = 1 + 0 + z^{-2} + 0 + z^{-4} + \dots = \frac{1}{1 - z^{-2}} = \frac{z^2}{z^2 - 1} $$

$$\therefore Y(z)= \frac{Y(z)}{M(z)} \times M(z) = \frac{z-1}{z+1} \times \frac{z^2}{z^2 - 1} = \frac{(z-1)z^2}{(z-1)(z+1)^2} = \frac{z^2}{(z+1)^2}$$

$\because Z[y(k)] = Y(z) \Rightarrow y(k) = Z^{-1}[Y(z)]$

$$\therefore y(k) = Z^{-1}[\frac{z^2}{(z+1)^2}]$$

### 2. Power series method

### 3. Partial fraction method

### 4. Residue method

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../learningNote/Principles_of_Automatic_Control_Related/README.md). The translation is for reference only.
Translation time: 2026-11-05
:::
