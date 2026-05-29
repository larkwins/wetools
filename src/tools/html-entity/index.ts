import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'html-entity',
  category: 'encoding',
  icon: 'Quote',
  i18n: {
    zh: { title: 'HTML 实体编解码', description: '转义 & < > " \' 等 HTML 特殊字符。' },
    en: { title: 'HTML Entity Encode/Decode', description: 'Escape/unescape HTML special characters.' },
  },
  keywords: ['html', 'entity', 'escape', 'unescape', '转义'],
  privacy: 'local',
};
