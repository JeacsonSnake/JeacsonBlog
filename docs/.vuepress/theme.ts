import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbarConfig, enNavbarConfig } from "./navbar";
import { zhSidebarConfig, enSidebarConfig } from './sidebar'

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    favicon: "/assets/img/favicon.ico",
    lastUpdated: true,
    // hotReload:true,
    plugins: {
        // 启用博客功能
        blog: true,
        comment: {
            provider: "Waline",

            // waline 模式下
            serverURL: "https://blogcomment.jeacsonsnake.com/", // your serverURL
        },
        icon: {
            assets: ['//at.alicdn.com/t/c/font_4219909_64bpqxxnfhg.css'],
            prefix: 'iconfont icon-',
        },

    },
    markdown: {
        // 开启可指定图像大小
        imgSize: true,
        // 使用 KaTeX 启用 TeX 支持
        math: {
            type: "katex",
        },
        // 添加选项卡支持
        tabs: true,
        // 使站点中的 Markdown 文件支持脚注
        footnote: true,
        // 启用下角标功能
        sub: true,
        // 启用上角标功能
        sup: true,
        // 启用自定义属性
        attrs: true,
    },
    blog: {
        avatar: '/assets/img/avatar.jpg',
        name: 'Jeacson She',
        description: "Mind your step",
        medias: {
            'Email': 'https://Jeacson_Snake@outlook.com',
            "GitHub": 'https://github.com/JeacsonSnake'
        }
    },
    author: {
        name: "Jeacson She"
    },
    locales: {
        '/': {
            navbar: zhNavbarConfig,
            sidebar: zhSidebarConfig,
        },
        '/en/': {
            navbar: enNavbarConfig,
            sidebar: enSidebarConfig,
        }
    },
    sidebarSorter: ["readme", "order", "date", "title", "filename"]


})