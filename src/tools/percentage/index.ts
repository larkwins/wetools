import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'percentage',
  category: 'cheatsheet',
  icon: 'Percent',
  i18n: {
    zh: { title: '百分比计算', description: '占比 / 涨跌幅 / 增减后值 / 折扣，覆盖日常 4 种场景。' },
    en: { title: 'Percentage Calculator', description: 'Ratio / change / increase-decrease / discount — 4 common scenarios.' },
  },
  keywords: ['百分比', '折扣', '数学', '数字', '计算器'],
  privacy: 'local',
};
