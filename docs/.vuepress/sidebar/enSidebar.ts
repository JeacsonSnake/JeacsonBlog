import { sidebar } from "vuepress-theme-hope";

export const enSidebarConfig = sidebar({
    "/en/learningNote/": [{
            text: "Home",
            link: '/en/',
            icon: 'house'

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

