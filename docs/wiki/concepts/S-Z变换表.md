---
title: "S-Z 变换表：连续系统与离散系统的对照工具"
description: "自动控制原理里最常用的一张对照表：单位冲激/阶跃/斜坡/抛物线、指数、正弦余弦、欠阻尼、微积分与移位、时延、初值终值定理在 f(t)、F(s)、f(kT)、F(z) 四列的对应关系；附 Z 变换四种求法与一次差分方程法的完整推导"
created: 2026-11-06
updated: 2026-11-06
type: concept
tags: [Control-Theory, Z-Transform, Laplace, Discrete-System]
sources:
  - docs/learningNote/Principles_of_Automatic_Control_Related/README.md
related:
  - ../sources/Control_Theory.md
---

# S-Z 变换表

## 核心结论

> 离散系统分析的第一步是「把差分方程变成 z 域代数式」，靠的就是这张四列对照表：**时域 $f(t)$ ↔ s 域 $F(s)$ ↔ 离散序列 $f(kT)$ ↔ z 域 $F(z)$**。记住前六行（冲激、阶跃、斜坡、抛物线、几何序列、指数）+ 正弦余弦 + 移位/时延 + 初终值定理，就够覆盖绝大多数习题。

## 一、变换表

前提：$t<0$ 时 $f(t)=0$；$k<0$ 时 $f(kT)=f(k)=0$；$k=0,1,2,\dots$（T 为采样周期）。

| # | $f(t)$ | $F(s)$ | $f(kT)$ / $f(k)$ | $F(z)$ | 名称 |
|---|---|---|---|---|---|
| 1 | $\delta(t)$ | $1$ | $\delta(k)$ | $1$ | 单位冲激 |
| 2 | $\delta(t-t_d)$ | $e^{-t_d s}$ | $\delta(k-n)$ | $z^{-n}$ | 时延单位冲激 |
| 3 | $u(t)=1$ | $\dfrac{1}{s}$ | $u(k)=1$ | $\dfrac{z}{z-1}$ | 单位阶跃 |
| 4 | $t$ | $\dfrac{1}{s^2}$ | $kT$ | $\dfrac{zT}{(z-1)^2}$ | 斜坡 |
| 5 | $t^2$ | $\dfrac{2}{s^3}$ | $(kT)^2$ | $\dfrac{z(z+1)T^2}{(z-1)^3}$ | 抛物线 |
| 6 | — | — | $a^k$ | $\dfrac{z}{z-a}$ | 几何序列 |
| 7 | $e^{-at}$ | $\dfrac{1}{s+a}$ | $e^{-akT}$ | $\dfrac{z}{z-e^{-aT}}$ | 自然指数 |
| 8 | $1-e^{-at}$ | $\dfrac{1}{s(s+a)}$ | $1-e^{-akT}$ | $\dfrac{(1-e^{-aT})z}{(z-1)(z-e^{-aT})}$ | 阶跃·指数 |
| 9 | $te^{-at}$ | $\dfrac{1}{(s+a)^2}$ | $kTe^{-akT}$ | $\dfrac{Tze^{-aT}}{(z-e^{-aT})^2}$ | — |
| 10 | — | — | $ka^{k-1}$ | $\dfrac{z}{(z-a)^2}$ | — |
| 11 | — | — | $a^k-b^k$ | $\dfrac{(a-b)z}{(z-a)(z-b)}$ | — |
| 12 | $\sin\omega t$ | $\dfrac{\omega}{s^2+\omega^2}$ | $\sin\omega kT$ | $\dfrac{z\sin\omega T}{z^2-2z\cos\omega T+1}$ | sine |
| 13 | $\cos\omega t$ | $\dfrac{s}{s^2+\omega^2}$ | $\cos\omega kT$ | $\dfrac{z(z-\cos\omega T)}{z^2-2z\cos\omega T+1}$ | cosine |
| 14 | $e^{-at}\sin\omega t$ | $\dfrac{\omega}{(s+a)^2+\omega^2}$ | $e^{-akT}\sin\omega kT$ | $\dfrac{ze^{-aT}\sin\omega T}{z^2-2ze^{-aT}\cos\omega T+e^{-2aT}}$ | 自然欠阻尼 |
| 15 | $\dfrac{df}{dt}$ | $sF(s)-f(0)$ | — | — | 一阶导 |
| 16 | $\dfrac{d^2f}{dt^2}$ | $s^2F(s)-sf(0)-f'(0)$ | — | — | 二阶导 |
| 17 | — | — | $f(k-n)$ | $z^{-n}F(z)$ | 左移 n 位 |
| 18 | $f(t-t_d)$ | $e^{-st_d}F(s)$ | — | — | 时延 |
| 19 | — | — | $f(k+1)$ | $zF(z)-zf(0)$ | 右移 1 位 |
| 20 | — | — | $f(k+2)$ | $z^2F(z)-z^2f(0)-zf(1)$ | 右移 2 位 |
| 21 | $f(0)$ | $\lim_{s\to\infty}sF(s)$ | $f(0)$ | $\lim_{z\to\infty}F(z)$ | 初值定理 |
| 22 | $f(\infty)$ | $\lim_{s\to 0}sF(s)$ | $f(\infty)$ | $\lim_{z\to 1}(z-1)F(z)$ | 终值定理 |

