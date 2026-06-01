import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'css-units',
  category: 'cheatsheet',
  icon: 'Ruler',
  i18n: {
    zh: { title: 'CSS 单位换算', description: 'px / rem / em / vw / vh / pt 互转，可设根字号与视口宽。' },
    en: { title: 'CSS Units Convert', description: 'Convert px / rem / em / vw / vh / pt with custom base.' },
  },
  keywords: ['css', 'px', 'rem', 'em', 'vw', '单位'],
  privacy: 'local',
};
