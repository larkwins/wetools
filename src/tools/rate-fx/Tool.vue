<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ArrowLeftRight, RefreshCw, AlertCircle, ChevronDown, Check } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';

// 常用 11 个币种，flag 是 Unicode 国旗 emoji（区域代码字母拼）
interface CurrencyMeta { code: string; zh: string; en: string; symbol: string; flag: string }
const POPULAR_CURRENCIES: CurrencyMeta[] = [
  { code: 'CNY', zh: '人民币',   en: 'Chinese Yuan',     symbol: '¥',   flag: '🇨🇳' },
  { code: 'USD', zh: '美元',     en: 'US Dollar',        symbol: '$',   flag: '🇺🇸' },
  { code: 'EUR', zh: '欧元',     en: 'Euro',             symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', zh: '英镑',     en: 'British Pound',    symbol: '£',   flag: '🇬🇧' },
  { code: 'JPY', zh: '日元',     en: 'Japanese Yen',     symbol: '¥',   flag: '🇯🇵' },
  { code: 'HKD', zh: '港币',     en: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  // 部分系统/字体（尤其大陆 Win/Android 默认字体）不渲染 🇹🇼，会显示为 □；统一用 🇨🇳
  { code: 'TWD', zh: '新台币',   en: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇨🇳' },
  { code: 'KRW', zh: '韩元',     en: 'South Korean Won', symbol: '₩',   flag: '🇰🇷' },
  { code: 'SGD', zh: '新加坡元', en: 'Singapore Dollar', symbol: 'S$',  flag: '🇸🇬' },
  { code: 'AUD', zh: '澳元',     en: 'Australian Dollar', symbol: 'A$',  flag: '🇦🇺' },
  { code: 'CAD', zh: '加元',     en: 'Canadian Dollar',  symbol: 'C$',  flag: '🇨🇦' },
];
const POPULAR = POPULAR_CURRENCIES.map((c) => c.code);
const CURRENCY_MAP = new Map(POPULAR_CURRENCIES.map((c) => [c.code, c]));

function meta(code: string): CurrencyMeta {
  return CURRENCY_MAP.get(code) ?? { code, zh: code, en: code, symbol: '', flag: '' };
}

const from = ref('USD');
const to = ref('CNY');
// 默认空，让用户自由输入；模板里若 fromAmount 为空就走"汇率展示"模式
const fromAmount = ref<string>('');
// toAmount 是受控的另一侧：用户可以从任一边输入，另一边自动算
const toAmount = ref<string>('');

const rates = ref<Record<string, number>>({});
const base = ref('USD');
const updatedAt = ref('');
const error = ref('');
const loading = ref(false);

interface NormalizedRates { base: string; date: string; rates: Record<string, number> }
const RATE_SOURCES: Array<{ name: string; url: string; normalize: (data: unknown) => NormalizedRates }> = [
  {
    name: 'exchangerate-api.com',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    normalize: (d) => {
      const data = d as { base: string; date: string; rates: Record<string, number> };
      return { base: data.base, date: data.date, rates: data.rates };
    },
  },
  {
    name: 'fawazahmed0 currency-api',
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    normalize: (d) => {
      const data = d as { date: string; usd: Record<string, number> };
      const upperRates: Record<string, number> = {};
      for (const [k, v] of Object.entries(data.usd)) upperRates[k.toUpperCase()] = v;
      return { base: 'USD', date: data.date, rates: upperRates };
    },
  },
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    normalize: (d) => {
      const data = d as { base_code: string; time_last_update_utc: string; rates: Record<string, number> };
      return {
        base: data.base_code,
        date: data.time_last_update_utc?.slice(0, 16) ?? '',
        rates: data.rates,
      };
    },
  },
];

async function fetchRates() {
  loading.value = true;
  error.value = '';
  const errs: string[] = [];
  for (const src of RATE_SOURCES) {
    try {
      const res = await fetch(src.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const n = src.normalize(data);
      rates.value = n.rates;
      base.value = n.base;
      updatedAt.value = n.date;
      loading.value = false;
      return;
    } catch (e) {
      errs.push(`${src.name}: ${(e as Error).message || String(e)}`);
    }
  }
  error.value = '所有汇率源均不可用：\n' + errs.join('\n');
  loading.value = false;
}

onMounted(fetchRates);

// 1 单位 from 等于多少 to（基础汇率）
const oneFromToTo = computed(() => {
  const r1 = rates.value[from.value];
  const r2 = rates.value[to.value];
  if (!r1 || !r2) return 0;
  return r2 / r1;
});
const oneToToFrom = computed(() => {
  const r1 = rates.value[from.value];
  const r2 = rates.value[to.value];
  if (!r1 || !r2) return 0;
  return r1 / r2;
});

// 格式化数字：小金额(<1)4位小数，否则2位
function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: n < 1 ? 4 : 2,
    maximumFractionDigits: n < 1 ? 4 : 2,
  });
}

