import { navbar } from 'vuepress-theme-hope'

export const enNavbarConfig = navbar([{
            text: 'Home',
            link: '/en/',
            icon: 'house'
        },
        {
            text: 'LearningNote',
            link: '/en/learningnote/',
            icon:"paper-pen"
        },
        {
            text: 'About',
            link: '/en/about/',
            icon: "circle-info"
        },
        {
            text: 'Github',
            link: 'https://Github.com'
        },
    ])