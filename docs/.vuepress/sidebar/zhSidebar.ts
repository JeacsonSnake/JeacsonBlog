import { sidebar } from "vuepress-theme-hope";

export const zhSidebarConfig = sidebar({
    "/": [
        {
            text: "主页",
            link: ''

        },
        {
        text: "学习笔记",
        prefix: "learningNote/",
        children: [
            "VUE2/",
            "VUE3/",
            "JSNote/",
            "Computer_Network/",
        ],
        },
        {
        text: "关于",
                link: 'about/'
        },
    ],

    "/learningNote/VUE2/": "structure",
    "/learningNote/VUE3/": "structure",
    "/learningNote/JSNote/": "structure",
    "/learningNote/Computer_Network/": "structure",
    
    });

