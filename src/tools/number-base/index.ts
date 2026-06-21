import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'number-base',
  category: 'cheatsheet',
  icon: 'Calculator',
  i18n: {
    zh: { title: '进制转换', description: '二/八/十/十六进制及任意 2–36 进制互转。' },
    en: { title: 'Number Base', description: 'Convert numbers between any base (2 to 36).' },
  },
  keywords: ['二进制', '十六进制', '进制', '数字', '数学'],
  privacy: 'local',
};
