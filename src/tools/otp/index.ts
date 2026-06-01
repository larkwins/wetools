import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'otp',
  category: 'web',
  icon: 'ShieldCheck',
  i18n: {
    zh: { title: 'TOTP / OTP 生成器', description: '基于 RFC 6238 的 TOTP 实时码生成，用于 2FA 调试。' },
    en: { title: 'TOTP / OTP Generator', description: 'RFC 6238 TOTP real-time code generator for 2FA debugging.' },
  },
  keywords: ['otp', 'totp', '2fa', 'auth', 'mfa', '验证码'],
  privacy: 'local',
};
