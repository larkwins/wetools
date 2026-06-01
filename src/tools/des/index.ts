import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'des',
  category: 'encoding',
  icon: 'Lock',
  i18n: {
    zh: { title: 'DES / 3DES 加解密', description: 'DES / Triple DES 加解密，支持 CBC / ECB 模式与 PKCS7 填充。' },
    en: { title: 'DES / 3DES Encrypt/Decrypt', description: 'DES / Triple DES with CBC / ECB modes & PKCS7 padding.' },
  },
  keywords: ['des', '3des', 'tripledes', '加密', 'encrypt', 'legacy'],
  privacy: 'local',
};
