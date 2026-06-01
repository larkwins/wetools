import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'temperature',
  category: 'cheatsheet',
  icon: 'Thermometer',
  i18n: {
    zh: { title: '温度换算', description: '摄氏度 / 华氏度 / 开尔文 / 兰金度 / 列氏度 / 牛顿度 实时互转。' },
    en: { title: 'Temperature Converter', description: 'Convert Celsius / Fahrenheit / Kelvin / Rankine / Réaumur / Newton in real time.' },
  },
  keywords: ['temperature', '温度', 'celsius', 'fahrenheit', 'kelvin'],
  privacy: 'local',
};
