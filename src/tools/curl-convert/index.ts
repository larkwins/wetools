import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'curl-convert',
  category: 'web',
  icon: 'TerminalSquare',
  i18n: {
    zh: { title: 'cURL 转代码', description: '把 cURL 命令转成 fetch / axios 代码。' },
    en: { title: 'cURL → Code', description: 'Convert cURL command to fetch / axios code.' },
  },
  keywords: ['curl', 'http', '网络', '代码', 'web'],
  tags: ['new'],
  privacy: 'local',
};
