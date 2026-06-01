import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ascii-art',
  category: 'generator',
  icon: 'Type',
  i18n: {
    zh: { title: 'ASCII 字符画', description: '将文本渲染为 ASCII 字符画（figlet 字体），支持多种字体。' },
    en: { title: 'ASCII Art', description: 'Render text as ASCII art using figlet fonts.' },
  },
  keywords: ['ascii', 'art', 'figlet', '字符画', 'banner'],
  privacy: 'local',
};
