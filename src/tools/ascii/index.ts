import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ascii',
  category: 'cheatsheet',
  icon: 'Table',
  i18n: {
    zh: { title: 'ASCII 码表', description: '0-127 标准 ASCII 表：dec / hex / oct / bin / 字符 / 描述。' },
    en: { title: 'ASCII Table', description: 'Full ASCII table (0-127) with dec / hex / oct / bin / char / desc.' },
  },
  keywords: ['ascii', '码表', 'character', 'hex', 'binary'],
  privacy: 'local',
};
