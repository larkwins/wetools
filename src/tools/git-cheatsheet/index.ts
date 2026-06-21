import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'git-cheatsheet',
  category: 'cheatsheet',
  icon: 'GitBranch',
  i18n: {
    zh: { title: 'Git 速查表', description: '常用 Git 命令分类速查（提交、分支、远程、撤销、变基等）。' },
    en: { title: 'Git Cheatsheet', description: 'Common Git commands grouped (commit / branch / remote / undo / rebase ...).' },
  },
  keywords: ['git', '版本控制', '代码', '速查', '开发'],
  privacy: 'local',
};
