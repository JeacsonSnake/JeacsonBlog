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
        text: "About",
        link: '/en/about/',
        icon: "circle-info"
    },
    ],

});

