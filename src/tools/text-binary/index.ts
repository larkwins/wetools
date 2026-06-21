import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'text-binary',
  category: 'generator',
  icon: 'Binary',
  i18n: {
    zh: { title: '文本 ↔ 二进制', description: '文本与 0/1 二进制串互转，UTF-8 编码，可调分隔符。' },
    en: { title: 'Text ↔ Binary', description: 'Convert text to / from 0/1 binary strings (UTF-8) with custom separator.' },
  },
  keywords: ['二进制', '文本', '编码'],
  privacy: 'local',
};
