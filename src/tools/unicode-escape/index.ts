import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'unicode-escape',
  category: 'encoding',
  icon: 'Replace',
  i18n: {
    zh: { title: 'Unicode 转义', description: '\\uXXXX 与原文互转，支持非 BMP 代理对。' },
    en: { title: 'Unicode Escape', description: 'Convert between text and \\uXXXX escape forms.' },
  },
  keywords: ['unicode', 'escape', '\\u', '转义'],
  privacy: 'local',
};
