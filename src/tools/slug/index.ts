import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'slug',
  category: 'text',
  icon: 'Link2',
  i18n: {
    zh: { title: 'Slug 字符串', description: '把任意文本转为 URL 友好的 slug（含中文音译、特殊字符清理）。' },
    en: { title: 'Slugify', description: 'Turn any text into URL-friendly slugs (with CJK transliteration & special-char cleanup).' },
  },
  keywords: ['slug', 'url', '拼音', '文本'],
  privacy: 'local',
};
