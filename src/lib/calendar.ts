/**
 * 万年历工具库
 * 基于 third-party/calendar 提取的核心算法（公历、农历、节气、节日、干支、生肖等）
 * 支持范围：1900 ~ 2100 年
 */

// ─── 常量 ────────────────────────────────────────────────────────────────────

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const START_TIME = Date.UTC(MIN_YEAR, 0, 30, 0, 0, 0); // 1900-01-30

// ─── 农历月份数据（32进制压缩） ────────────────────────────────────────────────
// 格式：1位闰月大小 + 12位平月大小 + 4位闰月月份，转二进制后再转32进制

const MONTH_DATA = [
  'iuo','in0','19bg','l6l','1kj0','1mag','2pak','ll0','16mg','lei',
  'in0','19dm','196g','1kig','3kil','1da0','1ll0','1bd2','15dg','2ibn',
  'ibg','195g','1d5l','qig','ra0','3aqk','ar0','15bg','kni','ibg',
  'pb6','1l50','1qig','rkl','mmg','ar0','31n3','14n0','3i6n','1iag',
  '1l50','3m56','1dag','ll0','39dk','9eg','14mg','1kli','1aag','1dan',
  'r50','1dag','2kql','jd0','19dg','2hbj','klg','1ad8','1qag','ql0',
  '1bl6','1aqg','ir0','1an4','19bg','kj0','1sj3','1mag','mqn','ll0',
  '15mg','jel','img','196g','1l6k','1kig','1lao','1da0','1dl0','35d6',
  '15dg','idg','1abk','195g','1cjq','qig','ra0','1bq6','1ar0','15bg',
  'inl','ibg','p5g','t53','1qig','qqo','le0','1ar0','15ml','14n0',
  '1ib0','1mak','1l50','1mig','tai','ll0','1atn','9eg','14mg','1ill',
  '1aag','1d50','1el4','1bag','lep','it0','19dg','2kbm','klg','1a9g',
  'uak','ql0','1bag','mqi','ir0','19n6','1970','1kj0','1qj5','1l9g',
  'ml0','tl3','15mg','inr','img','196g','3k5m','1kig','1l90','1na5',
  '1dd0','lmg','ldi','idg','19bn','195g','1aig','3cil','r90','1bd0',
  '2ir3','14rg','ifo','ibg','p5g','2q56','1qig','qp0','39m4','1an0',
  '18n0','1kn3','1ib0','1lan','1l50','1mig','nal','ll0','19mg','lek',
  'kmg','1ado','1aag','1d50','1dl6','1bag','ld0','1at4','19dg','klg',
  '1cjj','q9g','spn','ql0','1bag','2iql','ir0','19bg','l74','1kb0',
  '1qb8','1l90','1ml0','2ql6','lmg','in0','1aek','18mg','1kag','1sii',
  '1l90',
];

// ─── 节气数据（4进制+32进制双层压缩） ─────────────────────────────────────────

