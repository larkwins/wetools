import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'jwt',
  category: 'crypto',
  icon: 'FileKey2',
  i18n: {
    zh: { title: 'JWT 解析', description: '解析 JWT 三段：Header / Payload / Signature，本地完成。' },
    en: { title: 'JWT Decoder', description: 'Decode JWT header / payload / signature, locally.' },
  },
  keywords: ['jwt', 'token', 'decode', 'jose'],
  privacy: 'local',
};
