import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'percentage',
  category: 'cheatsheet',
  icon: 'Percent',
  i18n: {
    zh: { title: '百分比计算', description: '占比 / 涨跌幅 / 增减后值 / 折扣，覆盖日常 4 种场景。' },
    en: { title: 'Percentage Calculator', description: 'Ratio / change / increase-decrease / discount — 4 common scenarios.' },
  },
  keywords: ['percentage', '百分比', '涨幅', '折扣', 'discount'],
  privacy: 'local',
};