const TERM_MIN_DATE = [4,19,3,18,4,19,4,19,4,20,4,20,6,22,6,22,6,22,7,22,6,21,6,21];
const TERM_DATA = [
  '4lkmd5j6l5','55kql9lal9','59lanalala','5avbnatqla','7akmd5j6l5','55kql9lal9','59lalalala','5avbnatqla','7akmd5j6l5','55kql9lal9',
  '59lalalala','5avbnatqla','7akmd5j6l5','4lkql9lal9','55kqlalala','5ananalqla','5akmd5j5kl','4lkqd9l6l5','55kqlalal9','5ananalqla',
  '5akmd5j5kl','4lkmd9l6l5','55kqlalal9','59lanalqla','5akmd5j5kl','4lkmd9l6l5','55kql9lal9','59lanalala','5akmclj5al','4lkmd5j6l5',
  '55kql9lal9','59lanalala','5akmclj5al','4lkmd5j6l5','55kql9lal9','59lalalala','5akmclj5al','4lkmd5j6l5','55kql9lal9','59lalalala',
  '5akmclj5al','4lkmd5j6l5','55kql9lal9','59lalalala','5aklclj5al','4lkmd5j5kl','4lkql9l6l9','55kqlalala','5aclclb5al','2lkmd5j5kl',
  '4lkmd9l6l9','55kqlalala','5aclclb5al','2lkmd5j5kl','4lkmd9l6l5','55kql9lal9','5aalclb5al','2lkmd5j5kl','4lkmd5j6l5','55kql9lal9',
  '59alclalal','2lkmclj5al','4lkmd5j6l5','55kql9lal9','59alclalal','2lkmclj5al','4lkmd5j6l5','55kql9lal9','59alalalal','2lkmclj5al',
  '4lkmd5j6l5','55kql9lal9','59alalalal','2lklclj5al','4lkmd5j6l5','55kql9l6l9','59a5alalal','2lklclb5al','4lkmd5j5l5','55kqd9l6l9',
  '59a5alalal','2lklclb5al','4lkmd5j5kl','4lkmd9l6l9','55a5akalal','2lclclb5al','2lkmd5j5kl','4lkmd5l6l5','55a5akalak','2lalclalal',
  '2lkmclj5kl','4lkmd5j6l5','55a5akalak','2kalclalal','2lkmclj5al','4lkmd5j6l5','55a5akalak','2kalalalal','2lkmclj5al','4lkmd5j6l5',
  '55a5akalak','2kalalalal','2lkmclj5al','4lkmd5j6l5','55a5akalak','2kalalalal','2lklclb5al','4lkmd5j6l5','55a5akahak','2ka5alalal',
  '2lklclb5al','4lkmd5j5l5','55a52kahak','2ka5akalal','2lklclb5al','4lkmd5j5kl','4la12kahak','2ga5akalal','2lclclb5al','2lkmclj5kl',
  '4la12g8hak','2ga5akalak','2lalclalal','2lkmclj5kl','4la12g8hag','2ga5akalak','2kalalalal','2lkmclj5al','4la12g8hag','2ga5akalak',
  '2kalalalal','2lkmclj5al','4la12g8hag','2ga5akalak','2kalalalal','2lklclb5al','4la12g8hag','2ga5akalak','2kalalalal','2lklclb5al',
  '4la12g8hag','2ga52kahak','2ka5alalal','2lklclb5al','4la12g8gag','2ga12kahak','2ka5akalal','2lklclb5al','4la1208ga0','20a12g8hak',
  '2ga5akalal','2lalclalal','2la1208ga0','20a12g8hak','2ga5akalal','2lalalalal','2la1208ga0','20a12g8hag','2ga5akalak','2lalalalal',
  '2la1208g00','20a12g8hag','2ga5akalak','2kalalalal','2la1208g00','20a12g8hag','2ga5akalak','2kalalalal','2la0200g00','20a12g8hag',
  '2ga52kahak','2kalalalal','2la0200g00','20a12g8gag','2ga52kahak','2ka5akalal','2la0200g00','20a12g8gag','2ga12gahak','2ka5akalal',
  '2la0200g00','20a1208ga0','2ga12g8hak','2ga5akalal','2l00200000','a1208ga0','20a12g8hak','2ga5akalal','2l00000000','a1208ga0',
  '20a12g8hag','2ga5akalak','2l00000000','a1208g00','20a12g8hag','2ga5akalak','2k00000000','a1200g00','20a12g8hag','2ga5akalak',
  '2kalalalal',
];

// ─── 静态映射表 ────────────────────────────────────────────────────────────────

const WEEK_MAP   = ['日','一','二','三','四','五','六'];
const MONTH_MAP  = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const DAY_MAP    = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const TERM_MAP   = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const GAN_LIST   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI_LIST   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ANIMAL_MAP = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const ZODIAC_MAP = ['水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯'];
const ZODIAC_DATE = [20,19,21,20,21,22,23,23,23,24,23,22];

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

export interface SolarDate {
  sYear: number;
  sMonth: number;
  sDay: number;
  week: number;      // 0=日 6=六
  weekZH: string;    // 星期X
  date: string;      // YYYY-MM-DD
}

