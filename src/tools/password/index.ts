import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'password',
  category: 'generator',
  icon: 'KeyRound',
  i18n: {
    zh: { title: '随机密码', description: '可配置字符集、长度、批量生成；可排除易混淆字符。' },
    en: { title: 'Random Password', description: 'Configurable charset, length, batch — exclude look-alikes.' },
  },
  keywords: ['password', '密码', 'random', 'secure'],
  privacy: 'local',
};
