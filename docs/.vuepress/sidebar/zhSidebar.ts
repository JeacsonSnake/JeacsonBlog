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
            icon:"paper-pen",
            children: [
                "vueNote/",
                "JSNote/",
                "Computer_Network/",
            ],
        },
        {
            text: "踩坑心得",
            prefix: "postMortem/",
            icon: "diagram-next",
            children: [
                "deploy/"
            ],
        },
        {
            text: "关于",
            link: 'about/',
            icon: "circle-info"
        },
    ],
    "/learningNote/": [{
            text: "VUE",
            prefix: "vueNote/",
        children: [
                '',
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
    "/postMortem/": [
        '',
        {
            text: "部署",
            link: 'deploy/',
            icon: "box-archive"
        }
    ],

    "/learningNote/vueNote/VUE2/": "structure",
    "/learningNote/vueNote/VUE3/": "structure",
    "/learningNote/JSNote/": "structure",
    "/learningNote/Computer_Network/": "structure",
    
    });

