import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ipv4-subnet',
  category: 'web',
  icon: 'Network',
  i18n: {
    zh: { title: 'IPv4 子网计算', description: 'CIDR / 掩码 / 网段 / 广播 / 主机数等子网信息计算。' },
    en: { title: 'IPv4 Subnet Calculator', description: 'Calculate CIDR / mask / network / broadcast / host count and more.' },
  },
  keywords: ['ipv4', 'subnet', 'cidr', 'mask', 'netmask', '子网'],
  privacy: 'local',
};
