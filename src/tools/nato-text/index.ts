import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'nato-text',
  category: 'generator',
  icon: 'Megaphone',
  i18n: {
    zh: { title: 'NATO 字母解读', description: '将文本转为 NATO 北约音标字母（A → Alpha，B → Bravo…）。' },
    en: { title: 'NATO Phonetic Alphabet', description: 'Convert text to NATO phonetic alphabet (A → Alpha, B → Bravo…).' },
  },
  keywords: ['nato', '字母', '字符', '文本'],
  privacy: 'local',
};
