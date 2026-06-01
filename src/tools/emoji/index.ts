import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'emoji',
  category: 'text',
  icon: 'Smile',
  i18n: {
    zh: { title: 'Emoji 选择器', description: '搜索常用 Emoji，点击复制；支持分类筛选与肤色变体。' },
    en: { title: 'Emoji Picker', description: 'Search common emojis, click to copy. Category filter & skin tones.' },
  },
  keywords: ['emoji', 'picker', 'unicode', '表情'],
  privacy: 'local',
};
