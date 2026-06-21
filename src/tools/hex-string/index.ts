import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'hex-string',
  category: 'encoding',
  icon: 'Binary',
  i18n: {
    zh: { title: 'Hex / 字符串互转', description: '十六进制与字符串互转，支持空格分隔与大小写。' },
    en: { title: 'Hex ↔ String', description: 'Convert between hex and UTF-8 strings.' },
  },
  keywords: ['hex', '十六进制', '字符', '编码'],
  privacy: 'local',
};
