import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'speed-test',
  category: 'web',
  icon: 'Gauge',
  i18n: {
    zh: {
      title: '网络测速',
      description: '基于 Cloudflare Speed Test 公开端点，测试当前网络的延迟 / 下载 / 上传速度。',
    },
    en: {
      title: 'Network Speed Test',
      description: 'Test your current network latency / download / upload speed via Cloudflare Speed Test endpoints.',
    },
  },
  keywords: ['speed', 'test', 'bandwidth', '测速', '网速', 'ping', 'latency', 'cloudflare'],
  privacy: 'external',
};
