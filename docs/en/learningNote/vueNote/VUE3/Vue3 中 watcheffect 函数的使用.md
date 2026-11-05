---
category:
  - VUE
  - Web
tag:
  - VUE3
---

# A quick look at using the watchEffect function in Vue3

In vue3, the watchEffect function is one of the ways to track reactive dependencies. In essence, the watchEffect function is the same as writing a method that uses reactive properties: **whenever any value in that method gets updated as the user interacts with the page**, the method runs.

Example:

```javascript
import { ref, watchEffect } from 'vue'
export default {
    setup() {
        let observed = ref(0);

        watchEfect(() => {
            let monitor = observed * 2;
            console.log('detected that observed was changed by the user.');
            console.log(`where observed is ${observed}`);
            console.log(`where monitor is ${monitor}`);
        })

        return {
            observed
        }
    }

    
}
```

In the example above, when the "observed" data used inside the watchEffect function is changed by the user, the function runs and prints the monitored value and the "computed" value.

Here, the watchEffect function is similar to the computed option in vue2, except:

- the computed option cares about returning the computed value, that is, it cares more about the callback's return value, so you must write a return value in the computed function.

- whereas the watchEffect function cares more about the computing process, that is, the body of the callback itself, so you don't need to write a return value in the watchEffect function.

As for the difference between the watch function and the watchEffect function, the following is taken from the vue3 official docs: [here's the link](https://cn.vuejs.org/guide/essentials/watchers.html#watch-vs-watcheffect)

> ### `watch` vs. `watchEffect`
>
> `watch` and `watchEffect` both allow us to reactively perform side effects. Their main difference is how they track their reactive dependencies:
>
> - `watch` only tracks the explicitly watched source. It won't track anything accessed inside the callback. In addition, the callback only triggers when the source has actually changed. `watch` separates dependency tracking from the side effect, giving us more precise control over when the callback should fire.
>
> - `watchEffect`, on the other hand, tracks dependencies during its execution. It will automatically track all reactive properties accessed during its synchronous execution. This is more convenient and typically results in shorter code, but makes its reactive dependencies less explicit.

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../../learningNote/vueNote/VUE3/Vue3%20中%20watcheffect%20函数的使用.md). The translation is for reference only.
Translation time: 2026-11-05
:::
