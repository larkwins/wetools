import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'json-to-proto',
  category: 'json',
  icon: 'FileCode2',
  i18n: {
    zh: { title: 'JSON → Protobuf', description: '从任意 JSON 推导出 Protobuf 3 message 定义。' },
    en: { title: 'JSON → Protobuf', description: 'Generate Protobuf 3 message definitions from any JSON.' },
  },
  keywords: ['json', 'proto', 'protobuf', 'message', 'codegen'],
  privacy: 'local',
};
