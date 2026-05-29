import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'case-convert',
  category: 'text',
  icon: 'CaseSensitive',
  i18n: {
    zh: { title: '大小写 / 命名转换', description: 'camelCase / snake_case / kebab-case / PascalCase / CONSTANT 一键互转。' },
    en: { title: 'Case Convert', description: 'Convert between camel / snake / kebab / Pascal / CONSTANT case.' },
  },
  keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', '大小写', '驼峰'],
  privacy: 'local',
};
