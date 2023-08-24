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
