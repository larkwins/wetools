import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'sql-to-go',
  category: 'converter',
  icon: 'Database',
  i18n: {
    zh: { title: 'SQL → Go Struct', description: '从 CREATE TABLE 语句生成 Go 结构体，支持 gorm / db tag。' },
    en: { title: 'SQL → Go Struct', description: 'Generate Go structs from CREATE TABLE statements with gorm / db tags.' },
  },
  keywords: ['sql', 'go', 'golang', 'struct', 'gorm', 'codegen', 'ddl'],
  privacy: 'local',
};
