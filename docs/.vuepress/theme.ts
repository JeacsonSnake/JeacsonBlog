import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbarConfig, enNavbarConfig } from "./navbar";
import { zhSidebarConfig, enSidebarConfig } from './sidebar'

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    favicon: "/assets/img/favicon.ico",
    iconAssets: ['//at.alicdn.com/t/c/font_4219909_u396hzcgwtq.css'],
    iconPrefix: 'iconfont icon-',
    // navbar: zhNavbarConfig,
    // sidebar: zhSidebarConfig,
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