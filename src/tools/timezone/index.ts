import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'timezone',
  category: 'datetime',
  icon: 'Watch',
  i18n: {
    zh: { title: '时区换算', description: '一个时间，多地查看；支持自定义时区列表。' },
    en: { title: 'Timezone Convert', description: 'View a single moment across many timezones.' },
  },
  keywords: ['timezone', 'tz', '时区'],
  privacy: 'local',
};
