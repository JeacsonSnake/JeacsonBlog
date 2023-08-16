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
        ]
    }
}