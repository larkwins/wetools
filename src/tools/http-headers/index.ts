import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'http-headers',
  category: 'cheatsheet',
  icon: 'ListChecks',
  i18n: {
    zh: { title: 'HTTP 请求/响应头速查', description: '常见 HTTP 请求头与响应头说明，分类筛选 + 搜索。' },
    en: { title: 'HTTP Headers Cheatsheet', description: 'Common HTTP request / response headers with descriptions, filter & search.' },
  },
  keywords: ['http', '请求头', '网络', 'web', 'cors'],
  privacy: 'local',
};
