import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'gamepad-test',
  category: 'detect',
  icon: 'Gamepad2',
  i18n: {
    zh: { title: '游戏手柄检测', description: '检测连接的游戏手柄，实时显示按键、扳机、摇杆状态。' },
    en: { title: 'Gamepad Test', description: 'Detect connected gamepads, show buttons / triggers / axes in real-time.' },
  },
  keywords: ['gamepad', 'controller', 'joystick', '手柄', 'xbox'],
  privacy: 'local',
};
