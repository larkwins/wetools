import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'uuid',
  category: 'generator',
  icon: 'Fingerprint',
  i18n: {
    zh: { title: 'UUID / NanoID', description: '批量生成 UUID v4 与 NanoID，支持自定义长度。' },
    en: { title: 'UUID / NanoID', description: 'Batch generate UUID v4 and NanoID with custom length.' },
  },
  keywords: ['uuid', 'guid', 'nanoid', 'id'],
  privacy: 'local',
};
