import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'meta-tag',
  category: 'generator',
  icon: 'Tags',
  i18n: {
    zh: { title: 'Meta Tag 生成', description: '生成 SEO / Open Graph / Twitter Card meta 标签。' },
    en: { title: 'Meta Tag Generator', description: 'Generate SEO / Open Graph / Twitter Card meta tags.' },
  },
  keywords: ['meta', 'seo', 'og', 'opengraph', 'twitter', 'social'],
  privacy: 'local',
};
