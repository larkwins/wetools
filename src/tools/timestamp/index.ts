import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'timestamp',
  category: 'datetime',
  icon: 'Clock',
  i18n: {
    zh: { title: 'Unix 时间戳', description: '秒/毫秒时间戳与日期互转，覆盖多时区。' },
    en: { title: 'Unix Timestamp', description: 'Convert between Unix (s/ms) timestamps and dates.' },
  },
  keywords: ['timestamp', 'unix', '时间戳', 'epoch'],
  tags: ['hot'],
  privacy: 'local',
};
