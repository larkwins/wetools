import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'hmac',
  category: 'encoding',
  icon: 'Fingerprint',
  i18n: {
    zh: { title: 'HMAC 计算', description: 'HMAC-SHA1 / SHA-256 / SHA-384 / SHA-512，输出 hex 或 Base64。' },
    en: { title: 'HMAC', description: 'HMAC-SHA1 / SHA-256 / SHA-384 / SHA-512, output hex or Base64.' },
  },
  keywords: ['hmac', 'sha256', 'sha1', 'mac', 'signature', '签名'],
  privacy: 'local',
};
