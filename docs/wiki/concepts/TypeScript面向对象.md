---
title: "TypeScript 面向对象：类、封装三修饰符、继承、抽象类、接口与泛型"
description: "class 与对象的关系、constructor 与 this 的绑定、语法糖式参数属性写法；readonly 与 public/protected/private 三个访问修饰符的可见范围、getter/setter 存取器；extends 继承、super 调用、方法重写、abstract 抽象类；interface 的结构约束与声明合并；以及用泛型替代 any（含 extends 约束）"
created: 2026-11-06
updated: 2026-11-06
article: false
author: 'Hermes_Agent_cRl1_bot'
type: concept
tags: [TypeScript, OOP, Class, Interface, Generic]
sources:
  - docs/learningNote/TypeScriptNote/第四天.md
  - docs/learningNote/TypeScriptNote/第五天.md
related:
  - ./TypeScript类型系统.md
  - ./TypeScript工程化.md
  - ../entities/TypeScript.md
---

# TypeScript 面向对象：类、接口与泛型

## 核心结论

> 类是对象的模型，对象是属性（数据）+ 方法（功能）的容器。TS 在 JS 的类之上加了**三档访问控制**（public / protected / private + readonly）、**抽象类**（只能被继承、不能实例化）、**接口**（纯结构约束、全抽象）、以及**泛型**（把类型当参数，替代 any）。

## 一、类与对象

```typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    // constructor 在对象创建时调用，this 指向当前新建对象
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`大家好，我是${this.name}`);  // 实例方法中 this 指向当前实例
  }
}

const p = new Person('孙悟空', 18);
p.sayHello();
```

**语法糖**：构造函数的参数加修饰符即可自动成为属性并赋值（原文称为「上面类的简写」）：

```typescript
class Dog {
  constructor(public name: string, public age: number) {}
  bark() { alert('汪汪'); }
}
```

## 二、封装：三档修饰符 + 只读

对象默认属性可任意修改。为数据安全，TS 提供权限设置：

| 修饰符 | 当前类内 | 子类 | 实例对象 |
|---|---|---|---|
| `public`（默认） | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |
| `readonly` | 声明时/构造中赋值 | — | 只读，不可改 |

```typescript
class Person {
  protected name: string;      // 子类可改，外部不可改
  constructor(name: string) { this.name = name; }
}

const p = new Person('孙悟空');
p.name = '猪八戒';             // ✗ 编译报错：protected
```

### 存取器（getter / setter）

需要「读取/设置属性时做额外逻辑」时，用一对方法包住真实值：

```typescript
class Person {
  private _age: number = 0;

  get age(): number { return this._age; }

  set age(value: number) {
    if (value < 0) throw new Error('年龄不能为负');
    this._age = value;
  }
}
```

这是 TS 版的属性代理 —— 与 [Object.defineProperty](./defineProperty.md) 装 get/set 的目的相同，只是作用在类的属性上。

## 三、继承

```typescript
class Animal {
  constructor(public name: string) {}
  run() { console.log('父类中的 run 方法'); }
}

class Dog extends Animal {
  bark() { console.log(`${this.name}在汪汪叫！`); }
  run() { console.log('子类重写了 run'); }   // 方法重写（复写）
}
```

三条规则：

1. **子类构造器必须调用 `super()`**（若写了构造函数），否则无法初始化父类部分；
2. 同名方法被子类覆盖即**重写**；需要调用父类实现时用 `super.method()`；
3. `super` 在方法中表示当前类的父类。

### 抽象类

```typescript
abstract class Animal {
  abstract run(): void;        // 抽象方法：只有签名，没有实现
  bark() { console.log('动物在叫~'); }
}

class Dog extends Animal {
  run() { console.log('狗在跑~'); }   // 必须实现抽象方法
}

new Animal();   // ✗ 抽象类不能实例化
new Dog();      // ✅
```

抽象类专门用来被继承：它约束了子类**必须实现哪些方法**，同时可以提供公共实现（如 `bark`）。

## 四、接口（interface）

接口类似抽象类，但差别在于：**接口中所有方法和属性都没有实值**，全是抽象方法。它约束一个类的结构，也可以用来约束对象字面量。

```typescript
interface Person {
  name: string;
  sayHello(): void;
}

// ① 约束对象
function fn(per: Person) { per.sayHello(); }
fn({ name: '孙悟空', sayHello() { console.log(`Hello, 我是 ${this.name}`); } });

// ② 类实现接口
class Student implements Person {
  constructor(public name: string) {}
  sayHello() { console.log('大家好，我是' + this.name); }
}
```

**声明合并**：同名 interface 可以重复写，编译器会把多个声明合并成一个结构。

## 五、泛型（Generic）

当「参数类型不确定、但返回值类型与参数相同」时，用 `any` 会关闭类型检查，也不表达「两者同类型」。泛型解决这个问题：

```typescript
function test<T>(arg: T): T { return arg; }

test(10);            // 自动推断 T = number
test<number>(10);    // 手动指定

// 多个泛型
function pair<T, K>(a: T, b: K): K { return b; }
pair<number, string>(10, 'hello');

// 类中使用
class MyClass<T> {
  constructor(public prop: T) {}
}
```

### 泛型约束

```typescript
interface HasLength { length: number; }

function getLen<T extends HasLength>(arg: T): number {
  return arg.length;      // 有约束才能安全访问 .length
}
```

`T extends X` 表示泛型必须是 X 的子类型（接口、抽象类、普通类都适用）。约束让泛型内部能安全访问成员，而 `any` 只是把检查关掉。

## 六、接口 vs 抽象类 vs 类型别名

| | interface | abstract class | type |
|---|---|---|---|
| 可有实现 | 否 | 是 | 否 |
| 可被 implements | 是 | 是 | 是（结构匹配） |
| 声明合并 | 支持 | 不支持 | 不支持 |
| 可含构造函数/字段初始化 | 否 | 是 | 否 |

## 来源

- 原文：[TypeScript 第四天 面向对象（上）](../../learningNote/TypeScriptNote/第四天.md)、[第五天 面向对象（下）](../../learningNote/TypeScriptNote/第五天.md)
- 相关：[类型系统](./TypeScript类型系统.md)
