<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-vue-next';
import {
  buildCalendarMonth,
  getToday,
  getTodayStr,
  getDateInfo,
  getTimestampBySolar,
  getSolarMonthDays,
  type DateInfo,
  type CalendarDay,
} from '@/lib/calendar';

// ─── 状态 ────────────────────────────────────────────────────────────────────
const todayStr   = getTodayStr();
const todayInfo  = getToday();

const viewYear   = ref(todayInfo.sYear);
const viewMonth  = ref(todayInfo.sMonth);
const selectedDate = ref(todayStr);
const selectedInfo = ref<DateInfo>(todayInfo);

// ─── 日历格子 ─────────────────────────────────────────────────────────────────
const calendarDays = computed<CalendarDay[]>(() =>
  buildCalendarMonth(viewYear.value, viewMonth.value, selectedDate.value, todayStr)
);

// ─── 导航 ─────────────────────────────────────────────────────────────────────
function prevMonth() {
  if (viewMonth.value === 1) { viewYear.value--; viewMonth.value = 12; }
  else viewMonth.value--;
}
function nextMonth() {
  if (viewMonth.value === 12) { viewYear.value++; viewMonth.value = 1; }
  else viewMonth.value++;
}
function prevYear() { viewYear.value--; }
function nextYear() { viewYear.value++; }
function goToday() {
  viewYear.value  = todayInfo.sYear;
  viewMonth.value = todayInfo.sMonth;
  selectDay(todayStr);
}

// ─── 选中日期 ─────────────────────────────────────────────────────────────────
function selectDay(day: CalendarDay | string) {
  const dateStr = typeof day === 'string' ? day : day.date;
  selectedDate.value = dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  selectedInfo.value = getDateInfo(getTimestampBySolar(y, m, d));
  // 切换月份视图
  if (typeof day !== 'string' && !day.inMonth) {
    viewYear.value  = y;
    viewMonth.value = m;
  }
}

