---
title: VUE basics
icon: 'vuejs'
category:
- VUE
- Web
tag:
- VUE2
- basic

---

## Three ways to piece page data together

1. With interpolation syntax:

```html
...
   <body>
    <div id="root">
        Surname: <input type="text" v-model="SurName">
        <br><br>
        Given name: <input type="text" v-model="GivenName">
        <br><br>
        Full name: <span>{{SurName}}-{{GivenName}}</span>


    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //stop vue from generating the production tip on startup

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

1. With a methods function:

```html
 ...
   <body>
    <div id="root">
        Surname: <input type="text" v-model="SurName">
        <br><br>
        Given name: <input type="text" v-model="GivenName">
        <br><br>
        Full name: <span>{{showFullName()}}</span>
    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //stop vue from generating the production tip on startup

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

1. With a computed property:

```html
  ...
  <body>
    <div id="root">
      Surname: <input type="text" v-model="SurName" /> <br /><br />
      Given name: <input type="text" v-model="GivenName" /> <br /><br />
      Full name: <span>{{fullName}}</span>
    </div>
  </body>
    ...
  <script>
    Vue.config.productionTip = false; //stop vue from generating the production tip on startup

    new Vue({
      el: "#root",
      data: {
        SurName: "She",
        GivenName: "Jeacson",
      },
      ...
      computed: {
        fullName: {
          //when the user reads fullname, get is called, and the returned value becomes the value of fullName

          //when is get called?
          //1. the first time fullName is read
          //2. when the data it depends on changes
          get() {
            //here this is vm
            return this.SurName + '-' + this.GivenName
          },
          //when is set called?
          //1. when fullName is modified
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

Note: once you're sure the computed property is read-only, you can use the shorthand:

```html
...
<body>
    <div id="root">
      Surname: <input type="text" v-model="SurName" /> <br /><br />
      Given name: <input type="text" v-model="GivenName" /> <br /><br />
      Full name: <span>{{fullName}}</span>
    </div>
  </body>
...
  <script>
    Vue.config.productionTip = false; //stop vue from generating the production tip on startup

    new Vue({
      el: "#root",
      data: {
        SurName: "She",
        GivenName: "Jeacson",
      },
    ...
      computed: {
        //only use the shorthand once you're sure the computed property is read-only
        //assign the getter directly as the computed property's function body
        fullName() {
          return this.SurName + '-' + this.GivenName
        }
      },
    });
  </script>
...
```

## Array update detection

Vue can't change an array reactively through its **array index**. In other words, if you modify an array directly by index, Vue won't detect the update, and the page won't change along with the array. So with Vue, you can only make it react to array modifications with the following **seven** functions:

- pop()
- push()
- shift()
- unshift()
- splice()
- sort()
- reverse()

::: important
This article was translated by `Hermes Agent`; the original text can be found at [here](../../../../learningNote/vueNote/VUE2/VUE基础.md). The translation is for reference only.
Translation time: 2026-11-05
:::
