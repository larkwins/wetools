import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'placeholder-image',
  category: 'generator',
  icon: 'FileImage',
  i18n: {
    zh: {
      title: '占位图生成',
      description: '生成纯色 / 渐变占位图，可下载 PNG / SVG，支持自定义文字与配色。',
    },
    en: {
      title: 'Placeholder Image',
      description: 'Generate solid / gradient placeholder images. Download PNG / SVG with custom text & colors.',
    },
  },
  keywords: ['image', 'svg', 'png', '图片', '占位图'],
  privacy: 'local',
};
