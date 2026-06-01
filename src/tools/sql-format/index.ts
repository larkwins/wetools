import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'sql-format',
  category: 'converter',
  icon: 'Database',
  i18n: {
    zh: { title: 'SQL 格式化 / 压缩', description: '美化与压缩 SQL，支持多种方言（MySQL / PostgreSQL / Oracle / SQL Server 等）。' },
    en: { title: 'SQL Format / Minify', description: 'Beautify or minify SQL with multiple dialects (MySQL / PostgreSQL / Oracle / SQL Server ...).' },
  },
  keywords: ['sql', 'format', 'beautify', 'minify', 'mysql', 'postgres'],
  privacy: 'local',
};
