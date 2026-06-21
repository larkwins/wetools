<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CalendarDays } from 'lucide-vue-next';
import type { ToolMeta } from '@/lib/types';
import {
  FEATURED_CITIES,
  WORLD_CITIES,
  computeCityTime,
  getTimePartsInZone,
  getDatePartsInZone,
} from '@/lib/datex';
import { getDateInfo } from '@/lib/calendar';

defineProps<{ meta: ToolMeta }>();

// ─── 本地时间 ─────────────────────────────────────────────────────────────────

const LOCAL_TZ = 'Asia/Shanghai';
const LOCAL_FLAG = '🇨🇳';
const LOCAL_LABEL = '中国 北京 当地时间';
const WEEK_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// ─── 本地（北京）时间字段 ──────────────────────────────────────────────────────

const localParts = computed(() => getTimePartsInZone(now.value, LOCAL_TZ));
const localDateParts = computed(() => getDatePartsInZone(now.value, LOCAL_TZ));

const localHour   = computed(() => localParts.value.hour);
const localMinute = computed(() => localParts.value.minute);
const localSecond = computed(() => localParts.value.second);

const localDateStr = computed(() => {
  const { year, month, day, weekday } = localDateParts.value;
  const pad = (n: number) => String(n).padStart(2, '0');
  // 计算周数（ISO 近似：当年第几周）
  const d = new Date(year, month - 1, day);
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}年${pad(month)}月${pad(day)}日${WEEK_ZH[weekday]}，第${weekNum}周`;
});

// 农历信息
const lunarStr = computed(() => {
  const { year, month, day } = localDateParts.value;
  try {
    const ts = Date.UTC(year, month - 1, day);
    const info = getDateInfo(ts);
    return `${info.gzYearZH}年 ${info.lMonthZH}${info.lDayZH}`;
  } catch {
    return '';
  }
});

// ─── 特色城市（顶部 5 个卡片） ─────────────────────────────────────────────────

const featuredTimes = computed(() =>
  FEATURED_CITIES.map(city => computeCityTime(city, now.value))
);

// ─── 世界著名城市（表格） ────────────────────────────────────────────────────

const worldTimes = computed(() =>
  WORLD_CITIES.map(city => computeCityTime(city, now.value))
);

// 三列布局
const col1 = computed(() => worldTimes.value.filter((_, i) => i % 3 === 0));
const col2 = computed(() => worldTimes.value.filter((_, i) => i % 3 === 1));
const col3 = computed(() => worldTimes.value.filter((_, i) => i % 3 === 2));
</script>

<template>
  <div class="world-clock flex flex-col gap-6">

    <!-- ── 地图背景容器：同时覆盖主时钟 + 城市卡片 ──────────────────────── -->
    <div class="hero-wrapper relative overflow-hidden rounded-2xl">
      <!-- 背景地图（absolute，铺满整个 hero-wrapper） -->
      <div class="map-bg pointer-events-none absolute inset-0" />

      <!-- ① 主时钟区域 -->
      <div class="relative px-6 py-5 sm:px-8 sm:py-6">
        <!-- 标题行 -->
        <div class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span class="text-lg leading-none">{{ LOCAL_FLAG }}</span>
          <span>{{ LOCAL_LABEL }}</span>
        </div>

        <!-- 大时钟 + 右侧日期 -->
        <div class="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div class="flex items-baseline leading-none">
            <span class="main-digit">{{ localHour }}</span>
            <span class="main-colon">:</span>
            <span class="main-digit">{{ localMinute }}</span>
            <span class="main-colon">:</span>
            <span class="main-digit">{{ localSecond }}</span>
          </div>

          <div class="ml-auto flex flex-col items-end gap-1 pb-1 text-[13px] text-slate-500 dark:text-slate-400">
            <span>{{ localDateStr }}</span>
            <span class="flex items-center gap-1">
              <CalendarDays :size="13" />
              农历 {{ lunarStr }}
            </span>
          </div>
        </div>
      </div>

      <!-- ② 城市卡片区域（同一地图背景之上） -->
      <div class="relative grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-7 lg:grid-cols-5">
        <div
          v-for="city in featuredTimes"
          :key="city.timezone"
          class="city-card"
        >
          <!-- 国旗 + 国家 -->
          <div class="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <span class="text-sm leading-none">{{ city.flag }}</span>
            <span>{{ city.country }}</span>
          </div>
          <!-- 城市名 -->
          <div class="mt-0.5 text-center text-sm font-semibold text-slate-600 dark:text-slate-200">{{ city.name }}</div>
          <!-- 日期 -->
          <div class="mt-1 text-center text-[11px] leading-snug text-slate-400 dark:text-slate-500">
            {{ city.dateStr }}
          </div>
        <!-- 翻牌时钟 -->
        <div class="mt-2 flex items-center justify-center gap-1">
          <span class="flip-card">{{ city.hour }}</span>
          <span class="flip-sep">:</span>
          <span class="flip-card">{{ city.minute }}</span>
          <span class="flip-sep">:</span>
          <span class="flip-card flip-card--sec">{{ city.second }}</span>
        </div>
        </div>
      </div>
    </div>

    <!-- ── 世界著名城市表格 ─────────────────────────────────────────────────── -->
    <div class="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div class="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
        <h2 class="text-base font-semibold text-slate-700 dark:text-slate-200">世界著名城市</h2>
      </div>
      <div class="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-700 sm:grid-cols-3 sm:divide-y-0">
        <!-- 列 1 -->
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="city in col1"
            :key="city.timezone + city.name"
            class="city-row"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-time">{{ city.dateStr.split(',')[1] }}, {{ city.timeStr }}</span>
          </div>
        </div>
        <!-- 列 2 -->
        <div class="divide-y divide-slate-100 sm:border-x sm:border-slate-100 dark:divide-slate-700 dark:sm:border-slate-700">
          <div
            v-for="city in col2"
            :key="city.timezone + city.name"
            class="city-row"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-time">{{ city.dateStr.split(',')[1] }}, {{ city.timeStr }}</span>
          </div>
        </div>
        <!-- 列 3 -->
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="city in col3"
            :key="city.timezone + city.name"
            class="city-row"
          >
            <span class="city-name">{{ city.name }}</span>
            <span class="city-time">{{ city.dateStr.split(',')[1] }}, {{ city.timeStr }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── 地图背景父容器 ──────────────────────────────────────────────────────── */
.hero-wrapper {
  background: linear-gradient(160deg, #e8eef6 0%, #d6e4f0 100%);
}

:global(.dark) .hero-wrapper {
  background: linear-gradient(160deg, #1a2332 0%, #0f172a 100%);
}

/* 背景地图装饰 */
.map-bg {
  opacity: 0.5;
  background-image: url('/images/world-map.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* ── 大时钟数字 ──────────────────────────────────────────────────────────── */
.main-digit {
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 900;
  color: #6b7280;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

:global(.dark) .main-digit {
  color: #9ca3af;
}

.main-colon {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 900;
  color: #6b7280;
  line-height: 1;
  margin: 0 1px;
  align-self: baseline;
}

:global(.dark) .main-colon {
  color: #6b7280;
}

/* ── 特色城市卡片 ────────────────────────────────────────────────────────── */
.city-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 0.75rem;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

:global(.dark) .city-card {
  background: rgba(30, 41, 59, 0.75);
  border-color: rgba(255, 255, 255, 0.08);
}

/* ── 翻牌数字卡片（时/分） ──────────────────────────────────────────────── */
.flip-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.9rem;
  height: 2.2rem;
  background: #1a1f2e;
  color: #f8fafc;
  border-radius: 7px;
  font-size: 1.25rem;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  position: relative;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.4);
  overflow: hidden;
  padding: 0 5px;
}

.flip-sep {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  margin: 0 1px;
  align-self: center;
}

/* 秒卡片：浅色背景 */
.flip-card--sec {
  background: #e8ecf0;
  color: #374151;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
}

:global(.dark) .flip-card--sec {
  background: #2d3748;
  color: #cbd5e1;
}

/* ── 世界城市表格 ────────────────────────────────────────────────────────── */
.city-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1.25rem;
  font-size: 0.83rem;
}

.city-name {
  color: hsl(var(--primary));
  font-weight: 500;
  min-width: 5rem;
}

.city-time {
  color: #64748b;
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
}

:global(.dark) .city-time {
  color: #94a3b8;
}
</style>
