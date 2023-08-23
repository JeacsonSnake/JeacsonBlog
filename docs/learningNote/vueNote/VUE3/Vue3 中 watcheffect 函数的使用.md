---
category:
  - VUE
  - Web
tag:
  - VUE3
---

# Vue3 中 watchEffect 函数的简单使用

在 vue3 中， watchEffect 函数是跟踪响应依赖关系的方法之一。本质上，watchEffect 函数等同于使用响应式属性编写了一个方法，**每当这个方法中的任何值随着用户操作得到更新时**，该方法就会执行。

例：

```javascript
import { ref, watchEffect } from 'vue'
export default {
    setup() {
        let observed = ref(0);

        watchEfect(() => {
            let monitor = observed * 2;
            console.log('检测到 observed 受用户操作改变.');
            console.log(`其中observed值为${observed}`);
            console.log(`monitor值为${monitor}`);
        })

        return {
            observed
        }
    }

    
}
```

在上述例子中，当 watchEffect 函数中所使用的 “observed” 数据受到用户改变时，该函数会执行，并输出 监测数据 和 “计算后数据” 的值。

在这里，watchEffect 函数类似于 vue2 中的computed选项，但是:

- computed 选项注重的是将计算出来的值进行返回，也就是说它更注重的是回调函数的返回值，所以在 computed 函数中必须要写返回值。

- 而 watchEffect 函数更注重的是计算的过程，也就是回调函数的函数体本身，所以在 watchEffect 函数中并不用写返回值。

关于watch 函数 和watchEffect 函数之间的区别，以下摘自 vue3 官网：[这里是链接](https://cn.vuejs.org/guide/essentials/watchers.html#watch-vs-watcheffect)

> ### `watch` vs. `watchEffect`
>
> `watch` 和 `watchEffect` 都能响应式地执行有副作用的回调。它们之间的主要区别是追踪响应式依赖的方式：
>
> - `watch` 只追踪明确侦听的数据源。它不会追踪任何在回调中访问到的东西。另外，仅在数据源确实改变时才会触发回调。`watch` 会避免在发生副作用时追踪依赖，因此，我们能更加精确地控制回调函数的触发时机。
>
> - `watchEffect`，则会在副作用发生期间追踪依赖。它会在同步执行过程中，自动追踪所有能访问到的响应式属性。这更方便，而且代码往往更简洁，但有时其响应性依赖关系会不那么明确。
