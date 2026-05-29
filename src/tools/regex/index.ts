import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'regex',
  category: 'text',
  icon: 'Regex',
  i18n: {
    zh: { title: '正则测试器', description: '高亮匹配、分组提取、替换预览，附常见正则速查。' },
    en: { title: 'Regex Tester', description: 'Highlight matches, extract groups, preview replacements.' },
  },
  keywords: ['regex', 'regexp', '正则', '正则表达式', 'match'],
  privacy: 'local',
};
