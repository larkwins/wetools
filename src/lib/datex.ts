/**
 * 世界时间工具库
 * 封装时区转换、时间格式化等可复用能力
 */

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

export interface CityTime {
  /** 城市中文名 */
  name: string;
  /** 国家中文名 */
  country: string;
  /** 国旗 Emoji */
  flag: string;
  /** IANA 时区标识 */
  timezone: string;
  /** 当前时间（Date 对象） */
  date: Date;
  /** 格式化时间字符串 HH:mm:ss */
  timeStr: string;
  /** 格式化日期字符串 YYYY/MM/DD,星期X */
  dateStr: string;
  /** 时、分、秒（独立字段，用于翻牌动画） */
  hour: string;
  minute: string;
  second: string;
}

export interface WorldCityDef {
  name: string;
  country: string;
  flag: string;
  timezone: string;
}

// ─── 常用城市定义 ─────────────────────────────────────────────────────────────

/** 顶部卡片展示城市（5 个） */
export const FEATURED_CITIES: WorldCityDef[] = [
  { name: '纽约',   country: '美国',   flag: '🇺🇸', timezone: 'America/New_York' },
  { name: '伦敦',   country: '英国',   flag: '🇬🇧', timezone: 'Europe/London' },
  { name: '巴黎',   country: '法国',   flag: '🇫🇷', timezone: 'Europe/Paris' },
  { name: '莫斯科', country: '俄罗斯', flag: '🇷🇺', timezone: 'Europe/Moscow' },
  { name: '柏林',   country: '德国',   flag: '🇩🇪', timezone: 'Europe/Berlin' },
];

/** 世界著名城市列表（表格区） */
export const WORLD_CITIES: WorldCityDef[] = [
  // 亚洲
  { name: '东京',     country: '日本',     flag: '🇯🇵', timezone: 'Asia/Tokyo' },
  { name: '首尔',     country: '韩国',     flag: '🇰🇷', timezone: 'Asia/Seoul' },
  { name: '平壤',     country: '朝鲜',     flag: '🇰🇵', timezone: 'Asia/Pyongyang' },
  { name: '新加坡',   country: '新加坡',   flag: '🇸🇬', timezone: 'Asia/Singapore' },
  { name: '吉隆坡',   country: '马来西亚', flag: '🇲🇾', timezone: 'Asia/Kuala_Lumpur' },
  { name: '曼谷',     country: '泰国',     flag: '🇹🇭', timezone: 'Asia/Bangkok' },
  { name: '胡志明市', country: '越南',     flag: '🇻🇳', timezone: 'Asia/Ho_Chi_Minh' },
  { name: '雅加达',   country: '印尼',     flag: '🇮🇩', timezone: 'Asia/Jakarta' },
  { name: '新德里',   country: '印度',     flag: '🇮🇳', timezone: 'Asia/Kolkata' },
  { name: '迪拜',     country: '阿联酋',   flag: '🇦🇪', timezone: 'Asia/Dubai' },
  { name: '耶路撒冷', country: '以色列',   flag: '🇮🇱', timezone: 'Asia/Jerusalem' },
  { name: '特拉维夫', country: '以色列',   flag: '🇮🇱', timezone: 'Asia/Jerusalem' },
  // 大洋洲
  { name: '悉尼',     country: '澳大利亚', flag: '🇦🇺', timezone: 'Australia/Sydney' },
  // 欧洲
  { name: '雅典',     country: '希腊',     flag: '🇬🇷', timezone: 'Europe/Athens' },
  { name: '哥本哈根', country: '丹麦',     flag: '🇩🇰', timezone: 'Europe/Copenhagen' },
  { name: '布鲁塞尔', country: '比利时',   flag: '🇧🇪', timezone: 'Europe/Brussels' },
  { name: '日内瓦',   country: '瑞士',     flag: '🇨🇭', timezone: 'Europe/Zurich' },
  // 美洲
  { name: '多伦多',   country: '加拿大',   flag: '🇨🇦', timezone: 'America/Toronto' },
];

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

const WEEK_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * 将 Date 对象按指定时区格式化为 HH:mm:ss
 */
export function formatTimeInZone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return '--:--:--';
  }
}

/**
 * 将 Date 对象按指定时区格式化为 YYYY/MM/DD,星期X
 */
export function formatDateInZone(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    }).formatToParts(date);

    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}/${get('month')}/${get('day')},${get('weekday')}`;
  } catch {
    return '';
  }
}

/**
 * 获取指定时区的当前各时间字段（时/分/秒）
 */
export function getTimePartsInZone(date: Date, timezone: string): { hour: string; minute: string; second: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value?.padStart(2, '0') ?? '00';
    // hour12:false 时 '24' 表示午夜 0 点
    const h = get('hour');
    return {
      hour:   h === '24' ? '00' : h,
      minute: get('minute'),
      second: get('second'),
    };
  } catch {
    return { hour: '00', minute: '00', second: '00' };
  }
}

/**
 * 获取指定时区的完整日期字段（年/月/日/星期）
 */
export function getDatePartsInZone(date: Date, timezone: string): { year: number; month: number; day: number; weekday: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    const weekStr = get('weekday'); // 'Sun','Mon',...
    const weekMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      year:    Number(get('year')),
      month:   Number(get('month')),
      day:     Number(get('day')),
      weekday: weekMap[weekStr] ?? 0,
    };
  } catch {
    return { year: 0, month: 0, day: 0, weekday: 0 };
  }
}

/**
 * 将城市定义 + 当前时间 → 计算 CityTime 对象
 */
export function computeCityTime(city: WorldCityDef, now: Date): CityTime {
  const parts = getTimePartsInZone(now, city.timezone);
  const dateParts = getDatePartsInZone(now, city.timezone);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return {
    ...city,
    date:     now,
    timeStr:  `${parts.hour}:${parts.minute}:${parts.second}`,
    dateStr:  `${dateParts.year}/${pad2(dateParts.month)}/${pad2(dateParts.day)},${WEEK_ZH[dateParts.weekday]}`,
    hour:     parts.hour,
    minute:   parts.minute,
    second:   parts.second,
  };
}

/**
 * 获取本地时区标识（如 Asia/Shanghai）
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 获取指定时区的 UTC 偏移字符串，如 "UTC+8"
 */
export function getUTCOffsetStr(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}
