import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'mac-lookup',
  category: 'web',
  icon: 'SearchCheck',
  i18n: {
    zh: { title: 'MAC 厂商查询', description: '根据 MAC 地址前 24 位（OUI）查询设备厂商，内置 Top 2000 OUI。' },
    en: { title: 'MAC Vendor Lookup', description: 'Look up device vendor by MAC address OUI (first 24 bits), top 2000 OUIs bundled.' },
  },
  keywords: ['mac', 'oui', 'mac地址', '网络', '硬件', '厂商'],
  privacy: 'local',
};
