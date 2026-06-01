import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'color-convert',
  category: 'common',
  icon: 'Palette',
  i18n: {
    zh: { title: '颜色转换', description: 'HEX / RGB / HSL / HSV 互转，附带预览块。' },
    en: { title: 'Color Convert', description: 'Convert between HEX / RGB / HSL / HSV with preview.' },
  },
  keywords: ['color', 'hex', 'rgb', 'hsl', 'hsv', '颜色'],
  privacy: 'local',
};
