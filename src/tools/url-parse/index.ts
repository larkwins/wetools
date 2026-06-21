import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'url-parse',
  category: 'web',
  icon: 'Link',
  i18n: {
    zh: { title: 'URL 解析', description: '拆解 URL 各部分，可视化查询参数表，支持快速编辑。' },
    en: { title: 'URL Parser', description: 'Break a URL into parts and edit query params visually.' },
  },
  keywords: ['url', 'uri', '网络', '查询参数'],
  privacy: 'local',
};
