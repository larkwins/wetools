import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'base64',
  category: 'encoding',
  icon: 'Binary',
  i18n: {
    zh: { title: 'Base64 编解码', description: '文本与 Base64 互转，支持 UTF-8 与 URL Safe 模式。' },
    en: { title: 'Base64 Encode/Decode', description: 'Encode/decode Base64 with UTF-8 & URL-safe support.' },
  },
  keywords: ['base64', '编码', '文本'],
  tags: ['hot'],
  privacy: 'local',
};
