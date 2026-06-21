import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'wifi-qr',
  category: 'generator',
  icon: 'Wifi',
  i18n: {
    zh: { title: 'WiFi 二维码', description: '为 WiFi 网络生成二维码，手机扫码一键连接。' },
    en: { title: 'WiFi QR Code', description: 'Generate a QR code for a WiFi network — scan to connect.' },
  },
  keywords: ['wifi', 'qr', 'qrcode', '二维码', '图片', '网络', 'wpa'],
  privacy: 'local',
};
