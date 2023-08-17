module.exports = {
    themeConfig: {
        // 导航栏相关设置
        logo: '/assets/img/logo.png',
        nav: [{
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
            {
                text: '语言',
                ariaLabel: 'Language Menu',
                items: [{
                        text: '中文',
                        link: '/'
                    },
                    {
                        text: 'English',
                        link: '/en/'
                    }
                ]
            },
            {
                text: 'Github',
                link: 'https://Github.com'
            },
        ],
        sidebar: {
            '/learningNote/VUE3/': [
                '',
                'VUE3_Vs_VUE2_In_Reactive_Data',
                'VUE3_Vs_VUE2_In_Watch',
                'VUE3_Vs_VUE2_In_Render_Function'
            ],
            '/learningNote/JSNote/': [
                '',
                'Formal&Real_Para_When_Func_Get_Obj',
            ],
        },
        locales: {
            // 键名是该语言所属的子路径
            // 作为特例，默认语言可以使用 '/' 作为其路径。
            '/': {
                lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
                title: 'JeacsonBlog-一个简单的博客',
                description: '使用VuePress搭建的个人博客网站'
            },
            '/en/': {
                lang: 'en-US',
                title: 'JeacsonBlog-A Simple Blog',
                description: 'A personal blog website powered by Vuepress'
            }
        }
    }
}