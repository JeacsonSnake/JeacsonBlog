import { navbar } from 'vuepress-theme-hope'

const hostname = 'https://blog.jeacsonsnake.com';

export const enNavbarConfig = navbar([{
    text: 'Home',
    link: '/en/',
    icon: 'house'
},
{
    text: 'LearningNote',
    link: '/en/learningNote/',
    icon: "paper-pen"
},
{
    text: 'About',
    link: '/en/about/',
    icon: "circle-info"
},
{
    text: "RSS",
    link: `${hostname}/rss.xml`,
    icon: "rss",
},
{
    text: 'Github',
    link: 'https://Github.com'
},
])