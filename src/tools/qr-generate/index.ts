import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'qr-generate',
  category: 'generator',
  icon: 'QrCode',
  i18n: {
    zh: { title: '二维码生成', description: '从文本/链接生成二维码，可定制容错率与下载 PNG。' },
    en: { title: 'QR Generator', description: 'Generate QR code from text/URL with adjustable EC level.' },
  },
  keywords: ['qr', 'qrcode', '二维码'],
  tags: ['hot'],
  privacy: 'local',
};
