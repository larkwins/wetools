import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'mock-data',
  category: 'generator',
  icon: 'Database',
  i18n: {
    zh: { title: 'Mock 假数据', description: '一键生成姓名 / 邮箱 / 电话 / 地址等 JSON 假数据。' },
    en: { title: 'Mock Data', description: 'Generate fake names / emails / phones / addresses as JSON.' },
  },
  keywords: ['mock', 'fake', '假数据', 'faker'],
  privacy: 'local',
};
