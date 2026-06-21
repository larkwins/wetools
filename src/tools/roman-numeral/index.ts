import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'roman-numeral',
  category: 'converter',
  icon: 'Hash',
  i18n: {
    zh: { title: '罗马数字转换', description: '阿拉伯数字与罗马数字互转（1 - 3999）。' },
    en: { title: 'Roman Numeral Converter', description: 'Convert between Arabic and Roman numerals (1 - 3999).' },
  },
  keywords: ['罗马数字', '数字', '数学'],
  privacy: 'local',
};
