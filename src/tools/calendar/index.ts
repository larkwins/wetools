import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'calendar',
  category: 'common',
  icon: 'CalendarDays',
  i18n: {
    zh: { title: '万年历', description: '支持公历农历互查、24节气、法定节假日、干支纪年、十二生肖，涵盖 1900–2100 年。' },
    en: { title: 'Perpetual Calendar', description: 'Chinese lunar/solar calendar with festivals, solar terms, and Heavenly Stems & Earthly Branches.' },
  },
  keywords: ['日历', '农历', '节气', '节日', '时间', '日期'],
  privacy: 'local',
};
