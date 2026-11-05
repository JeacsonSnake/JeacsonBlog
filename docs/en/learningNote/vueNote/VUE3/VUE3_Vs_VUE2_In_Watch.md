---
category:
  - VUE
  - Web
tag:
  - VUE3
  - COMPARE
---
# How Vue3 and Vue2 differ on watch

In VUE2, watch exists as an option. We can use the watch option to fire a function every time a reactive property changes.

```javascript
export default {
  data() {
    return {
      question1: ''，
      question2: ''，
    }
  },
  watch: {
    // every time question1 changes, this function runs (shorthand)
    question1(newValue, oldValue) {
      console.log('question1 Changed!', newValue, oldValue);
    }，
    question2: {
        deep: true,// turn on deep watching
        immediate: true, // watch immediately when enabled
        handler(newValue, OldValue) {
            console.log('question2 Changed!', newValue, oldValue);
        }
    }
  },
}
```

But in VUE3, watch exists as part of the Composition API. We can import and use the watch function to fire a function every time a reactive property changes.

```javascript
export default {
    setup() {
        let test1 = ref(0);
        let test2 = ref("hello");
        let test3 = reactive({
            name: "jean",
            age: 21,
            inner: {
                reading: "history Book"
            }
        )

        // case one: watch a single reactive value defined by ref
        watch(sum,(newValue,oldValue)=>{
            console.log('test1 changed',newValue,oldValue)
        }{immediate:true})

        // case two: watch several reactive values defined by ref
        // note: here newValue and oldValue are both objects
        // because several reactive values are being watched here
        watch([test1,test2],(newvalue,oldvalue)=>{
            console.log('test1 or test2 changed',newVaue,oldValue)
        }{immediate:true})*/

        // case three: watch all the properties of one reactive value defined by reactive
        // note: ① oldValue here will be equal to newValue,
        // because the data being watched here is an object;
        // ② deep watching is on by default here, and it can't be turned off with the options afterwards,
        // that is, when watching all the properties of one reactive value defined by reactive,
        // adding a deep-watch option for it has no effect
        watch(test3,(newValue,oldValue)=>{
            console.log('test3 changed',newValue,oldValue)
        })

        // case four: watch one property of a reactive value defined by reactive
        // note: here we pass the data through a getter function
        // and of course oldValue here will not be equal to newValue
        watch(() => test3.age,(newValue,oldValue)=>{
            console.log('the age property of test3 changed',newValue,oldValue)
        })

        // case five: watch some of the properties of a reactive value defined by reactive
        // note: here we wrap several getter functions in an array to pass the data
        watch([() => test3.age, () => test3.name],(newValue,oldValue)=>{
            console.log('the age property of test3 changed',newValue,oldValue)
        })

        // special case: if you watch a property of a reactive value defined by recactive and that property is an object,
        // you need to add a deep-watch option for it, otherwise changes to that object can't be watched.
        // that is, when watching one property of a reactive value defined by recactive,
        // adding a deep-watch option for it does work
        // this needs to be distinguished from case three
        watch(() => test3.inner,(newValue,oldValue)=>{
            console.log('the inner property of test3 changed',newValue,oldValue)
        }, {deep: true})
    }
}
```

::: important
This article was translated by Hermes Agent; the original text can be found at ../../../../learningNote/vueNote/VUE3/VUE3_Vs_VUE2_In_Watch.md. The translation is for reference only.
Translation time: 2026-11-05
:::
