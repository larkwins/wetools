import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ua-parse',
  category: 'web',
  icon: 'Smartphone',
  i18n: {
    zh: { title: 'UA 解析', description: '解析 User-Agent，识别浏览器、引擎、OS、设备类型。' },
    en: { title: 'UA Parser', description: 'Parse User-Agent into browser / engine / OS / device.' },
  },
  keywords: ['user-agent', 'ua', 'browser', 'os'],
  privacy: 'local',
};
