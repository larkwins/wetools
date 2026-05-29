import type { ToolMeta } from './types';

export type Locale = 'zh' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['zh', 'en'];
export const DEFAULT_LOCALE: Locale = 'zh';

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'zh';
}

/** 给定 locale 与 tool meta，返回当前语言下的标题/描述 */
export function pickI18n(meta: ToolMeta, locale: Locale) {
  return meta.i18n[locale] ?? meta.i18n[DEFAULT_LOCALE];
}

/** 站点级文案字典（最小子集，菜单/按钮等通用文案） */
export const siteDict = {
  zh: {
    siteName: 'WeTools',
    tagline: '程序员的浏览器工具箱',
    heroSub:
      '40+ 个开箱即用的开发者工具：JSON、Base64、加密哈希、二维码、时间戳、正则、图片压缩…… 全部在你的浏览器本地完成。',
    heroBadge: '100% 本地运行 · 不上传任何数据',
    heroPrimary: '打开命令面板',
    heroSecondary: '浏览全部工具',
    searchPlaceholder: '搜索工具…',
    nav: {
      home: '首页',
      about: '关于',
      github: 'GitHub',
    },
    sidebar: {
      favorites: '收藏',
      recents: '最近使用',
      allTools: '全部工具',
      noFavorites: '点击工具页右上角的星标即可收藏',
    },
    privacy: {
      local: '所有计算在你的浏览器本地完成，不上传任何数据。',
      external: '本工具会调用第三方公开接口，请注意隐私。',
      badgeLocal: '本地处理',
      badgeExternal: '调用外部 API',
    },
    tool: {
      copy: '复制',
      copied: '已复制',
      clear: '清空',
      download: '下载',
      upload: '上传',
      paste: '粘贴',
      input: '输入',
      output: '输出',
      related: '相关工具',
      backHome: '返回首页',
    },
    footer: {
      madeBy: '专为开发者打造，开源、免费、无追踪。',
      privacy: '隐私声明',
      about: '关于',
      source: '源码',
    },
    notFound: {
      title: '页面没找到',
      desc: '我们没找到这个页面，但你可以从下面继续。',
    },
  },
  en: {
    siteName: 'WeTools',
    tagline: 'A Developer Toolbox in Your Browser',
    heroSub:
      '40+ ready-to-use developer tools — JSON, Base64, hashing, QR, timestamps, regex, image compression — all running locally in your browser.',
    heroBadge: '100% local · No data ever leaves your browser',
    heroPrimary: 'Open command palette',
    heroSecondary: 'Browse all tools',
    searchPlaceholder: 'Search tools…',
    nav: {
      home: 'Home',
      about: 'About',
      github: 'GitHub',
    },
    sidebar: {
      favorites: 'Favorites',
      recents: 'Recent',
      allTools: 'All tools',
      noFavorites: 'Star a tool from its page header to pin it here.',
    },
    privacy: {
      local: 'Everything runs locally in your browser. No data is uploaded.',
      external: 'This tool calls a third-party public API. Mind your privacy.',
      badgeLocal: 'Runs locally',
      badgeExternal: 'Uses external API',
    },
    tool: {
      copy: 'Copy',
      copied: 'Copied',
      clear: 'Clear',
      download: 'Download',
      upload: 'Upload',
      paste: 'Paste',
      input: 'Input',
      output: 'Output',
      related: 'Related tools',
      backHome: 'Back home',
    },
    footer: {
      madeBy: 'Built for developers — open source, free, no tracking.',
      privacy: 'Privacy',
      about: 'About',
      source: 'Source',
    },
    notFound: {
      title: 'Page not found',
      desc: 'The page you tried to reach is missing — but you can keep exploring.',
    },
  },
} as const;

export type SiteDict = (typeof siteDict)['zh'];
