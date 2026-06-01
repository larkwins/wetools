import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'xml-format',
  category: 'converter',
  icon: 'FileCode',
  i18n: {
    zh: { title: 'XML 格式化 / 压缩', description: '美化或压缩 XML，可调缩进。' },
    en: { title: 'XML Format / Minify', description: 'Beautify or minify XML with configurable indent.' },
  },
  keywords: ['xml', 'format', 'beautify', 'minify'],
  privacy: 'local',
};
