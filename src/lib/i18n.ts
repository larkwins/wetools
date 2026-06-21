import type { ToolMeta } from './types';

export type Locale = 'zh-CN' | 'zh-TW' | 'en';
export type BaseLang = 'zh' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'zh-TW', 'en'];
export const DEFAULT_LOCALE: Locale = 'zh-CN';

export function localeToBase(locale: Locale): BaseLang {
  return locale === 'en' ? 'en' : 'zh';
}

/** 给定 locale 与 tool meta，返回当前语言下的标题/描述（繁体由 OpenCC 自动转换） */
export function pickI18n(meta: ToolMeta, locale: Locale) {
  const base = localeToBase(locale);
  const raw = meta.i18n[base] ?? meta.i18n.zh;
  if (locale === 'zh-TW') {
    return {
      title: toTraditional(raw.title),
      description: toTraditional(raw.description),
    };
  }
  return raw;
}

/**
 * 简体 → 繁体转换（OpenCC s2twp 词组级转换，效果接近台湾正体）
 * 客户端懒加载，SSR 阶段直接返回原文
 */
let converter: ((s: string) => string) | null = null;
let loading: Promise<void> | null = null;

/** 启动 OpenCC 异步加载（幂等） */
function startLoadOpenCC(): Promise<void> {
  if (loading) return loading;
  if (typeof window === 'undefined') return Promise.resolve();
  loading = import('opencc-js').then((mod) => {
    const ConverterFactory = (mod as any).Converter ?? (mod as any).default?.Converter;
    converter = ConverterFactory({ from: 'cn', to: 'twp' });
  });
  return loading;
}

export function toTraditional(text: string): string {
  if (!text) return text;
  if (converter) return converter(text);
  // 在客户端首次调用时启动加载；本次仍返回原文，调用方应通过 waitOpenCC() 等待后重试
  startLoadOpenCC();
  return text;
}

/** 等待 OpenCC 加载完成（用于 mounted 后强制刷新一次显示） */
export function waitOpenCC(): Promise<void> {
  if (converter) return Promise.resolve();
  // 主动启动加载并等待它完成；之前依赖 toTraditional('') 触发会因为空串短路而失败
  return startLoadOpenCC();
}

/** 站点级文案字典 */
export const siteDict = {
  'zh-CN': {
    siteName: 'WeTools',
    tagline: '程序员的浏览器工具箱',
    home: {
      badge: '数据 100% 本地处理',
      title1: '开发者',
      title2: '浏览器工具箱',
      desc: (n: number) => `${n} 个常用工具，无需安装、无需注册、数据不离开你的设备。开源免费。`,
      favorites: '我的收藏',
    },
    search: {
      placeholder: '搜索工具…',
      noResults: '没有匹配的工具',
      results: '搜索结果',
      recent: '最近使用',
      favorites: '收藏',
      navigate: '选择',
      open: '打开',
      close: '关闭',
      count: (n: number) => `${n} 项`,
    },
    nav: {
      home: '首页',
      about: '关于',
      github: 'GitHub',
      openMenu: '打开菜单',
    },
    tool: {
      copy: '复制',
      copied: '已复制',
      clear: '清空',
      favorite: '收藏',
      unfavorite: '取消收藏',
      copyLink: '复制链接',
      related: '相关工具',
      runsLocally: '本地处理',
      usesExternal: '调用外部 API',
    },
    footer: {
      copyright: (year: number) => `© ${year} WeTools · 100%本地运行的开发者工具箱`,
      about: '关于',
    },
    theme: {
      toggle: '切换主题',
    },
    lang: {
      switch: '切换语言',
    },
  },
  'zh-TW': {
    siteName: 'WeTools',
    tagline: '程式設計師的瀏覽器工具箱',
    home: {
      badge: '資料 100% 本地處理',
      title1: '開發者',
      title2: '瀏覽器工具箱',
      desc: (n: number) => `${n} 個常用工具，無需安裝、無需註冊、資料不離開你的裝置。開放原始碼、免費。`,
      favorites: '我的收藏',
    },
    search: {
      placeholder: '搜尋工具…',
      noResults: '沒有符合的工具',
      results: '搜尋結果',
      recent: '最近使用',
      favorites: '收藏',
      navigate: '選擇',
      open: '開啟',
      close: '關閉',
      count: (n: number) => `${n} 項`,
    },
    nav: {
      home: '首頁',
      about: '關於',
      github: 'GitHub',
      openMenu: '開啟選單',
    },
    tool: {
      copy: '複製',
      copied: '已複製',
      clear: '清空',
      favorite: '收藏',
      unfavorite: '取消收藏',
      copyLink: '複製連結',
      related: '相關工具',
      runsLocally: '本地處理',
      usesExternal: '呼叫外部 API',
    },
    footer: {
      copyright: (year: number) => `© ${year} WeTools · 本地執行`,
      about: '關於',
    },
    theme: {
      toggle: '切換主題',
    },
    lang: {
      switch: '切換語言',
    },
  },
  en: {
    siteName: 'WeTools',
    tagline: 'A Developer Toolbox in Your Browser',
    home: {
      badge: '100% local — your data stays on your device',
      title1: 'Developer ',
      title2: 'Browser Toolbox',
      desc: (n: number) =>
        `${n} essential tools, no install, no signup, your data never leaves your device. Free & open source.`,
      favorites: 'My Favorites',
    },
    search: {
      placeholder: 'Search tools…',
      noResults: 'No matches',
      results: 'Results',
      recent: 'Recent',
      favorites: 'Favorites',
      navigate: 'navigate',
      open: 'open',
      close: 'close',
      count: (n: number) => `${n} tools`,
    },
    nav: {
      home: 'Home',
      about: 'About',
      github: 'GitHub',
      openMenu: 'Open menu',
    },
    tool: {
      copy: 'Copy',
      copied: 'Copied',
      clear: 'Clear',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      copyLink: 'Copy link',
      related: 'Related tools',
      runsLocally: 'Runs locally',
      usesExternal: 'Uses external API',
    },
    footer: {
      copyright: (year: number) => `© ${year} WeTools · Runs locally`,
      about: 'About',
    },
    theme: {
      toggle: 'Toggle theme',
    },
    lang: {
      switch: 'Change language',
    },
  },
} as const;

export type SiteDict = (typeof siteDict)['zh-CN'];

export function getDict(locale: Locale): SiteDict {
  return (siteDict[locale] ?? siteDict['zh-CN']) as SiteDict;
}
