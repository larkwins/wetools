import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'yaml-toml',
  category: 'converter',
  icon: 'FileCode',
  i18n: {
    zh: { title: 'YAML ↔ TOML', description: '在 YAML 与 TOML 之间互转，配置迁移利器。' },
    en: { title: 'YAML ↔ TOML', description: 'Convert between YAML and TOML for config migrations.' },
  },
  keywords: ['yaml', 'toml', '配置文件', '数据'],
  privacy: 'local',
};
