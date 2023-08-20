import { hopeTheme } from "vuepress-theme-hope";

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    navbar: [{
            text: '主页',
            link: '/'
        },
        {
            text: '学习笔记',
            link: '/learningnote/'
        },
        {
            text: '关于',
            link: '/about/'
        },
        // {
        //     text: '语言',
        //     ariaLabel: 'Language Menu',
        //     children: [{
        //             text: '中文',
        //             link: '/'
        //         },
        //         {
        //             text: 'English',
        //             link: '/en/'
        //         }
        //     ]
        // },
        {
            text: 'Github',
            link: 'https://Github.com'
        },
    ],
    sidebar: {
        "/learningNote/": "structure"
    },

    // sidebar: [{
    //     text: '学习笔记',
    //     link: '/learningnote/',
    //     collapsable: false,
    //     // sidebarDepth: 1,
    //     children: [{
    //             text: 'VUE3',
    //             prefix: '/learningnote/VUE3/',
    //             collapsible: false,
    //             sidebarDepth: 2,
    //             children: [
    //                 'VUE3_Vs_VUE2_In_Reactive_Data',
    //                 'VUE3_Vs_VUE2_In_Watch',
    //                 'VUE3_Vs_VUE2_In_Render_Function'
    //             ]
    //         },
    //         {
    //             text: 'JavaScript',
    //             prefix: '/learningnote/JSNote/',
    //             collapsable: false,
    //             sidebarDepth: 2,
    //             children: [
    //                 'Formal&Real_Para_When_Func_Get_Obj',
    //             ],
    //         }
    //     ],
    // }],


})