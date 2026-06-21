import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'random',
  category: 'generator',
  icon: 'Dice5',
  i18n: {
    zh: { title: '随机数', description: '范围内整数 / 浮点数批量生成，去重可选。' },
    en: { title: 'Random Number', description: 'Generate random integers or floats within a range.' },
  },
  keywords: ['随机数', '数字', '数学'],
  privacy: 'local',
};
