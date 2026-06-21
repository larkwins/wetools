import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-csv',
  category: 'converter',
  icon: 'Database',
  i18n: {
    zh: { title: 'JSON ↔ CSV', description: '对象数组与 CSV 互转，可选分隔符与首列字段顺序。' },
    en: { title: 'JSON ↔ CSV', description: 'Convert array of objects to/from CSV.' },
  },
  keywords: ['json', 'csv', '表格', '数据'],
  privacy: 'local',
};
