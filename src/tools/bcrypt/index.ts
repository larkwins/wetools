import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'bcrypt',
  category: 'encoding',
  icon: 'Fingerprint',
  i18n: {
    zh: { title: 'Bcrypt 哈希', description: '生成 Bcrypt 密码哈希，或校验明文密码是否匹配 hash。' },
    en: { title: 'Bcrypt', description: 'Generate Bcrypt password hashes or verify a plaintext password against a hash.' },
  },
  keywords: ['bcrypt', 'hash', '密码', '哈希', '摘要', '加密'],
  privacy: 'local',
};
