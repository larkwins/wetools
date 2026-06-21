import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-diff',
  category: 'converter',
  icon: 'GitCompare',
  i18n: {
    zh: { title: 'JSON Diff', description: '结构化对比两段 JSON，按字段层级展示新增、删除、修改。' },
    en: { title: 'JSON Diff', description: 'Structurally diff two JSON values, listing added / removed / changed keys.' },
  },
  keywords: ['json', 'diff', '对比', '数据'],
  privacy: 'local',
};