// 防止 watch 互相触发死循环
let updating = false;

function recompute(from2to: boolean) {
  if (updating) return;
  updating = true;
  if (from2to) {
    const n = parseFloat(fromAmount.value);
    if (!isFinite(n) || isNaN(n)) {
      toAmount.value = '';
    } else {
      toAmount.value = fmt(n * oneFromToTo.value);
    }
  } else {
    const n = parseFloat(toAmount.value);
    if (!isFinite(n) || isNaN(n)) {
      fromAmount.value = '';
    } else {
      fromAmount.value = fmt(n * oneToToFrom.value);
    }
  }
  // 下个 tick 解锁
  setTimeout(() => { updating = false; }, 0);
}

watch(fromAmount, () => recompute(true));
watch(toAmount, () => recompute(false));
// 切换币种 / 汇率刷新后，按当前输入侧重算另一侧
watch([from, to, oneFromToTo], () => recompute(true));

function swap() {
  // 同时交换币种与金额，体验更自然
  const tmpCode = from.value;
  from.value = to.value;
  to.value = tmpCode;
  const tmpAmount = fromAmount.value;
  fromAmount.value = toAmount.value;
  toAmount.value = tmpAmount;
}

// 是否处于"输入金额模式"（即顶部显示 100 美元 = 676.51 人民币）
const hasInput = computed(() => {
  const n = parseFloat(fromAmount.value);
  return isFinite(n) && !isNaN(n) && n !== 0;
});

