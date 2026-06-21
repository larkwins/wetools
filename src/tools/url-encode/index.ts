import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'url-encode',
  category: 'encoding',
  icon: 'Link',
  i18n: {
    zh: { title: 'URL 编解码', description: 'encodeURIComponent / decodeURIComponent，按行批量处理。' },
    en: { title: 'URL Encode/Decode', description: 'Encode/decode URI components, line-batch supported.' },
  },
  keywords: ['url', 'uri', '编码', '网络'],
  privacy: 'local',
};
