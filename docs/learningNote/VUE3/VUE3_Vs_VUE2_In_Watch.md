# Vue3 与 Vue2 在watch上的区别

在VUE2中，watch作为选项存在。我们可以通过使用 watch 选项在每次响应式属性发生变化时触发函数。

```javascript
export default {
  data() {
    return {
      question1: ''，
      question2: ''，
    }
  },
  watch: {
    // 每当 question1 改变时，这个函数就会执行 (简写方式)
    question1(newValue, oldValue) {
      console.log('question1 Changed!', newValue, oldValue);
    }，
    question2: {
        deep: true,// 开启深度监听
        immediate: true, // 开启时立即监听
        handler(newValue, OldValue) {
            console.log('question2 Changed!', newValue, oldValue);
        }
    }
  },
}
```

但是在VUE3中，watch作为组合式API存在。我们可以通过 import 并使用 watch 函数在每次响应式属性发生变化时触发函数。

```javascript
export default {
    setup() {
        let test1 = ref(0);
        let test2 = ref("你好");
        let test3 = reactive({
            name: "jean",
            age: 21,
            inner: {
                reading: "history Book"
            }
        )

        // 情况一: 监视 ref 所定义的一个响应式数据
        watch(sum,(newValue,oldValue)=>{
            console.log('test1变了',newValue,oldValue)
        }{immediate:true})

        // 情况二: 监视 ref 所定义的多个响应式数据
        // 注意: 这里的 newValue 和 oldValue 的值都是对象
        // 因为这里监视了多个响应式数据
        watch([test1,test2],(newvalue,oldvalue)=>{
            console.log('test1或test2变了',newVaue,oldValue)
        }{immediate:true})*/

        // 情况三: 监视 reactive 所定义的一个响应式数据的所有属性
        // 注意: ① 这里的 oldValue 会与 newValue 的值相等，
        // 因为这里监视的响应数据是对象;
        // ② 这里的监视默认开启了深度监视，且无法使用后面的配置项进行关闭，
        // 也就是说，当监视 reactive 所定义的一个响应式数据的所有属性时，
        // 为其添加深度监视配置是无效的
        watch(test3,(newValue,oldValue)=>{
            console.log('test3变化了',newValue,oldValue)
        })

        // 情况四: 监视 reactive 所定义的一个响应式数据中的某个属性
        // 注意: 这里我们使用 getter 函数进行数据的传输
        // 当然这里的 oldValue 会与 newValue 的值不相等
        watch(() => test3.age,(newValue,oldValue)=>{
            console.log('test3的age属性变化了',newValue,oldValue)
        })

        // 情况五: 监视 reactive 所定义的一个响应式数据中的某些属性
        // 注意: 这里我们使用数组包裹多个 getter 函数进行数据的传输
        watch([() => test3.age, () => test3.name],(newValue,oldValue)=>{
            console.log('test3的age属性变化了',newValue,oldValue)
        })

        // 特殊情况: 监视 recactive 所定义的一个响应式数据中的某个属性为对象属性，
        // 则需要为其添加深度监视配置，否则无法监视到该对象的变化。
        // 也就是说，当监视 recactive 所定义的一个响应式数据中的某个属性时，
        // 为其添加深度监视配置是有效的
        // 这里需要与情况三做出区别
        watch(() => test3.inner,(newValue,oldValue)=>{
            console.log('test3的inner属性变化了',newValue,oldValue)
        }, {deep: true})
    }
}
```
