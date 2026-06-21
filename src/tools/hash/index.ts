import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'hash',
  category: 'encoding',
  icon: 'Hash',
  i18n: {
    zh: { title: 'Hash 计算', description: 'MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512，支持文本与文件。' },
    en: { title: 'Hash', description: 'MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 for text & files.' },
  },
  keywords: ['hash', 'md5', 'sha', '哈希', '摘要', '加密'],
  tags: ['hot'],
  privacy: 'local',
};
