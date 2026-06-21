import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'chmod-calc',
  category: 'cheatsheet',
  icon: 'Shield',
  i18n: {
    zh: { title: 'Chmod 权限计算', description: 'Linux 文件权限 rwx ↔ 数字（755 / 644 等）双向互转。' },
    en: { title: 'Chmod Calculator', description: 'Convert between Linux rwx permissions and numeric mode (755 / 644 etc.).' },
  },
  keywords: ['chmod', 'linux', '权限', '开发'],
  privacy: 'local',
};