// ─── 年月选择 ─────────────────────────────────────────────────────────────────
const yearOptions = Array.from({ length: 201 }, (_, i) => 1900 + i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

// ─── 侧边信息 ─────────────────────────────────────────────────────────────────
const selInfo = computed(() => selectedInfo.value);

const WEEK_ZH = ['日','一','二','三','四','五','六'];

function formatSideDate(info: DateInfo) {
  return `${info.sYear}-${String(info.sMonth).padStart(2,'0')}-${String(info.sDay).padStart(2,'0')} 星期${WEEK_ZH[info.week]}`;
}
</script>

<template>
  <div class="calendar-tool">
    <div class="calendar-wrapper">
      <!-- 左侧：日历主体 -->
      <div class="calendar-main">
        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 年份 -->
          <div class="nav-group">
            <button class="nav-btn" @click="prevYear" title="上一年">
              <ChevronLeft :size="14" />
            </button>
            <select v-model="viewYear" class="year-select">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
            </select>
            <button class="nav-btn" @click="nextYear" title="下一年">
              <ChevronRight :size="14" />
            </button>
          </div>
          <!-- 月份 -->
          <div class="nav-group">
            <button class="nav-btn" @click="prevMonth" title="上一月">
              <ChevronLeft :size="14" />
            </button>
            <select v-model="viewMonth" class="month-select">
              <option v-for="m in monthOptions" :key="m" :value="m">{{ m }}月</option>
            </select>
            <button class="nav-btn" @click="nextMonth" title="下一月">
              <ChevronRight :size="14" />
            </button>
          </div>
          <!-- 返回今天 -->
          <button class="today-btn" @click="goToday">返回今天</button>
        </div>

        <!-- 星期头 -->
        <div class="week-header">
          <span v-for="w in ['日','一','二','三','四','五','六']" :key="w" :class="{ 'week-sun': w === '日', 'week-sat': w === '六' }">{{ w }}</span>
        </div>

        <!-- 日期格子 -->
        <div class="days-grid">
          <button
            v-for="day in calendarDays"
            :key="day.date"
            class="day-cell"
            :class="{
              'day-out': !day.inMonth,
              'day-today': day.isToday,
              'day-selected': day.isSelected,
              'day-holiday': day.holidayType === 1,
              'day-work': day.holidayType === 2,
              'day-weekend': (day.week === 0 || day.week === 6) && day.inMonth,
            }"
            @click="selectDay(day)"
          >
            <!-- 休/班 标记 -->
            <span v-if="day.holidayType === 1" class="badge badge-rest">休</span>
            <span v-else-if="day.holidayType === 2" class="badge badge-work">班</span>
            <!-- 日期数字 -->
            <span class="day-num">{{ day.sDay }}</span>
            <!-- 农历/节气/节日 -->
            <span
              class="day-sub"
              :class="{
                'sub-festival': !!day.festivalName,
                'sub-term': !day.festivalName && !!day.termName,
              }"
            >{{ day.lunarText }}</span>
          </button>
        </div>
      </div>

      <!-- 右侧：日期详情 -->
      <div class="calendar-side">
        <div class="side-date">{{ formatSideDate(selInfo) }}</div>

        <!-- 大数字日 -->
        <div class="side-day-box" :class="{ 'side-day-holiday': getDateInfo(getTimestampBySolar(selInfo.sYear, selInfo.sMonth, selInfo.sDay)).festival || selInfo.isToday }">
          <span class="side-day-num">{{ selInfo.sDay }}</span>
        </div>

        <!-- 农历 -->
        <div class="side-lunar">
          <div class="side-lunar-day">{{ selInfo.lDayZH }}</div>
          <div class="side-lunar-info">{{ selInfo.gzYearZH }}年 【{{ selInfo.animal }}年】</div>
          <div class="side-lunar-info">{{ selInfo.gzMonthZH }}月 {{ selInfo.gzDayZH }}日</div>
        </div>

        <!-- 分隔线 -->
        <div class="side-divider"></div>

        <!-- 节气 / 节日 -->
        <div v-if="selInfo.term || selInfo.festival" class="side-events">
          <div v-if="selInfo.term" class="side-event-item">{{ selInfo.term }}</div>
          <div v-for="f in selInfo.festival.split(' ').filter(Boolean)" :key="f" class="side-event-item">{{ f }}</div>
        </div>
        <div v-else class="side-empty">
          <CalendarDays :size="20" class="opacity-30" />
          <span>暂无节日</span>
        </div>

        <!-- 星座 -->
        <div class="side-zodiac">{{ selInfo.zodiac }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── 布局 ────────────────────────────────────────────────────────────────── */
.calendar-tool {
  @apply w-full;
}
.calendar-wrapper {
  @apply flex flex-col lg:flex-row gap-0 rounded-xl overflow-hidden border border-border;
}

/* ─── 日历主体 ─────────────────────────────────────────────────────────────── */
.calendar-main {
  @apply flex-1 p-4 bg-card;
}

/* ─── 工具栏 ──────────────────────────────────────────────────────────────── */
.toolbar {
  @apply flex items-center gap-2 flex-wrap mb-3;
}
.nav-group {
  @apply flex items-center gap-0.5 rounded-lg border border-border bg-background overflow-hidden;
}
.nav-btn {
  @apply px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors;
}
.year-select,
.month-select {
  @apply px-2 py-1.5 text-sm bg-transparent text-foreground cursor-pointer focus:outline-none;
  appearance: none;
  -webkit-appearance: none;
}
.today-btn {
  @apply ml-auto px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors;
}

/* ─── 星期头 ──────────────────────────────────────────────────────────────── */
.week-header {
  @apply grid grid-cols-7 mb-1;
}
.week-header span {
  @apply text-center text-xs text-muted-foreground py-1 font-medium;
}
.week-header .week-sun,
.week-header .week-sat {
  @apply text-rose-400;
}

/* ─── 日期格子 ─────────────────────────────────────────────────────────────── */
.days-grid {
  @apply grid grid-cols-7 gap-0.5;
}
.day-cell {
  @apply relative flex flex-col items-center justify-center py-1 rounded-lg cursor-pointer transition-colors text-center min-h-[52px];
  @apply hover:bg-muted;
}
.day-num {
  @apply text-sm font-medium leading-tight;
}
.day-sub {
  @apply text-[10px] leading-tight text-muted-foreground mt-0.5 truncate max-w-full px-0.5;
}

/* 状态类 */
.day-out .day-num,
.day-out .day-sub {
  @apply opacity-30;
}
.day-weekend:not(.day-out) .day-num {
  @apply text-rose-500;
}
.day-today {
  @apply ring-1 ring-amber-400;
}
.day-today .day-num {
  @apply text-amber-500 font-bold;
}
.day-selected {
  @apply ring-2 ring-primary;
}
.day-selected .day-num {
  @apply text-primary font-bold;
}

/* 节假日高亮 */
.day-holiday {
  @apply bg-emerald-50 dark:bg-emerald-950/30;
}
.day-holiday:not(.day-out) .day-num {
  @apply text-emerald-600 dark:text-emerald-400;
}
.day-work {
  @apply bg-rose-50 dark:bg-rose-950/30;
}

/* 节日/节气文字色 */
.sub-festival {
  @apply text-emerald-600 dark:text-emerald-400;
}
.sub-term {
  @apply text-sky-500 dark:text-sky-400;
}

/* 休/班 角标 */
.badge {
  @apply absolute top-0.5 right-0.5 text-[9px] leading-none px-0.5 py-px rounded font-bold;
}
.badge-rest {
  @apply bg-emerald-500 text-white;
}
.badge-work {
  @apply bg-rose-500 text-white;
}

/* ─── 右侧详情 ─────────────────────────────────────────────────────────────── */
.calendar-side {
  @apply w-full lg:w-48 flex flex-col items-center gap-3 p-5
    bg-[hsl(var(--primary))] text-white;
}
.side-date {
  @apply text-sm font-medium opacity-90 text-center w-full;
}
.side-day-box {
  @apply flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20;
}
.side-day-holiday {
  @apply bg-amber-400;
}
.side-day-num {
  @apply text-5xl font-bold;
}
.side-lunar {
  @apply flex flex-col items-center gap-0.5 text-center;
}
.side-lunar-day {
  @apply text-lg font-semibold;
}
.side-lunar-info {
  @apply text-xs opacity-80;
}
.side-divider {
  @apply w-full border-t border-white/20;
}
.side-events {
  @apply flex flex-col items-center gap-1;
}
.side-event-item {
  @apply text-sm font-medium;
}
.side-empty {
  @apply flex flex-col items-center gap-1 opacity-50 text-xs;
}
.side-zodiac {
  @apply mt-auto text-xs opacity-60;
}
</style>