// ====== 自定义币种下拉 ======
// 用自定义弹窗替代 <select>，避免不同 OS 把 emoji 渲染过小、样式无法定制等问题
const openMenu = ref<'from' | 'to' | null>(null);
function toggleMenu(e: MouseEvent, which: 'from' | 'to') {
  e.stopPropagation(); // 阻止冒泡到 document onDocClick，避免刚开就被关
  openMenu.value = openMenu.value === which ? null : which;
}
function selectCurrency(e: MouseEvent, which: 'from' | 'to', code: string) {
  e.stopPropagation();
  if (which === 'from') from.value = code;
  else to.value = code;
  openMenu.value = null;
}
// 点击外部关闭
function onDocClick() {
  openMenu.value = null;
}
onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- 顶部摘要：默认双向汇率；有输入时显示"X 美元 约等于 Y 人民币" -->
    <div v-if="oneFromToTo > 0" class="flex flex-col gap-1">
      <template v-if="hasInput">
        <p class="text-sm text-muted-foreground">
          {{ fromAmount }} {{ meta(from).zh }} 约等于
        </p>
        <p class="text-3xl font-bold tabular-nums sm:text-4xl">
          {{ toAmount || '—' }} <span class="text-xl font-medium text-muted-foreground sm:text-2xl">{{ meta(to).zh }}</span>
        </p>
      </template>
      <template v-else>
        <p class="text-lg font-medium tabular-nums sm:text-xl">
          1 {{ meta(from).zh }} ≈ {{ fmt(oneFromToTo) }} {{ meta(to).zh }}
        </p>
        <p class="text-base text-muted-foreground tabular-nums sm:text-lg">
          1 {{ meta(to).zh }} ≈ {{ fmt(oneToToFrom) }} {{ meta(from).zh }}
        </p>
      </template>
    </div>

    <!-- 转换器主体：[币种+金额] [⇄] [币种+金额] -->
    <div class="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
      <!-- From 卡片：外层加 relative 让 ul 可以脱离卡片正常浮出（不用 overflow-hidden 否则下拉被裁）
           圆角裁切改成依赖子元素自己的 rounded 边界 -->
      <div class="relative flex items-stretch rounded-2xl border bg-card shadow-sm transition-shadow focus-within:shadow-md" data-currency-dropdown>
        <div class="relative flex-none rounded-l-2xl border-r bg-secondary/50">
          <button
            type="button"
            class="flex h-full items-center gap-2 rounded-l-2xl py-3 pl-4 pr-8 text-base font-medium cursor-pointer hover:bg-secondary/70 outline-none"
            @click="toggleMenu($event, 'from')"
          >
            <span class="text-xl leading-none">{{ meta(from).flag }}</span>
            <span>{{ from }} · {{ meta(from).zh }}</span>
          </button>
          <ChevronDown :size="14" class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <input
          v-model="fromAmount"
          type="text"
          inputmode="decimal"
          placeholder="0"
          class="min-w-0 flex-1 rounded-r-2xl bg-transparent px-4 py-3 text-right text-2xl font-semibold tabular-nums outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
        />
        <!-- 弹窗：放到卡片外层（卡片有 relative），不受任何 overflow 影响 -->
        <ul
          v-if="openMenu === 'from'"
          class="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-lg border bg-popover shadow-lg"
        >
          <li
            v-for="c in POPULAR"
            :key="c"
            class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
            :class="from === c && 'bg-primary/10 text-primary'"
            @click="selectCurrency($event, 'from', c)"
          >
            <span class="text-xl leading-none">{{ meta(c).flag }}</span>
            <span class="flex-1">{{ c }} · {{ meta(c).zh }}</span>
            <Check v-if="from === c" :size="14" class="text-primary" />
          </li>
        </ul>
      </div>

      <!-- 中间换向 -->
      <div class="flex items-center justify-center">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-all hover:rotate-180 hover:border-primary/40 hover:text-primary"
          @click="swap"
          aria-label="交换币种"
          title="交换币种"
        >
          <ArrowLeftRight :size="16" />
        </button>
      </div>

      <!-- To 卡片：同 From 卡片结构 -->
      <div class="relative flex items-stretch rounded-2xl border bg-card shadow-sm transition-shadow focus-within:shadow-md" data-currency-dropdown>
        <div class="relative flex-none rounded-l-2xl border-r bg-secondary/50">
          <button
            type="button"
            class="flex h-full items-center gap-2 rounded-l-2xl py-3 pl-4 pr-8 text-base font-medium cursor-pointer hover:bg-secondary/70 outline-none"
            @click="toggleMenu($event, 'to')"
          >
            <span class="text-xl leading-none">{{ meta(to).flag }}</span>
            <span>{{ to }} · {{ meta(to).zh }}</span>
          </button>
          <ChevronDown :size="14" class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <input
          v-model="toAmount"
          type="text"
          inputmode="decimal"
          placeholder="0"
          class="min-w-0 flex-1 rounded-r-2xl bg-transparent px-4 py-3 text-right text-2xl font-semibold tabular-nums outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
        />
        <ul
          v-if="openMenu === 'to'"
          class="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-lg border bg-popover shadow-lg"
        >
          <li
            v-for="c in POPULAR"
            :key="c"
            class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
            :class="to === c && 'bg-primary/10 text-primary'"
            @click="selectCurrency($event, 'to', c)"
          >
            <span class="text-xl leading-none">{{ meta(c).flag }}</span>
            <span class="flex-1">{{ c }} · {{ meta(c).zh }}</span>
            <Check v-if="to === c" :size="14" class="text-primary" />
          </li>
        </ul>
      </div>
    </div>

    <!-- 元信息：更新时间 + 手动刷新 -->
    <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span v-if="updatedAt">数据更新于 {{ updatedAt }}</span>
      <span v-else>—</span>
      <Button variant="ghost" size="sm" :disabled="loading" @click="fetchRates">
        <RefreshCw :size="12" :class="loading && 'animate-spin'" />
        刷新汇率
      </Button>
    </div>

    <!-- 错误 -->
    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <!-- 数据来源说明（次要信息放最下方，不喧宾夺主） -->
    <p class="text-xs text-muted-foreground">
      数据来源：依次尝试 exchangerate-api.com / fawazahmed0 / open.er-api.com 三个第三方公开汇率 API，会向其服务器发送 GET 请求。
    </p>
  </div>
</template>
