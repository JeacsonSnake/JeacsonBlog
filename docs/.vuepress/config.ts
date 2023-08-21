import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({

    theme,

    locales: {
        // 键名是该语言所属的子路径
        // 作为特例，默认语言可以使用 '/' 作为其路径。
        '/': {
            lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
            // title: 'JeacsonBlog-一个简单的博客',
            // description: '使用VuePress搭建的个人博客网站'
        },
        '/en/': {
            lang: 'en-US',
            // title: 'JeacsonBlog-A Simple Blog',
            // description: 'A personal blog website powered by Vuepress'
        }
    },
});
