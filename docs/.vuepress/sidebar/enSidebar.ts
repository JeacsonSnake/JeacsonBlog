import { sidebar } from "vuepress-theme-hope";

export const enSidebarConfig = sidebar({
    "/en/": [{
        text: "Home",
        link: '/en/',
        icon: 'house'
    },
    {
        text: "Wiki",
        link: '/en/wiki/',
        icon: 'atom',
        collapsible: true,
    },
    {
        text: "LearningNote",
        link: '/en/learningNote/',
        icon: 'paper-pen'
    },
    {
        text: "Postmortem",
        link: '/en/postMortem/',
        icon: 'diagram-next'
    },
    {
        text: "Automatic AI Industry Analysis Report",
        link: "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/",
        icon: "envelopes-bulk",
        children: [
            "daily/",
            "monthly/",
        ],
        collapsible: true,
    },
    {
        text: "About",
        link: '/en/about/',
        icon: "circle-info"
    },
    ],
    "/en/learningNote/": [
        {
            text: "ROS2 Notes",
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
            icon: 'vuejs'
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
            text: "Computer Networking",
            link: 'Computer_Network/',
            icon: "ethernet"
        },
        {
            text: "Computer Organization",
            link: 'Principles_of_Computer_Composition/',
            icon: 'laptop-code'
        },
        {
            text: "Principles of Automatic Control",
            link: 'Principles_of_Automatic_Control_Related/',
            icon: 'gears'
        },
        {
            text: "Coding Techniques",
            link: 'coding_skill/',
            icon: 'dev'
        },
    ],
    "/en/postMortem/": [
        '',
        {
            text: "Deployment",
            link: 'deploy/',
            icon: "box-archive"
        },
        {
            text: "markdown-it renderer",
            link: 'markdown_render/',
            icon: "markdown"
        },
        {
            text: "LLM Q&A, prompt & skill",
            link: 'sp_for_LLM/',
            icon: "paper-pen"
        },
        {
            text: "Tiny tips",
            link: 'tiny_tips/',
            icon: "crow"
        },
    ],
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/": "structure",
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/daily/": "structure",
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/monthly/": "structure",
    "/en/postMortem/deploy/": "structure",
    "/en/postMortem/markdown_render/": "structure",
    "/en/postMortem/sp_for_LLM/": "structure",
    "/en/postMortem/tiny_tips/": "structure",
    "/en/learningNote/vueNote/VUE2/": "structure",
    "/en/learningNote/vueNote/VUE3/": "structure",
    "/en/learningNote/coding_skill/": "structure",
    "/en/learningNote/Ros2_Note/co_me/": "structure",
    "/en/learningNote/Ros2_Note/co_me_2/": "structure",
    "/en/learningNote/Ros2_Note/launch_rosbag2/": "structure",
    "/en/learningNote/Ros2_Note/coor_trans/": "structure",
    "/en/learningNote/JSNote/": "structure",
    "/en/learningNote/Computer_Network/": "structure",
    "/en/learningNote/Principles_of_Computer_Composition/": "structure",
    "/en/learningNote/Principles_of_Automatic_Control_Related/": "structure",
    "/en/learningNote/TypeScriptNote/": "structure",
});
