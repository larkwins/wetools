<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RefreshCw, ArrowLeftRight, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';

const POPULAR = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'HKD', 'TWD', 'AUD', 'CAD', 'KRW', 'SGD', 'CHF', 'NZD', 'THB', 'INR', 'RUB', 'BRL'];

const from = ref('USD');
const to = ref('CNY');
const amount = ref(100);
const rates = ref<Record<string, number>>({});
const base = ref('USD');
const updatedAt = ref('');
const error = ref('');
const loading = ref(false);

// 多个免费汇率源，按顺序尝试，第一个成功即返回。
// 各源响应格式不同，用 normalize 函数统一为 { base, date, rates }。
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
    // 开源镜像，无需 key，支持 CDN（jsdelivr）
    name: 'fawazahmed0 currency-api',
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    normalize: (d) => {
      const data = d as { date: string; usd: Record<string, number> };
      // 该源 key 全小写，需要转大写以与现有 UI 兼容
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

const result = computed(() => {
  const r1 = rates.value[from.value];
  const r2 = rates.value[to.value];
  if (!r1 || !r2) return '';
  const v = (amount.value / r1) * r2;
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
});

const oneUnitRate = computed(() => {
  const r1 = rates.value[from.value];
  const r2 = rates.value[to.value];
  if (!r1 || !r2) return '';
  const v = r2 / r1;
  return `1 ${from.value} = ${v.toFixed(4)} ${to.value}`;
});

function swap() {
  [from.value, to.value] = [to.value, from.value];
}

const popularRates = computed(() => {
  return POPULAR.filter((c) => c !== base.value).map((c) => ({
    code: c,
    rate: rates.value[c],
  })).filter((x) => x.rate);
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      ⚠️ 本工具会调用第三方汇率 API 获取数据（按顺序尝试 exchangerate-api、fawazahmed0、open.er-api），会向其服务器发送 GET 请求。
    </div>

    <div class="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">从</label>
        <select v-model="from" class="h-10 rounded-md border bg-background px-3 text-sm">
          <option v-for="c in POPULAR" :key="c" :value="c">{{ c }}</option>
          <option v-for="c in Object.keys(rates).filter((x) => !POPULAR.includes(x))" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="flex items-end pb-1">
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card text-muted-foreground hover:text-primary" @click="swap">
          <ArrowLeftRight :size="14" />
        </button>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">到</label>
        <select v-model="to" class="h-10 rounded-md border bg-background px-3 text-sm">
          <option v-for="c in POPULAR" :key="c" :value="c">{{ c }}</option>
          <option v-for="c in Object.keys(rates).filter((x) => !POPULAR.includes(x))" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="flex items-end pb-1">
        <Button variant="ghost" :disabled="loading" @click="fetchRates">
          <RefreshCw :size="14" :class="loading && 'animate-spin'" />
        </Button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ from }} 金额</label>
        <Input v-model.number="amount" type="number" class="h-12 text-lg font-mono" />
      </div>
      <div class="flex items-end pb-3 text-xl text-muted-foreground">=</div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ to }} 金额</label>
        <div class="flex h-12 items-center rounded-md border bg-secondary/40 px-3 font-mono text-lg text-primary">{{ result || '—' }}</div>
      </div>
    </div>

    <p class="text-center text-sm text-muted-foreground">{{ oneUnitRate }}</p>
    <p v-if="updatedAt" class="text-center text-xs text-muted-foreground">数据更新日期：{{ updatedAt }}</p>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <div v-if="popularRates.length" class="flex flex-col gap-2">
      <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">1 {{ base }} 对应（参考）</label>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <div v-for="r in popularRates" :key="r.code" class="flex flex-col items-center gap-0.5 rounded-md border bg-card p-2">
          <span class="text-[10px] text-muted-foreground">{{ r.code }}</span>
          <span class="font-mono text-sm font-semibold text-foreground">{{ r.rate.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
