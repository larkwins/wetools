<script setup lang="ts">
import { ref, watch } from 'vue';
import CopyButton from '@/components/ui/CopyButton.vue';

// 以摄氏度为基准
const c = ref(25);

// 单位定义：c → unit，及反向
interface Unit {
  key: 'C' | 'F' | 'K' | 'R' | 'Re' | 'N';
  zh: string;
  en: string;
  symbol: string;
  /** 从摄氏度转换 */
  fromC: (v: number) => number;
  /** 转回摄氏度 */
  toC: (v: number) => number;
  ref?: string;
}

const UNITS: Unit[] = [
  { key: 'C', zh: '摄氏度', en: 'Celsius', symbol: '°C', fromC: (v) => v, toC: (v) => v, ref: '水的冰点 0 °C / 沸点 100 °C' },
  { key: 'F', zh: '华氏度', en: 'Fahrenheit', symbol: '°F', fromC: (v) => v * 9 / 5 + 32, toC: (v) => (v - 32) * 5 / 9, ref: '人体体温 ≈ 98.6 °F' },
  { key: 'K', zh: '开尔文', en: 'Kelvin', symbol: 'K', fromC: (v) => v + 273.15, toC: (v) => v - 273.15, ref: '绝对零度 = 0 K' },
  { key: 'R', zh: '兰金度', en: 'Rankine', symbol: '°R', fromC: (v) => (v + 273.15) * 9 / 5, toC: (v) => v * 5 / 9 - 273.15, ref: '美国工程界使用' },
  { key: 'Re', zh: '列氏度', en: 'Réaumur', symbol: '°Ré', fromC: (v) => v * 4 / 5, toC: (v) => v * 5 / 4, ref: '历史用，主要在欧洲' },
  { key: 'N', zh: '牛顿度', en: 'Newton', symbol: '°N', fromC: (v) => v * 33 / 100, toC: (v) => v * 100 / 33, ref: '牛顿提出，已不常用' },
];

const values = ref<Record<string, number>>({});

function recompute(base: number) {
  const next: Record<string, number> = {};
  for (const u of UNITS) {
    next[u.key] = round(u.fromC(base), 4);
  }
  values.value = next;
}

function round(n: number, d: number): number {
  if (!Number.isFinite(n)) return 0;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function onInput(key: Unit['key'], raw: string) {
  const v = Number(raw);
  if (!Number.isFinite(v)) return;
  const u = UNITS.find((x) => x.key === key)!;
  c.value = u.toC(v);
}

watch(c, recompute, { immediate: true });

const presets: Array<{ label: string; c: number }> = [
  { label: '绝对零度', c: -273.15 },
  { label: '水冰点', c: 0 },
  { label: '冰箱冷藏', c: 4 },
  { label: '室温', c: 25 },
  { label: '人体体温', c: 37 },
  { label: '水沸点', c: 100 },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="u in UNITS"
        :key="u.key"
        class="flex flex-col gap-1.5 rounded-lg border bg-card p-3"
      >
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-semibold text-foreground">{{ u.zh }}</span>
          <span class="font-mono text-xs text-muted-foreground">{{ u.symbol }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <input
            :value="values[u.key]"
            type="number"
            step="0.01"
            class="flex h-9 w-full rounded-md border bg-background px-3 font-mono text-sm text-foreground hover:border-primary/40 focus:border-primary focus:outline-none"
            @input="onInput(u.key, ($event.target as HTMLInputElement).value)"
          />
          <CopyButton :text="String(values[u.key] ?? '')" icon-only />
        </div>
        <p v-if="u.ref" class="text-[11px] text-muted-foreground">{{ u.ref }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="tool-section-title">常用温度</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="p in presets" :key="p.label" type="button"
          class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="c = p.c"
        >
          {{ p.label }} <span class="font-mono">{{ p.c }} °C</span>
        </button>
      </div>
    </div>
  </div>
</template>
