import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'image-compress',
  category: 'common',
  icon: 'ImageDown',
  i18n: {
    zh: { title: '图片压缩', description: '本地压缩图片（基于 Web Worker），可指定最大边长与质量。' },
    en: { title: 'Image Compress', description: 'Locally compress images (Web Worker) with size & quality knobs.' },
  },
  keywords: ['image', '图片', 'png', 'jpg', 'webp', '压缩'],
  privacy: 'local',
};
