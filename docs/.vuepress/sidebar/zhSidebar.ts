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
            text: "TypeScript",
            link: 'TypeScriptNote/',
            icon: "typescript"
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
    "/learningNote/TypeScriptNote/": [
        '',
        {
            text: "第一天",
            link: "第一天.md",
        },
        {
            text: "第二天",
            link: "第二天.md",
        },
        {
            text: "第三天",
            link: "第三天.md",
        },
        {
            text: "第四天",
            link: "第四天.md",
        },
        {
            text: "第五天",
            link: "第五天.md",
        }
    ],
    
    });

