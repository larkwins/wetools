import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'mac-generate',
  category: 'web',
  icon: 'Shuffle',
  i18n: {
    zh: { title: 'MAC 地址生成', description: '生成随机 MAC 地址，支持单播/多播、本地/全局、自定义分隔符。' },
    en: { title: 'MAC Address Generator', description: 'Generate random MAC addresses with unicast/multicast and local/global options.' },
  },
  keywords: ['mac', 'mac地址', '网络', '硬件'],
  privacy: 'local',
};
