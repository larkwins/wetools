import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'qr-decode',
  category: 'generator',
  icon: 'ScanLine',
  i18n: {
    zh: { title: '二维码识别', description: '上传或拖入图片，识别其中的二维码内容。' },
    en: { title: 'QR Decoder', description: 'Drop an image and decode its QR code locally.' },
  },
  keywords: ['qr', 'decode', '二维码', 'scan'],
  privacy: 'local',
};
