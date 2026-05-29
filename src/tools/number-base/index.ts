import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'number-base',
  category: 'dev',
  icon: 'Calculator',
  i18n: {
    zh: { title: '进制转换', description: '二/八/十/十六进制及任意 2–36 进制互转。' },
    en: { title: 'Number Base', description: 'Convert numbers between any base (2 to 36).' },
  },
  keywords: ['base', 'binary', 'hex', 'oct', 'radix', '进制'],
  privacy: 'local',
};
