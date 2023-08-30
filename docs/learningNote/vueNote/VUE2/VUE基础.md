---
title: VUE基础
icon: 'vuejs'
category:
- VUE
- Web
tag:
- VUE2
- basic

---

## 实现页面数据拼接的三种方法

1. 插值语法实现:

```html
...
   <body>
    <div id="root">
        姓：<input type="text" v-model="SurName">
        <br><br>
        名：<input type="text" v-model="GivenName">
        <br><br>
        全名： <span>{{SurName}}-{{GivenName}}</span>


    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //阻止 vue 在启动时生成生产提示

    new Vue({
      el: "#root",
      data: {
        SurName: 'She',
        GivenName: "Jeacson",
      },
      ...
    });
  </script>
```

2. methods函数实现:

```html
 ...
   <body>
    <div id="root">
        姓：<input type="text" v-model="SurName">
        <br><br>
        名：<input type="text" v-model="GivenName">
        <br><br>
        全名： <span>{{showFullName()}}</span>
    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //阻止 vue 在启动时生成生产提示

    new Vue({
      el: "#root",
      data: {
        SurName: 'She',
        GivenName: "Jeacson",
      },
     ...
      methods: {
        showFullName(event) {
          return this.SurName + '-' + this.GivenName
        },
      },
     ...
    });
  </script>
```

3. 计算属性实现:

```html
  ...
  <body>
    <div id="root">
      姓：<input type="text" v-model="SurName" /> <br /><br />
      名：<input type="text" v-model="GivenName" /> <br /><br />
      全名： <span>{{fullName}}</span>
    </div>
  </body>
    ...
  <script>
    Vue.config.productionTip = false; //阻止 vue 在启动时生成生产提示

    new Vue({
      el: "#root",
      data: {
        SurName: "She",
        GivenName: "Jeacson",
      },
      ...
      computed: {
        fullName: {
          //当用户读取到 fullname 时, get 会被调用, 且返回值作为 fullName 的值

          //get何时调用？
          //1.初次读取 fullName 时
          //2.所依赖的数据发生变化时
          get() {
            //此处的this 为 vm
            return this.SurName + '-' + this.GivenName
          },
          //set何时调用？
          //1.当 fullName 被修改时
          set(value) {
            const arr = value.split('-');
            this.SurName = arr[0];
            this.GivenName = arr[1];
          }

        },
      },
    });
  </script>
```

注: 当确定该计算属性为只读属性时，可以简写:

```html
...
<body>
    <div id="root">
      姓：<input type="text" v-model="SurName" /> <br /><br />
      名：<input type="text" v-model="GivenName" /> <br /><br />
      全名： <span>{{fullName}}</span>
    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //阻止 vue 在启动时生成生产提示

    new Vue({
      el: "#root",
      data: {
        SurName: "She",
        GivenName: "Jeacson",
      },
    ...
      computed: {
        //在确定该计算属性为只读属性时，方可简写
        //将 getter 直接作为函数主体赋值与计算属性
        fullName() {
          return this.SurName + '-' + this.GivenName
        }
      },
    });
  </script>
...
```

## 数组更新检测

Vue 无法直接使用**数组索引**对其进行响应式修改。换句话说，如果直接使用数组索引对数组进行修改，Vue无法检测到数组的更新，会出现页面无法随着数组被修改而修改的问题。因此对于 Vue 而言，只能用以下**七**个函数使其对数组的修改进行响应：

- pop()
- push()
- shift()
- unshift()
- splice()
- sort()
- reverse()
