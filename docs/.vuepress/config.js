module.exports = {
    themeConfig: {
        // 导航栏相关设置
        logo: '/assets/img/logo.png',
        nav: [{
                text: '主页',
                link: '/'
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
        locales: {
            // 键名是该语言所属的子路径
            // 作为特例，默认语言可以使用 '/' 作为其路径。
            '/': {
                lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
                title: 'VuePress',
                description: 'Vue 驱动的静态网站生成器'
            },
            '/en/': {
                lang: 'en-US',
                title: 'VuePress',
                description: 'Vue-powered Static Site Generator'
            }
        }
    }
}