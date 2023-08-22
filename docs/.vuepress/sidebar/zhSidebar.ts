import { sidebar } from "vuepress-theme-hope";

export const zhSidebarConfig = sidebar({
    "/": [
        {
            text: "主页",
            link: '',
            icon: 'house'

        },
        {
        text: "学习笔记",
        prefix: "learningNote/",
        children: [
            "vueNote/",
            "JSNote/",
            "Computer_Network/",
        ],
        },
        {
        text: "关于",
                link: 'about/'
        },
    ],
    "/learningNote/": [{
            text: "VUE相关",
            prefix: "vueNote/",
            children: [
                "VUE2/",
                "VUE3/"
            ],
            collapsible: true,
            icon:'vuejs'
        },
        {
            text: "JavaScript",
            link: 'JSNote/',
            icon: "js"

        },
        {
            text: "计算机网络",
            link: 'Computer_Network/',
            icon: "ethernet"

        },
    ], 

    "/learningNote/vueNote/VUE2/": "structure",
    "/learningNote/vueNote/VUE3/": "structure",
    "/learningNote/JSNote/": "structure",
    "/learningNote/Computer_Network/": "structure",
    
    });

