import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'world-clock',
  category: 'common',
  icon: 'Globe',
  i18n: {
    zh: { title: '世界时钟', description: '实时显示全球主要城市的当前时间，支持农历。' },
    en: { title: 'World Clock', description: 'Real-time clock for major cities worldwide.' },
  },
  keywords: ['world', 'clock', 'time', 'timezone', '世界时间', '时区', '时钟'],
  privacy: 'local',
};
