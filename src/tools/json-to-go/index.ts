import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-to-go',
  category: 'converter',
  icon: 'FileCode2',
  i18n: {
    zh: { title: 'JSON → Go Struct', description: '从任意 JSON 推导出 Go 结构体定义，支持 json tag。' },
    en: { title: 'JSON → Go Struct', description: 'Generate Go struct definitions from any JSON with json tags.' },
  },
  keywords: ['json', 'go', 'golang', 'struct', 'codegen'],
  privacy: 'local',
};
