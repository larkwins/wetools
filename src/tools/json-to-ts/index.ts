import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-to-ts',
  category: 'converter',
  icon: 'Code2',
  i18n: {
    zh: { title: 'JSON → TypeScript', description: '从任意 JSON 生成 TypeScript Interface / Type 定义。' },
    en: { title: 'JSON → TypeScript', description: 'Generate TypeScript interfaces from any JSON.' },
  },
  keywords: ['json', 'typescript', 'interface', 'ts'],
  tags: ['new'],
  privacy: 'local',
};
