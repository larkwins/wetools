import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'meta-tag',
  category: 'generator',
  icon: 'Tags',
  i18n: {
    zh: { title: 'HTML Meta Tag 生成', description: '生成 SEO / Open Graph / Twitter Card meta 标签。' },
    en: { title: 'HTML Meta Tag Generator', description: 'Generate SEO / Open Graph / Twitter Card meta tags.' },
  },
  keywords: ['seo', 'html', '前端', 'web', '社交媒体'],
  privacy: 'local',
};
