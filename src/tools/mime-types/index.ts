import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'mime-types',
  category: 'cheatsheet',
  icon: 'FileType2',
  i18n: {
    zh: { title: 'MIME 类型查询', description: '文件后缀 ↔ MIME 类型双向查询，覆盖 200+ 常见类型。' },
    en: { title: 'MIME Types', description: 'Bidirectional lookup between file extensions and MIME types (200+ entries).' },
  },
  keywords: ['mime', 'content-type', 'extension', 'media type'],
  privacy: 'local',
};
