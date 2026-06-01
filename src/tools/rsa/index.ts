import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'rsa',
  category: 'encoding',
  icon: 'KeyRound',
  i18n: {
    zh: { title: 'RSA 加解密 / 生成密钥', description: '浏览器生成 RSA 密钥对（2048/3072/4096），RSA-OAEP 加解密。' },
    en: { title: 'RSA Encrypt/Decrypt & Keygen', description: 'Generate RSA keypairs (2048/3072/4096) and RSA-OAEP encrypt/decrypt.' },
  },
  keywords: ['rsa', 'keypair', 'public key', 'private key', '密钥', 'oaep'],
  privacy: 'local',
};
