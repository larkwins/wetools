import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'ssl-check',
  category: 'web',
  icon: 'ShieldCheck',
  i18n: {
    zh: {
      title: 'SSL 证书检测',
      description: '查询域名 CT 日志中的证书签发记录，并一键跳转 SSL Labs / Mozilla Observatory 等权威检测平台。',
    },
    en: {
      title: 'SSL Certificate Checker',
      description: 'Look up CT log records for a domain and jump to SSL Labs / Mozilla Observatory for full reports.',
    },
  },
  keywords: ['ssl', 'tls', 'https', 'certificate', '证书', '检测', 'ssllabs', 'crt.sh', 'ct'],
  privacy: 'external',
};
