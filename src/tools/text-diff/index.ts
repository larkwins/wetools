import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'text-diff',
  category: 'text',
  icon: 'Diff',
  i18n: {
    zh: { title: '文本 Diff', description: '行级 / 字符级文本对比，高亮新增、删除、修改。' },
    en: { title: 'Text Diff', description: 'Line- or char-level diff with highlights.' },
  },
  keywords: ['diff', '对比', 'compare'],
  privacy: 'local',
};
