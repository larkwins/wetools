import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'color-convert',
  category: 'common',
  icon: 'Palette',
  i18n: {
    zh: { title: '颜色转换', description: 'HEX / RGB / HSL / HSV 互转，附带预览块。' },
    en: { title: 'Color Convert', description: 'Convert between HEX / RGB / HSL / HSV with preview.' },
  },
  keywords: ['颜色', 'rgb', 'hex', '前端', 'css', '设计'],
  privacy: 'local',
};
