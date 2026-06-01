import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'aes',
  category: 'encoding',
  icon: 'Lock',
  i18n: {
    zh: { title: 'AES 加解密', description: 'Web Crypto AES-GCM / AES-CBC，自动派生密钥，输出 Base64。' },
    en: { title: 'AES Encrypt/Decrypt', description: 'AES-GCM / CBC via Web Crypto with PBKDF2-derived keys.' },
  },
  keywords: ['aes', 'encrypt', 'decrypt', '加密', 'crypto'],
  privacy: 'local',
};