export interface LunarDate {
  lYear: number;
  lMonth: number;
  lDay: number;
  isLeap: boolean;
  lMonthZH: string;  // 如"五月"、"闰五月"
  lDayZH: string;    // 如"初七"
}

export interface DateInfo extends SolarDate, LunarDate {
  zodiac: string;    // 星座
  term: string;      // 节气
  animal: string;    // 生肖
  gzYearZH: string;  // 干支年
  gzMonthZH: string; // 干支月
  gzDayZH: string;   // 干支日
  festival: string;  // 节日（空格分隔）
}

export interface CalendarDay {
  date: string;       // YYYY-MM-DD
  sYear: number;
  sMonth: number;
  sDay: number;
  week: number;
  inMonth: boolean;   // 是否属于当前月
  isToday: boolean;
  isSelected: boolean;
  lunarText: string;  // 农历/节气/节日 优先级显示文字
  festivalName: string; // 节日全名（用于显示）
  termName: string;   // 节气名
  holidayType: 0 | 1 | 2; // 0=普通 1=休 2=班（调休上班）
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function dateStr(a: number, b: number, c?: number): string {
  return c !== undefined
    ? `${pad2(a)}-${pad2(b)}-${pad2(c)}`
    : `${pad2(a)}-${pad2(b)}`;
}

// ─── 公历 ──────────────────────────────────────────────────────────────────────

export function getTimestampBySolar(sYear: number, sMonth: number, sDay: number): number {
  return Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0);
}

export function getSolarByTimestamp(timestamp: number): SolarDate {
  const now = new Date(timestamp);
  const week = now.getDay();
  const sYear = now.getFullYear();
  const sMonth = now.getMonth() + 1;
  const sDay = now.getDate();
  return {
    sYear, sMonth, sDay, week,
    weekZH: '星期' + WEEK_MAP[week],
    date: `${sYear}-${pad2(sMonth)}-${pad2(sDay)}`,
  };
}

export function getSolarMonthDays(sYear: number, sMonth: number): number {
  return new Date(sYear, sMonth, 0).getDate();
}

// ─── 农历 ──────────────────────────────────────────────────────────────────────

export function getLeapMonth(lYear: number): number {
  return parseInt(MONTH_DATA[lYear - MIN_YEAR], 32) & 0xf;
}

export function getLunarYearDays(lYear: number): number {
  let offset = 0;
  const data = parseInt(MONTH_DATA[lYear - MIN_YEAR], 32);
  for (let i = 1 << 15; i >= 1 << 4; i >>= 1) {
    offset += (data & i) ? 30 : 29;
  }
  if (getLeapMonth(lYear)) {
    offset += (data & (1 << 16)) ? 30 : 29;
  }
  return offset;
}

export function getLunarMonthDays(lYear: number, lMonth: number, isLeap = false): number {
  const leapMonth = getLeapMonth(lYear);
  const data = parseInt(MONTH_DATA[lYear - MIN_YEAR], 32);
  let days = (data & (1 << (16 - lMonth))) ? 30 : 29;
  if (isLeap && lMonth === leapMonth) {
    days = (data & (1 << 16)) ? 30 : 29;
  }
  return days;
}

export function getLunarByTimestamp(timestamp: number): LunarDate | null {
  let offset = Math.floor((timestamp - START_TIME) / 86400000);
  if (offset <= 0) return null;
  let lYear = MIN_YEAR, lMonth = 0, lDay = 0;
  let isLeap = false, days = 0;
  let count = 0;
  for (lYear = MIN_YEAR; lYear <= MAX_YEAR; lYear++) {
    days = getLunarYearDays(lYear);
    if (count + days >= offset) break;
    count += days;
  }
  const data = parseInt(MONTH_DATA[lYear - MIN_YEAR], 32);
  const leapMonth = getLeapMonth(lYear);
  offset -= count;
  count = 0;
  for (lMonth = 1; lMonth <= 12; lMonth++) {
    days = (data & (1 << (16 - lMonth))) ? 30 : 29;
    if (count + days >= offset) break;
    count += days;
    if (leapMonth && lMonth === leapMonth) {
      days = (data & (1 << 16)) ? 30 : 29;
      if (count + days >= offset) { isLeap = true; break; }
      count += days;
    }
  }
  lDay = offset - count;
  return {
    lYear, lMonth, lDay, isLeap,
    lMonthZH: (isLeap ? '闰' : '') + MONTH_MAP[lMonth - 1] + '月',
    lDayZH: DAY_MAP[lDay - 1],
  };
}

