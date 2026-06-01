import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'basic-auth',
  category: 'generator',
  icon: 'UserCog',
  i18n: {
    zh: { title: 'Basic Auth 生成', description: '用户名 + 密码 → Authorization: Basic <base64> 请求头。' },
    en: { title: 'Basic Auth Generator', description: 'Username + password → Authorization: Basic <base64> header.' },
  },
  keywords: ['basic auth', 'authorization', 'header', 'http'],
  privacy: 'local',
};
