import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-format',
  category: 'converter',
  icon: 'Braces',
  i18n: {
    zh: { title: 'JSON 格式化 / 校验', description: '美化、压缩、转义 JSON，错误位置精确提示。' },
    en: { title: 'JSON Format / Validate', description: 'Beautify, minify, escape JSON with precise error position.' },
  },
  keywords: ['json', '格式化', '数据'],
  tags: ['hot'],
  privacy: 'local',
};
