import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'css-units',
  category: 'cheatsheet',
  icon: 'Ruler',
  i18n: {
    zh: { title: 'CSS 单位换算', description: 'px / rem / em / vw / vh / pt 互转，可设根字号与视口宽。' },
    en: { title: 'CSS Units Convert', description: 'Convert px / rem / em / vw / vh / pt with custom base.' },
  },
  keywords: ['css', '单位', '前端', 'web', '数字'],
  privacy: 'local',
};
