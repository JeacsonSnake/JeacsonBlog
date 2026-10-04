import { navbar } from 'vuepress-theme-hope'

const hostname = 'https://blog.jeacsonsnake.com';

export const enNavbarConfig = navbar([{
    text: 'Home',
    link: '/en/',
    icon: 'house'
},
{
    text: 'Wiki',
    link: '/wiki/',
    icon: 'atom'
},
{
    text: 'LearningNote',
    link: '/en/learningNote/',
    icon: "paper-pen"
},
{
    text: "AI Industry Analysis Report",
    link: "/en/Scheduled_Automatic_AI_Industry_Analysis_Report/",
    icon: "envelopes-bulk",
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