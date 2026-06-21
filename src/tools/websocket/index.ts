import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'websocket',
  category: 'web',
  icon: 'Plug',
  i18n: {
    zh: { title: 'WebSocket 测试', description: '连接任意 ws:// / wss:// 服务，收发消息、查看心跳与日志。' },
    en: { title: 'WebSocket Tester', description: 'Connect to any ws:// / wss:// server, send / receive messages and inspect logs.' },
  },
  keywords: ['websocket', '网络', '实时通信', '调试'],
  privacy: 'local',
};
