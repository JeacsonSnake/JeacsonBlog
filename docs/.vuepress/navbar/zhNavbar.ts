import { navbar } from 'vuepress-theme-hope'

export const zhNavbarConfig = navbar([{
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
    ])