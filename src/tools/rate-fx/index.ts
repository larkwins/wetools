import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'rate-fx',
  category: 'cheatsheet',
  icon: 'CircleDollarSign',
  i18n: {
    zh: { title: '实时汇率', description: '查询任意货币间的实时汇率（数据源：exchangerate-api.com 公开 API）。' },
    en: { title: 'Forex Rates', description: 'Real-time exchange rates between any two currencies (source: exchangerate-api.com public API).' },
  },
  keywords: ['汇率', '货币', '数字', '金融'],
  privacy: 'external',
};
