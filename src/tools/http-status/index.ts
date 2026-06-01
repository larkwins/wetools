import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'http-status',
  category: 'network',
  icon: 'FileWarning',
  i18n: {
    zh: { title: 'HTTP 状态码', description: '常见 HTTP 状态码速查与说明，支持搜索与分类筛选。' },
    en: { title: 'HTTP Status Codes', description: 'Cheatsheet for HTTP status codes with search & filter.' },
  },
  keywords: ['http', 'status', '状态码', '404', '500', 'rfc'],
  privacy: 'local',
};
