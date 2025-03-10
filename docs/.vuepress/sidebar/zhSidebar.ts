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
                "TypeScriptNote/",
                "Principles_of_Computer_Composition/",
                "Principles_of_Automatic_Control_Related/",
                "coding_skill/",
                "Computer_Network/",
                "Ros2_Note/",
            ],
        },
        {
            text: "踩坑心得",
            prefix: "postMortem/",
            icon: "diagram-next",
            children: [
                "deploy/",
                "markdown_render/",
            ],
        },
        {
            text: "记录随笔",
            link: "complain_diary/",
            icon: "signature"
        },
        {
            text: "关于",
            link: 'about/',
            icon: "circle-info"
        },
    ],
    "/learningNote/": [
        {
            text: "ROS2学习笔记集",
            prefix: "Ros2_Note/",
            children: "structure",
            collapsible: true,
            icon: 'smartrobot-fill',
        },
        {
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
        {
            text: "计算机组成原理",
            link: 'Principles_of_Computer_Composition/',
            icon: 'laptop-code'
        },
        {
            text: "自动控制原理",
            link: 'Principles_of_Automatic_Control_Related/',
            icon: 'gears'
        },
        {
            text: "编码技术",
            link: 'coding_skill/',
            icon: 'dev'
        },
    ], 
    "/postMortem/": [
        '',
        {
            text: "部署",
            link: 'deploy/',
            icon: "box-archive"
        },
        {
            text: "markdown-it渲染器",
            link: 'markdown_render/',
            icon: "markdown"
        }
    ],
    "/complain_diary/": "structure",
    "/learningNote/vueNote/VUE2/": "structure",
    "/learningNote/coding_skill/": "structure",
    "/learningNote/vueNote/VUE3/": "structure",
    "/learningNote/JSNote/": "structure",
    "/learningNote/Computer_Network/": "structure",
    "/learningNote/Principles_of_Computer_Composition/": "structure",
    "/learningNote/Principles_of_Automatic_Control_Related/":"structure",
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

