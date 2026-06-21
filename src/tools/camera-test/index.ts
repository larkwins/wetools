import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'camera-test',
  category: 'detect',
  icon: 'Camera',
  i18n: {
    zh: { title: '摄像头检测', description: '实时预览摄像头画面，支持多设备切换与拍照保存。' },
    en: { title: 'Camera Test', description: 'Live preview camera feed, switch between devices, take photos.' },
  },
  keywords: ['camera', 'webcam', 'video', '摄像头', '图片', '设备'],
  privacy: 'local',
};
