import { hopeTheme } from "vuepress-theme-hope";

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    favicon: "/assets/img/favicon.ico",
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
    plugins: {
        // 启用博客功能
        blog: true
    },
    blog: {
        avatar: '/assets/img/avatar.jpg',
        roundAvatar: true,
        name: 'Jeacson She',
        description: "Mind your step",
        medias: {
            'Email': 'https://Jeacson_Snake@outlook.com',
            "GitHub": 'https://github.com/JeacsonSnake'
        }
    },
    author: {
        name: "Jeacson She"
    }


})