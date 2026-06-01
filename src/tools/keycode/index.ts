import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'keycode',
  category: 'cheatsheet',
  icon: 'Keyboard',
  i18n: {
    zh: { title: 'Keycode 速查', description: '按下任意键，显示 event.key / code / keyCode / which。' },
    en: { title: 'Keycode Info', description: 'Press any key to see its event.key / code / keyCode / which value.' },
  },
  keywords: ['keycode', 'keyboard', 'event', '键码'],
  privacy: 'local',
};
