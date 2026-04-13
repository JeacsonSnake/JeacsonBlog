import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbarConfig, enNavbarConfig } from "./navbar";
import { zhSidebarConfig, enSidebarConfig } from './sidebar'

/* Your themeConfig here */

export default hopeTheme({
    // 导航栏相关设置
    logo: '/assets/img/logo.png',
    favicon: "/assets/img/favicon.ico",
    lastUpdated: true,
    // hotReload:true,
    // 必须：设置网站域名，用于生成正确的 RSS 链接
    hostname: "https://blog.jeacsonsnake.com",
    plugins: {
        // 启用博客功能
        blog: true,
        comment: {
            provider: "Waline",

            // waline 模式下
            serverURL: "https://blogcomment.jeacsonsnake.com/", // your serverURL
        },
        icon: {
            assets: ['//at.alicdn.com/t/c/font_4219909_64bpqxxnfhg.css'],
            prefix: 'iconfont icon-',
        },
        // Feed 插件配置
        feed: {
            // 启用 RSS 2.0 格式
            rss: true,

            // 可选：启用 Atom 和 JSON 格式
            atom: true,
            json: true,

            // 严格过滤器，排除所有可能导致摘要提取失败的页面
            filter: (page) => {
                // 必须：排除主页
                if (page.frontmatter?.home) return false;

                // 必须：排除所有非文章页面（如 404、自动生成的页面）
                if (!page.filePathRelative?.endsWith('.md')) return false;

                // 排除明确标记不加入 feed 的页面
                if (page.frontmatter?.feed === false) return false;
                if (page.frontmatter?.article === false) return false;

                // 排除特定布局的页面（如 Slide、Presentation、404 布局）
                const layout = page.frontmatter?.layout;
                const excludedLayouts = ['404', 'Slide', 'Presentation', 'NotFound'];
                if (typeof layout === 'string' && excludedLayouts.includes(layout)) return false;

                // 可选：确保页面有实际内容（通过 frontmatter 检查）
                if (!page.content || page.content.trim().length === 0) {
                    console.log('No content:', page.path, page.filePathRelative);
                    return false;
                }

                return true;
            },

            // 排序：确保最新的文章在前
            sorter: (pageA, pageB) => {
                const dateA = pageA.frontmatter?.date || (pageA.data?.git as any)?.createdTime || 0;
                const dateB = pageB.frontmatter?.date || (pageB.data?.git as any)?.createdTime || 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            },

            // 关键：使用 getter 完全接管，绕过自动摘要提取（避免 getPageExcerpt 报错）
            getter: {
                // 标题
                title: (page) => page.frontmatter?.title || page.title || '无标题',

                // 链接
                link: (page) => page.path,

                // 内容：直接返回页面内容，不使用内部 excerpt 逻辑
                content: (page) => {
                    // 检查 feed 是否为对象（排除 false 的情况）
                    const feedOption = page.frontmatter?.feed;
                    if (feedOption && typeof feedOption === 'object' && 'excerpt' in feedOption) {
                        return String(feedOption.excerpt);
                    }
                    // 使用 description 作为备选
                    if (page.frontmatter?.description) {
                        return String(page.frontmatter.description);
                    }
                    return page.content || '';
                },

                // 作者：返回 FeedAuthor[] 类型
                author: (page) => {
                    const fmAuthor = page.frontmatter?.author;
                    let name = 'xxx'; // 默认作者

                    if (typeof fmAuthor === 'string') {
                        name = fmAuthor;
                    } else if (Array.isArray(fmAuthor) && fmAuthor.length > 0) {
                        // 如果是数组，取第一个元素（如果是字符串数组）
                        if (typeof fmAuthor[0] === 'string') {
                            name = fmAuthor[0];
                        } else {
                            // 如果是 AuthorInfo 对象数组
                            name = (fmAuthor[0] as { name?: string }).name || 'xxx';
                        }
                    } else if (fmAuthor && typeof fmAuthor === 'object') {
                        // 单个 AuthorInfo 对象
                        name = (fmAuthor as { name?: string }).name || 'xxx';
                    }

                    return [{ name }];
                },

                // 发布日期
                publishDate: (page) => {
                    const date = page.frontmatter?.date;
                    return date ? new Date(date) : new Date();
                },

                // 分类：返回 FeedCategory[] 类型
                category: (page) => {
                    const cats = page.frontmatter?.categories || page.frontmatter?.category || [];
                    const catArray = Array.isArray(cats) ? cats : [cats];

                    // 映射为 FeedCategory[] 格式
                    return catArray
                        .filter((cat): cat is string => typeof cat === 'string' && cat.length > 0)
                        .map((name) => ({ name }));
                },
            },

            // 频道设置
            channel: {
                // 版权信息
                copyright: "Copyright © 2023-present Jeacson She",
                // 发布日期（ISO 格式）
                pubDate: new Date(),
                // 更新周期（分钟）
                ttl: 60 * 24,
            },

            // 图片设置
            image: "/assets/img/logo.png",
            icon: "/assets/img/favicon.ico",

            // 最大条目数（默认 100）
            count: 50,

        },
    },
    markdown: {
        // 开启可指定图像大小
        imgSize: true,
        // 使用 KaTeX 启用 TeX 支持
        math: {
            type: "katex",
        },
        // 添加选项卡支持
        tabs: true,
        // 使站点中的 Markdown 文件支持脚注
        footnote: true,
        // 启用下角标功能
        sub: true,
        // 启用上角标功能
        sup: true,
        // 启用自定义属性
        attrs: true,
    },
    blog: {
        avatar: '/assets/img/avatar.jpg',
        name: 'Jeacson She',
        description: "Mind your step",
        medias: {
            'Email': 'https://Jeacson_Snake@outlook.com',
            "GitHub": 'https://github.com/JeacsonSnake'
        }
    },
    author: {
        name: "Jeacson She"
    },
    locales: {
        '/': {
            navbar: zhNavbarConfig,
            sidebar: zhSidebarConfig,
        },
        '/en/': {
            navbar: enNavbarConfig,
            sidebar: enSidebarConfig,
        }
    },
    sidebarSorter: ["readme", "order", "date", "title", "filename"]


})