import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-toml',
  category: 'converter',
  icon: 'FileCode',
  i18n: {
    zh: { title: 'JSON ↔ TOML', description: '在 JSON 与 TOML 之间互转，配置文件友好。' },
    en: { title: 'JSON ↔ TOML', description: 'Convert between JSON and TOML — config-file friendly.' },
  },
  keywords: ['json', 'toml', '配置文件', '数据'],
  privacy: 'local',
};
