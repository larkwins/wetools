import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'text-utils',
  category: 'text',
  icon: 'Rows3',
  i18n: {
    zh: { title: '文本工具集', description: '去重、排序、反转、字数统计、行号、去空行等常用文本操作。' },
    en: { title: 'Text Utilities', description: 'Dedupe, sort, reverse, count, line numbers, trim — text essentials.' },
  },
  keywords: ['text', '去重', '排序', '反转', '统计'],
  privacy: 'local',
};