// ─── 节气 ──────────────────────────────────────────────────────────────────────

export function getTermDate(sYear: number): number[] | false {
  if (sYear < MIN_YEAR || sYear > MAX_YEAR) return false;
  const data = TERM_DATA[sYear - MIN_YEAR];
  let num4 = parseInt(data, 32).toString(4);
  if (num4.length !== 24) num4 = '0' + num4;
  return num4.split('').map((v, i) => +v + TERM_MIN_DATE[i]);
}

export function getTerm(sYear: number, sMonth: number, sDay: number): string {
  const termDate = getTermDate(sYear);
  if (!termDate) return '';
  const dates = [...termDate, 31];
  let term = '';
  dates.forEach((day, index) => {
    const month = Math.floor(index / 2) + 1;
    if (sMonth === month && sDay === day) term = TERM_MAP[index];
  });
  return term;
}

// ─── 干支 ──────────────────────────────────────────────────────────────────────

function getGanZhiByIndex(idx: number): string {
  let i = idx % 60;
  if (i < 0) i += 60;
  return GAN_LIST[i % 10] + ZHI_LIST[i % 12];
}

export function getGanZhiYear(sYear: number, sMonth: number, sDay: number): string {
  const ts = getTimestampBySolar(sYear, sMonth, sDay);
  const lunar = getLunarByTimestamp(ts);
  return lunar ? getGanZhiByIndex(lunar.lYear - 1984) : '';
}

export function getGanZhiMonth(sYear: number, sMonth: number, sDay: number): string {
  const termDate = getTermDate(sYear);
  if (!termDate) return '';
  let gzIndex = 0;
  const dates = [...termDate, 31];
  dates.forEach((day, index) => {
    const month = Math.floor(index / 2) + 1;
    if (dateStr(sMonth, sDay) >= dateStr(month, day)) gzIndex = month;
  });
  gzIndex += (sYear - 1984) * 12;
  return getGanZhiByIndex(gzIndex);
}

export function getGanZhiDay(sYear: number, sMonth: number, sDay: number): string {
  const offset = Math.round(
    (getTimestampBySolar(sYear, sMonth, sDay) - getTimestampBySolar(1900, 1, 30)) / 86400000
  );
  return getGanZhiByIndex(offset + 39);
}

// ─── 生肖 / 星座 ───────────────────────────────────────────────────────────────

export function getAnimalYear(sYear: number, sMonth: number, sDay: number): string {
  const ts = getTimestampBySolar(sYear, sMonth, sDay);
  const lunar = getLunarByTimestamp(ts);
  if (!lunar) return '';
  const idx = ((lunar.lYear - 1984) % 12 + 12) % 12;
  return ANIMAL_MAP[idx];
}

export function getZodiac(sMonth: number, sDay: number): string {
  let zoIndex = 11;
  ZODIAC_DATE.forEach((day, index) => {
    const month = index + 1;
    if (dateStr(sMonth, sDay) >= dateStr(month, day)) zoIndex = index % 12;
  });
  return ZODIAC_MAP[zoIndex] + '座';
}

// ─── 节日 ──────────────────────────────────────────────────────────────────────

// 公历主要节日
const S_FESTIVAL: Record<string, string[]> = {
  '01-01': ['元旦'], '02-14': ['情人节'], '03-08': ['妇女节'], '03-12': ['植树节'],
  '04-01': ['愚人节'], '05-01': ['劳动节'], '05-04': ['青年节'], '06-01': ['儿童节'],
  '07-01': ['建党节'], '08-01': ['建军节'], '09-10': ['教师节'], '10-01': ['国庆节'],
  '11-01': ['万圣节'], '12-25': ['圣诞节'], '12-13': ['国家公祭日'],
};

