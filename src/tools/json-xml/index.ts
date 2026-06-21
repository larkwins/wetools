import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-xml',
  category: 'converter',
  icon: 'FileCode',
  i18n: {
    zh: { title: 'JSON ↔ XML', description: '在 JSON 与 XML 之间互转，可调缩进、根元素名。' },
    en: { title: 'JSON ↔ XML', description: 'Convert between JSON and XML with custom indent & root.' },
  },
  keywords: ['json', 'xml', '数据'],
  privacy: 'local',
};
