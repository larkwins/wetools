import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'tailwind-cheatsheet',
  category: 'cheatsheet',
  icon: 'ListOrdered',
  i18n: {
    zh: { title: 'Tailwind 速查', description: '搜索 Tailwind 常用 utility 类，复制即用。' },
    en: { title: 'Tailwind Cheatsheet', description: 'Search common Tailwind utilities and copy.' },
  },
  keywords: ['tailwind', 'cheatsheet', 'utility', 'css'],
  privacy: 'local',
};