// 农历主要节日
const L_FESTIVAL: Record<string, string[]> = {
  '01-01': ['春节'], '01-15': ['元宵节'], '02-02': ['龙头节'], '03-03': ['上巳节'],
  '05-05': ['端午节'], '07-07': ['七夕节'], '07-15': ['中元节'], '08-15': ['中秋节'],
  '09-09': ['重阳节'], '10-15': ['下元节'], '12-08': ['腊八节'],
  '12-23': ['北小年'], '12-24': ['南小年'],
};

// 按星期推算节日（格式："月-第几周-星期几"  周：1-5  星期：0=日）
const O_FESTIVAL: Record<string, string[]> = {
  '05-02-00': ['母亲节'], '06-03-00': ['父亲节'], '11-04-04': ['感恩节'],
};

export function getFestivalsBySolar(sYear: number, sMonth: number, sDay: number): string[] {
  const now = new Date(sYear, sMonth - 1, sDay);
  const week = now.getDay();
  const index = Math.ceil(sDay / 7);
  const result: string[] = [];
  const sf = S_FESTIVAL[dateStr(sMonth, sDay)];
  if (sf) result.push(...sf);
  const of = O_FESTIVAL[dateStr(sMonth, index, week)];
  if (of) result.push(...of);
  return result;
}

export function getFestivalsByLunar(lYear: number, lMonth: number, lDay: number): string[] {
  // 除夕特殊处理（腊月最后一天）
  if (lMonth === 12 && lDay === getLunarMonthDays(lYear, 12)) return ['除夕'];
  const key = dateStr(lMonth, lDay);
  return L_FESTIVAL[key] ?? [];
}

export function getTermFestivalsBySolar(sYear: number, sMonth: number, sDay: number): string[] {
  const festivals: string[] = [];
  const termDate = getTermDate(sYear);
  if (!termDate) return festivals;
  const DAY_MS = 86400000;

  // 寒食节（清明前一天）
  const hanshiTime = new Date(sYear, 3, termDate[6] - 1).getTime();
  const hanshiSolar = getSolarByTimestamp(hanshiTime);
  if (hanshiSolar.sYear === sYear && hanshiSolar.sMonth === sMonth && hanshiSolar.sDay === sDay) {
    festivals.push('寒食节');
  }

  // 复活节
  const getEaster = (Y: number): [number, number] | null => {
    if (Y < 1900 || Y > 2100) return null;
    const N = Y - 1900;
    const A = N % 19;
    const Q = Math.floor(N / 4);
    const B = Math.floor((7 * A + 1) / 19);
    const M = (11 * A + 4 - B) % 29;
    const W = (N + Q + 31 - M) % 7;
    const D = 25 - M - W;
    return D > 0 ? [4, D] : [3, 31 + D];
  };
  const easter = getEaster(sYear);
  if (easter && easter[0] === sMonth && easter[1] === sDay) festivals.push('复活节');

  // 数九
  const shujiu = ['一九','二九','三九','四九','五九','六九','七九','八九','九九'];
  const lastTermDate = getTermDate(sYear - 1);
  if (lastTermDate) {
    let count = 0;
    for (let t = new Date(sYear - 1, 11, lastTermDate[23]).getTime(); t <= new Date(sYear - 1, 11, lastTermDate[23]).getTime() + 8 * 9 * DAY_MS; t += 9 * DAY_MS) {
      const s = getSolarByTimestamp(t);
      if (s.sYear === sYear && s.sMonth === sMonth && s.sDay === sDay) festivals.push(shujiu[count]);
      count++;
    }
  }
  let count2 = 0;
  for (let t = new Date(sYear, 11, termDate[23]).getTime(); t <= new Date(sYear, 11, termDate[23]).getTime() + 8 * 9 * DAY_MS; t += 9 * DAY_MS) {
    const s = getSolarByTimestamp(t);
    if (s.sYear === sYear && s.sMonth === sMonth && s.sDay === sDay) festivals.push(shujiu[count2]);
    count2++;
  }

  return festivals;
}

// ─── 假期安排 ─────────────────────────────────────────────────────────────────
// 0 = 调休上班，1 = 法定休假

