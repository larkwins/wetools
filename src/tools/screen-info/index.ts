import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'screen-info',
  category: 'detect',
  icon: 'Monitor',
  i18n: {
    zh: { title: '屏幕信息', description: '分辨率、DPR、色域、刷新率、窗口尺寸、浏览器与系统信息一览。' },
    en: { title: 'Screen Info', description: 'Resolution, DPR, color gamut, refresh rate, viewport, browser & OS info.' },
  },
  keywords: ['屏幕', '分辨率', '浏览器', '设备'],
  privacy: 'local',
};
