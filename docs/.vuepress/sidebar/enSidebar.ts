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
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/": "structure",
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/daily/": "structure",
    "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/monthly/": "structure",


});

