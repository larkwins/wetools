import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'image-base64',
  category: 'image',
  icon: 'FileImage',
  i18n: {
    zh: { title: '图片 ↔ Base64', description: '图片与 Data URL 互转，方便嵌入 CSS / HTML。' },
    en: { title: 'Image ↔ Base64', description: 'Convert image to/from base64 data URL.' },
  },
  keywords: ['image', 'base64', 'data', 'url'],
  privacy: 'local',
};
