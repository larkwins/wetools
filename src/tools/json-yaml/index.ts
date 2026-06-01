import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-yaml',
  category: 'converter',
  icon: 'Layers',
  i18n: {
    zh: { title: 'JSON ↔ YAML', description: '在 JSON 与 YAML 之间互转，保留注释结构能力有限。' },
    en: { title: 'JSON ↔ YAML', description: 'Convert between JSON and YAML.' },
  },
  keywords: ['json', 'yaml', 'yml'],
  privacy: 'local',
};
