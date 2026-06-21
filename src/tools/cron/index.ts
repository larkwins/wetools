import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'cron',
  category: 'common',
  icon: 'CalendarClock',
  i18n: {
    zh: { title: 'Cron 解析', description: '人类可读描述 + 接下来 N 次执行时间。' },
    en: { title: 'Cron Parser', description: 'Human-readable description and next N runs.' },
  },
  keywords: ['cron', '定时任务', '时间', '调度'],
  privacy: 'local',
};