> 原文表格中第 14 行 $F(s)$（欠阻尼正弦的分子应为 $\omega$ 而非 $s$）、第 18 行时延指数符号（应为 $e^{-st_d}$）、第 19/20 行右移定理（分子应带 $z$ 的幂次与 $f(0)$ 项）存在笔误，上表已按标准形式更正。

## 二、四条记忆线索

1. **冲激 ↔ 1，阶跃 ↔ $\dfrac{z}{z-1}$**：这两对是其余行的地基，其它都从它们推。
2. **时域乘 $e^{-at}$ ↔ z 域把 $z$ 换成 $ze^{aT}$**（阻尼位移定理）：第 7 行与第 3 行、第 9 行与第 4 行、第 14 行与第 12 行的关系都由此而来。
3. **时域乘 $t$/$t^2$ ↔ z 域对 $z$ 求导**（第 4、5、9、10 行）。
4. **移位 = 乘 $z^{\pm n}$**，右移（超前）要扣初始值，左移（延迟）不用。

## 三、Z 变换的四种求法

理论上都可用，实际按题面形式挑：

| 方法 | 适用 | 要点 |
|---|---|---|
| 差分方程法 | 给定差分方程 | 逐项取 z 变换，用移位定理消掉 $k$ |
| 幂级数法 | 能展开成 $\sum f(k)z^{-k}$ | 直接长除或展开级数，按系数读 $f(k)$ |
| 部分分式法 | $F(z)$ 是有理分式 | 拆成 $\dfrac{z}{z-a}$ 这类标准项再查表 |
| 残差法 | 需要闭式解 | 用留数 $\sum \text{Res}$ 求逆变换 |

## 四、一个完整例子（差分方程法）

设
$$
m(k)=\begin{cases}1,& k \text{ 为偶数}\\ 0,& k \text{ 为奇数}\end{cases},\quad
y(k)=m(k)-m(k-1)-y(k-1)
$$
求 $k=0,1,\dots,4$ 时的 $y(k)$。

**① 取 z 变换**（注意零初始条件）：
$$
Y(z)=M(z)-z^{-1}M(z)-z^{-1}Y(z)
\;\Rightarrow\;
\frac{Y(z)}{M(z)}=\frac{1-z^{-1}}{1+z^{-1}}=\frac{z-1}{z+1}
$$

**② 求输入序列的 z 变换**：偶数位为 1、奇数位为 0，即 $1,0,1,0,\dots$
$$
M(z)=1+z^{-2}+z^{-4}+\cdots=\frac{1}{1-z^{-2}}=\frac{z^2}{z^2-1}
$$

**③ 相乘得输出**：
$$
Y(z)=\frac{z-1}{z+1}\cdot\frac{z^2}{z^2-1}
=\frac{(z-1)z^2}{(z-1)(z+1)^2}=\frac{z^2}{(z+1)^2}
$$

**④ 逆变换**：查表（第 10 行，$a=-1$）或部分分式展开可得
$$
y(k)=Z^{-1}\!\left[\frac{z^2}{(z+1)^2}\right]
$$

这条链路的每一步都是「定理 + 查表」，没有别的技巧 —— 这也是这张表值得背下来的原因。

## 来源

- 知识源：[自动控制原理与 S-Z 变换（源笔记摘要）](../sources/Control_Theory.md)
- 原文：[自动控制原理相关（S-Z 变换表）](../../learningNote/Principles_of_Automatic_Control_Related/README.md)
- 相关概念：[机器数与 IEEE-754](./机器数与IEEE-754.md)（数值误差与离散化同源）
