import type { CategoryMeta, ToolCategory } from './types';

/**
 * 8 大分类元信息，用于 Sidebar / 首页分组 / ⌘K 分类筛选
 *
 * 设计原则：
 *  - 「常用」是站点维度的高频工具（非用户收藏，收藏在 prefs store）
 *  - 「检测」目前空，先建分类壳，后续添加摄像头/麦克风/手柄等检测工具
 *  - 空分类首页会以"开发中"占位卡的形式展示（让用户知道未来会有什么）
 */
export const categories: CategoryMeta[] = [
  {
    id: 'common',
    icon: 'Star',
    order: 10,
    i18n: {
      zh: { title: '常用', description: '时间戳、正则、Cron、颜色、图片处理等高频工具' },
      en: { title: 'Popular', description: 'Timestamp, Regex, Cron, Color, image utilities — used most' },
    },
  },
  {
    id: 'encoding',
    icon: 'KeyRound',
    order: 20,
    i18n: {
      zh: { title: '编码/加密', description: 'Base64 / URL / HTML / Hex / Unicode / Hash / HMAC / AES / DES / RSA / JWT' },
      en: { title: 'Encoding & Crypto', description: 'Base64 / URL / HTML / Hex / Unicode / Hash / HMAC / AES / DES / RSA / JWT' },
    },
  },
  {
    id: 'generator',
    icon: 'Sparkles',
    order: 30,
    i18n: {
      zh: { title: '生成', description: 'UUID、随机数/密码、二维码、Lorem、Mock、占位图片' },
      en: { title: 'Generators', description: 'UUID, random / password, QR code, Lorem, Mock, placeholder image' },
    },
  },
  {
    id: 'converter',
    icon: 'Braces',
    order: 40,
    i18n: {
      zh: { title: '转换/格式化', description: 'JSON / YAML / XML / CSV / SQL 互转与格式化，Go / TS / Proto 代码生成' },
      en: { title: 'Converter & Formatter', description: 'JSON / YAML / XML / CSV / SQL conversion & formatting, Go / TS / Proto codegen' },
    },
  },
  {
    id: 'text',
    icon: 'Type',
    order: 50,
    i18n: {
      zh: { title: '文本处理', description: 'Diff、Markdown、大小写、文本统计与变换' },
      en: { title: 'Text', description: 'Diff, Markdown, case, statistics & transforms' },
    },
  },
  {
    id: 'web',
    icon: 'Globe',
    order: 60,
    i18n: {
      zh: { title: 'Web/网络', description: 'IP、UA、URL、cURL、WebSocket' },
      en: { title: 'Web & Network', description: 'IP, UA, URL, cURL, WebSocket' },
    },
  },
  {
    id: 'cheatsheet',
    icon: 'BookOpen',
    order: 70,
    i18n: {
      zh: { title: '速查', description: 'HTTP 状态码、时区、ASCII、CSS 单位、进制、Tailwind 等速查' },
      en: { title: 'Cheatsheets', description: 'HTTP codes, timezones, ASCII, CSS units, number base, Tailwind' },
    },
  },
  {
    id: 'detect',
    icon: 'ScanLine',
    order: 80,
    i18n: {
      zh: { title: '检测', description: '摄像头、麦克风、游戏手柄等设备检测（开发中）' },
      en: { title: 'Detect', description: 'Camera, microphone, gamepad device tests (in development)' },
    },
  },
];

export const categoryById = (id: ToolCategory): CategoryMeta =>
  categories.find((c) => c.id === id) ?? categories[0];
