import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'lorem',
  category: 'generator',
  icon: 'FileText',
  i18n: {
    zh: { title: 'Lorem Ipsum', description: '生成 Lorem Ipsum / 中文乱数文本，用于占位排版。' },
    en: { title: 'Lorem Ipsum', description: 'Generate Lorem Ipsum or CJK placeholder text.' },
  },
  keywords: ['lorem', 'ipsum', '占位', '段落'],
  privacy: 'local',
};
