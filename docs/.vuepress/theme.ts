import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbarConfig, enNavbarConfig } from "./navbar";
import { zhSidebarConfig, enSidebarConfig } from './sidebar'

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    favicon: "/assets/img/favicon.ico",
    iconAssets: ['//at.alicdn.com/t/c/font_4219909_fifo4ha6sn8.css'],
    iconPrefix: 'iconfont icon-',
    lastUpdated: true,
    hotReload:true,
    plugins: {
        mdEnhance: {
            // 使站点中的 Markdown 文件支持脚注
            footnote: true,
            // 开启可指定图像大小
            imgSize:true
        },
        // 启用博客功能
        blog: true,
        // comment: {
        //     provider: "Waline",

        //     // waline 模式下
        //     serverURL: "...", // your serverURL
        // },
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
    }


})