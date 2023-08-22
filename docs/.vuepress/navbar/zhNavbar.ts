import { navbar } from 'vuepress-theme-hope'

export const zhNavbarConfig = navbar([{
            text: '主页',
            link: '/',
            icon: 'house'
        },
        {
            text: '学习笔记',
            link: '/learningnote/',
            icon:"paper-pen"
        },
        {
            text: '关于',
            link: '/about/',
            icon: "circle-info"
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
    ])