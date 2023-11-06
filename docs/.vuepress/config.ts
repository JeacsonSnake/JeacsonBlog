import { defineUserConfig } from "vuepress";
import theme from "./theme";
import Multimd_table from 'markdown-it-multimd-table'

export default defineUserConfig({
    title: "JeacsonBlog",
    description: "JeacsonBlog-一个简单的博客",
    // base:'/JeacsonBlog/',
    base:'/',

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
    
    extendsMarkdown: (md) => {
        md.use(Multimd_table, {
                multiline:  false,
                rowspan:    false,
                headerless: true,
                multibody:  true,
                autolabel:  true,
            })
    }
});
