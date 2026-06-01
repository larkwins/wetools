import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'qr-code',
  category: 'generator',
  icon: 'QrCode',
  i18n: {
    zh: { title: '二维码生成/识别', description: '生成二维码图片，或上传图片识别其中的二维码内容。' },
    en: { title: 'QR Code Generator / Decoder', description: 'Generate a QR code image, or upload an image to decode it.' },
  },
  keywords: ['qr', 'qrcode', 'decode', 'scan', '二维码'],
  tags: ['hot'],
  privacy: 'local',
};