const SCHEDULE_MAP: Record<string, Record<string, 0 | 1>> = {
  '2011': {'04-02':0,'04-03':1,'04-04':1,'04-05':1,'04-30':1,'05-01':1,'05-02':1,'06-04':1,'06-05':1,'06-06':1,'09-10':1,'09-11':1,'09-12':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':0,'10-09':0,'12-31':0},
  '2012': {'01-01':1,'01-02':1,'01-03':1,'01-21':0,'01-22':1,'01-23':1,'01-24':1,'01-25':1,'01-26':1,'01-27':1,'01-28':1,'01-29':0,'03-31':0,'04-01':0,'04-02':1,'04-03':1,'04-04':1,'04-28':0,'04-29':1,'04-30':1,'05-01':1,'06-22':1,'06-23':1,'06-24':1,'09-29':0,'09-30':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1},
  '2013': {'01-01':1,'01-02':1,'01-03':1,'01-05':0,'01-06':0,'02-09':1,'02-10':1,'02-11':1,'02-12':1,'02-13':1,'02-14':1,'02-15':1,'02-16':0,'02-17':0,'04-04':1,'04-05':1,'04-06':1,'04-07':0,'04-27':0,'04-28':0,'04-29':1,'04-30':1,'05-01':1,'06-08':0,'06-09':0,'06-10':1,'06-11':1,'06-12':1,'09-19':1,'09-20':1,'09-21':1,'09-22':0,'09-29':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-12':0},
  '2014': {'01-01':1,'01-26':0,'01-31':1,'02-01':1,'02-02':1,'02-03':1,'02-04':1,'02-05':1,'02-06':1,'02-08':0,'04-05':1,'04-06':1,'04-07':1,'05-01':1,'05-02':1,'05-03':1,'05-04':0,'05-31':1,'06-01':1,'06-02':1,'09-08':1,'09-28':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-11':0},
  '2015': {'01-01':1,'01-02':1,'01-03':1,'01-04':0,'02-15':0,'02-18':1,'02-19':1,'02-20':1,'02-21':1,'02-22':1,'02-23':1,'02-24':1,'02-28':0,'04-04':1,'04-05':1,'04-06':1,'05-01':1,'05-02':1,'05-03':1,'06-20':1,'06-21':1,'06-22':1,'09-03':1,'09-04':1,'09-05':1,'09-06':0,'09-27':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-10':0},
  '2016': {'01-01':1,'01-02':1,'01-03':1,'02-06':0,'02-07':1,'02-08':1,'02-09':1,'02-10':1,'02-11':1,'02-12':1,'02-13':1,'02-14':0,'04-02':1,'04-03':1,'04-04':1,'04-30':1,'05-01':1,'05-02':1,'06-09':1,'06-10':1,'06-11':1,'06-12':0,'09-15':1,'09-16':1,'09-17':1,'09-18':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':0,'10-09':0},
  '2017': {'01-01':1,'01-02':1,'01-22':0,'01-27':1,'01-28':1,'01-29':1,'01-30':1,'01-31':1,'02-01':1,'02-02':1,'02-04':0,'04-01':0,'04-02':1,'04-03':1,'04-04':1,'04-29':1,'04-30':1,'05-01':1,'05-27':0,'05-28':1,'05-29':1,'05-30':1,'09-30':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':1,'12-30':1,'12-31':1},
  '2018': {'01-01':1,'02-11':0,'02-15':1,'02-16':1,'02-17':1,'02-18':1,'02-19':1,'02-20':1,'02-21':1,'02-24':0,'04-05':1,'04-06':1,'04-07':1,'04-08':0,'04-28':0,'04-29':1,'04-30':1,'05-01':1,'06-16':1,'06-17':1,'06-18':1,'09-22':1,'09-23':1,'09-24':1,'09-29':0,'09-30':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'12-29':0,'12-30':1,'12-31':1},
  '2019': {'01-01':1,'02-02':0,'02-03':0,'02-04':1,'02-05':1,'02-06':1,'02-07':1,'02-08':1,'02-09':1,'02-10':1,'04-05':1,'04-06':1,'04-07':1,'04-28':0,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':0,'06-07':1,'06-08':1,'06-09':1,'09-13':1,'09-14':1,'09-15':1,'09-29':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-12':0},
  '2020': {'01-01':1,'01-19':0,'01-24':1,'01-25':1,'01-26':1,'01-27':1,'01-28':1,'01-29':1,'01-30':1,'02-01':0,'04-04':1,'04-05':1,'04-06':1,'04-26':0,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':1,'05-09':0,'06-25':1,'06-26':1,'06-27':1,'06-28':0,'09-27':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':1,'10-10':0},
  '2021': {'01-01':1,'01-02':1,'01-03':1,'02-07':0,'02-11':1,'02-12':1,'02-13':1,'02-14':1,'02-15':1,'02-16':1,'02-17':1,'02-20':0,'04-03':1,'04-04':1,'04-05':1,'04-25':0,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':1,'05-08':0,'06-12':1,'06-13':1,'06-14':1,'09-18':0,'09-19':1,'09-20':1,'09-21':1,'09-26':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-09':0},
  '2022': {'01-01':1,'01-02':1,'01-03':1,'01-29':0,'01-30':0,'01-31':1,'02-01':1,'02-02':1,'02-03':1,'02-04':1,'02-05':1,'02-06':1,'04-02':0,'04-03':1,'04-04':1,'04-05':1,'04-24':0,'04-30':1,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-07':0,'06-03':1,'06-04':1,'06-05':1,'09-10':1,'09-11':1,'09-12':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':0,'10-09':0,'12-31':1},
  '2023': {'01-01':1,'01-02':1,'01-21':1,'01-22':1,'01-23':1,'01-24':1,'01-25':1,'01-26':1,'01-27':1,'01-28':0,'01-29':0,'04-05':1,'04-29':1,'04-30':1,'05-01':1,'05-02':1,'05-03':1,'04-23':0,'05-06':0,'06-22':1,'06-23':1,'06-24':1,'06-25':0,'09-29':1,'09-30':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':0,'10-08':0,'12-30':1,'12-31':1},
  '2024': {'01-01':1,'02-04':0,'02-10':1,'02-11':1,'02-12':1,'02-13':1,'02-14':1,'02-15':1,'02-16':1,'02-17':1,'02-18':0,'04-04':1,'04-05':1,'04-06':1,'04-07':0,'04-28':0,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':1,'05-11':0,'06-08':1,'06-09':1,'06-10':1,'09-14':0,'09-15':1,'09-16':1,'09-17':1,'09-29':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-12':0},
  '2025': {'01-01':1,'01-26':0,'01-28':1,'01-29':1,'01-30':1,'01-31':1,'02-01':1,'02-02':1,'02-03':1,'02-04':1,'02-08':0,'04-04':1,'04-05':1,'04-06':1,'04-27':0,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':1,'05-31':1,'06-01':1,'06-02':1,'09-28':0,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-08':1,'10-11':0},
  '2026': {'01-01':1,'01-02':1,'01-03':1,'01-04':0,'02-14':0,'02-15':1,'02-16':1,'02-17':1,'02-18':1,'02-19':1,'02-20':1,'02-21':1,'02-22':1,'02-23':1,'02-28':0,'04-04':1,'04-05':1,'04-06':1,'05-01':1,'05-02':1,'05-03':1,'05-04':1,'05-05':1,'05-09':0,'06-19':1,'06-20':1,'06-21':1,'09-20':0,'09-25':1,'09-26':1,'09-27':1,'10-01':1,'10-02':1,'10-03':1,'10-04':1,'10-05':1,'10-06':1,'10-07':1,'10-10':0},
};

/** 获取某天的假期类型：0=普通  1=法定休假  2=调休上班 */
export function getHolidayType(sYear: number, sMonth: number, sDay: number): 0 | 1 | 2 {
  const yearMap = SCHEDULE_MAP[String(sYear)];
  if (!yearMap) return 0;
  const key = dateStr(sMonth, sDay);
  if (key in yearMap) return yearMap[key] === 1 ? 1 : 2;
  return 0;
}

// ─── 聚合：完整日期信息 ────────────────────────────────────────────────────────

export function getDateInfo(timestamp: number): DateInfo {
  const solar = getSolarByTimestamp(timestamp);
  const lunar = getLunarByTimestamp(timestamp);
  const { sYear, sMonth, sDay } = solar;
  const festivals = [
    ...getFestivalsBySolar(sYear, sMonth, sDay),
    ...getTermFestivalsBySolar(sYear, sMonth, sDay),
    ...(lunar ? getFestivalsByLunar(lunar.lYear, lunar.lMonth, lunar.lDay) : []),
  ];
  return {
    ...solar,
    lYear: lunar?.lYear ?? 0,
    lMonth: lunar?.lMonth ?? 0,
    lDay: lunar?.lDay ?? 0,
    isLeap: lunar?.isLeap ?? false,
    lMonthZH: lunar?.lMonthZH ?? '',
    lDayZH: lunar?.lDayZH ?? '',
    zodiac: getZodiac(sMonth, sDay),
    term: getTerm(sYear, sMonth, sDay),
    animal: getAnimalYear(sYear, sMonth, sDay),
    gzYearZH: getGanZhiYear(sYear, sMonth, sDay),
    gzMonthZH: getGanZhiMonth(sYear, sMonth, sDay),
    gzDayZH: getGanZhiDay(sYear, sMonth, sDay),
    festival: festivals.join(' '),
  };
}

// ─── 日历月份数据生成 ──────────────────────────────────────────────────────────

export function buildCalendarMonth(sYear: number, sMonth: number, selectedDate: string, todayStr: string): CalendarDay[] {
  const firstDay = new Date(sYear, sMonth - 1, 1).getDay(); // 0=周日
  const daysInMonth = getSolarMonthDays(sYear, sMonth);

  const prevMonth = sMonth === 1 ? 12 : sMonth - 1;
  const prevYear  = sMonth === 1 ? sYear - 1 : sYear;
  const daysInPrev = getSolarMonthDays(prevYear, prevMonth);

  const days: CalendarDay[] = [];

  // 前补天数
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const ts = getTimestampBySolar(prevYear, prevMonth, d);
    const info = getDateInfo(ts);
    days.push(makeDay(info, false, selectedDate, todayStr));
  }

  // 当月天数
  for (let d = 1; d <= daysInMonth; d++) {
    const ts = getTimestampBySolar(sYear, sMonth, d);
    const info = getDateInfo(ts);
    days.push(makeDay(info, true, selectedDate, todayStr));
  }

  // 后补天数（填满6行 = 42格）
  const remain = 42 - days.length;
  const nextMonth = sMonth === 12 ? 1 : sMonth + 1;
  const nextYear  = sMonth === 12 ? sYear + 1 : sYear;
  for (let d = 1; d <= remain; d++) {
    const ts = getTimestampBySolar(nextYear, nextMonth, d);
    const info = getDateInfo(ts);
    days.push(makeDay(info, false, selectedDate, todayStr));
  }

  return days;
}

function makeDay(info: DateInfo, inMonth: boolean, selectedDate: string, todayStr: string): CalendarDay {
  const { sYear, sMonth, sDay, week, date, term, festival, lDayZH } = info;
  const holidayType = getHolidayType(sYear, sMonth, sDay);
  // 优先级：节日 > 节气 > 农历日
  const festivalName = festival ? festival.split(' ')[0] : '';
  const lunarText = festivalName || term || lDayZH;
  return {
    date, sYear, sMonth, sDay, week, inMonth,
    isToday: date === todayStr,
    isSelected: date === selectedDate,
    lunarText,
    festivalName,
    termName: term,
    holidayType,
  };
}

// ─── 便捷 API ─────────────────────────────────────────────────────────────────

export function getToday(): DateInfo {
  const now = new Date();
  return getDateInfo(getTimestampBySolar(now.getFullYear(), now.getMonth() + 1, now.getDate()));
}

export function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function parseDateStr(dateStr: string): { year: number; month: number; day: number } | null {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}
