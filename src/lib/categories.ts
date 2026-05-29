import type { CategoryMeta, ToolCategory } from './types';

/** 9 大分类元信息，用于 Sidebar / 首页分组 / ⌘K 分类筛选 */
export const categories: CategoryMeta[] = [
  {
    id: 'encoding',
    icon: 'Binary',
    order: 10,
    i18n: {
      zh: { title: '编码转换', description: 'Base64 / URL / HTML / Hex / Unicode 等编解码' },
      en: { title: 'Encoding', description: 'Base64 / URL / HTML / Hex / Unicode' },
    },
  },
  {
    id: 'json',
    icon: 'Braces',
    order: 20,
    i18n: {
      zh: { title: 'JSON 与数据', description: '格式化、对比、与 YAML / XML / CSV / TS 互转' },
      en: { title: 'JSON & Data', description: 'Format, diff, JSON ↔ YAML / XML / CSV / TS' },
    },
  },
  {
    id: 'crypto',
    icon: 'KeyRound',
    order: 30,
    i18n: {
      zh: { title: '加密哈希', description: 'MD5 / SHA / HMAC / AES / RSA / JWT' },
      en: { title: 'Crypto & Hash', description: 'MD5 / SHA / HMAC / AES / RSA / JWT' },
    },
  },
  {
    id: 'datetime',
    icon: 'Clock',
    order: 40,
    i18n: {
      zh: { title: '时间日期', description: '时间戳、Cron、时区换算' },
      en: { title: 'Date & Time', description: 'Timestamp, Cron, timezone' },
    },
  },
  {
    id: 'generator',
    icon: 'Sparkles',
    order: 50,
    i18n: {
      zh: { title: '生成器', description: 'UUID / 随机密码 / 假数据 / Lorem' },
      en: { title: 'Generators', description: 'UUID / password / mock data / Lorem' },
    },
  },
  {
    id: 'image',
    icon: 'ImageIcon',
    order: 60,
    i18n: {
      zh: { title: '图像', description: '二维码、压缩、格式互转、取色器、SVG 优化' },
      en: { title: 'Image', description: 'QR, compress, convert, color picker, SVGO' },
    },
  },
  {
    id: 'text',
    icon: 'Type',
    order: 70,
    i18n: {
      zh: { title: '文本', description: 'Diff、Markdown、大小写、正则、文本工具' },
      en: { title: 'Text', description: 'Diff, Markdown, case, regex, utilities' },
    },
  },
  {
    id: 'network',
    icon: 'Globe',
    order: 80,
    i18n: {
      zh: { title: '网络', description: 'IP、UA、cURL 转代码、URL 解析' },
      en: { title: 'Network', description: 'IP, UA, cURL, URL parser' },
    },
  },
  {
    id: 'dev',
    icon: 'Code2',
    order: 90,
    i18n: {
      zh: { title: '开发速查', description: '颜色、CSS 单位、进制、Tailwind 速查' },
      en: { title: 'Dev Cheatsheet', description: 'Color, CSS units, base, Tailwind' },
    },
  },
];

export const categoryById = (id: ToolCategory): CategoryMeta =>
  categories.find((c) => c.id === id) ?? categories[0];
