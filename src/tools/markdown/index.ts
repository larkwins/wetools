import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'markdown',
  category: 'text',
  icon: 'FileText',
  i18n: {
    zh: { title: 'Markdown 预览', description: '实时渲染 Markdown，输出 HTML 已 sanitize。' },
    en: { title: 'Markdown Preview', description: 'Live Markdown rendering with sanitized HTML output.' },
  },
  keywords: ['markdown', 'html', '文本', '富文本'],
  privacy: 'local',
};
