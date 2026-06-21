import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ip-lookup',
  category: 'web',
  icon: 'Network',
  i18n: {
    zh: { title: 'IP 查询', description: '查询当前公网 IP 与归属地（调用 ipapi.co 公开接口）。' },
    en: { title: 'IP Lookup', description: 'Look up your public IP via ipapi.co.' },
  },
  keywords: ['ip', 'geoip', '网络', 'ip地址'],
  privacy: 'external',
};
