<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'ratio' | 'change' | 'apply' | 'discount';
const mode = ref<Mode>('ratio');

// 1) 占比：A 是 B 的百分之几
const r_a = ref(50);
const r_b = ref(200);
const r_result = computed(() => r_b.value === 0 ? '—' : ((r_a.value / r_b.value) * 100).toFixed(2) + '%');

// 2) 涨跌幅：从 A 到 B 增长 / 下降百分之几
const c_a = ref(100);
const c_b = ref(150);
const c_result = computed(() => {
  if (c_a.value === 0) return '—';
  const p = ((c_b.value - c_a.value) / c_a.value) * 100;
  const sign = p >= 0 ? '+' : '';
  return `${sign}${p.toFixed(2)}%`;
});

// 3) 应用百分比：A 增加 / 减少 N% 后是多少
const a_val = ref(100);
const a_pct = ref(20);
const a_op = ref<'+' | '-'>('+');
const a_result = computed(() => {
  const k = a_op.value === '+' ? 1 + a_pct.value / 100 : 1 - a_pct.value / 100;
  return (a_val.value * k).toFixed(2);
});

// 4) 折扣：原价 → 折后价 + 节省
const d_origin = ref(199);
const d_pct = ref(20);
const d_final = computed(() => (d_origin.value * (1 - d_pct.value / 100)).toFixed(2));
const d_save = computed(() => (d_origin.value * (d_pct.value / 100)).toFixed(2));

const tabs: Array<{ k: Mode; l: string }> = [
  { k: 'ratio', l: '占比' },
  { k: 'change', l: '涨跌幅' },
  { k: 'apply', l: '增减后值' },
  { k: 'discount', l: '折扣' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="inline-flex w-fit rounded-md border bg-card p-0.5">
      <button
        v-for="t in tabs"
        :key="t.k"
        type="button"
        :class="['h-9 rounded-sm px-3 text-sm', mode === t.k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
        @click="mode = t.k"
      >{{ t.l }}</button>
    </div>

    <!-- 1) 占比 -->
    <div v-if="mode === 'ratio'" class="rounded-lg border bg-card p-4">
      <p class="mb-3 text-sm text-muted-foreground">A 是 B 的百分之几？</p>
      <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <Input v-model.number="r_a" type="number" />
        <span class="px-2 text-muted-foreground">÷</span>
        <Input v-model.number="r_b" type="number" />
        <span class="px-2 text-muted-foreground">=</span>
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-base text-primary">
          <span class="flex-1">{{ r_result }}</span>
          <CopyButton :text="r_result" icon-only />
        </div>
      </div>
    </div>

    <!-- 2) 涨跌幅 -->
    <div v-else-if="mode === 'change'" class="rounded-lg border bg-card p-4">
      <p class="mb-3 text-sm text-muted-foreground">从 A 到 B 的变化幅度（正数=上涨，负数=下跌）</p>
      <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <Input v-model.number="c_a" type="number" />
        <span class="px-2 text-muted-foreground">→</span>
        <Input v-model.number="c_b" type="number" />
        <span class="px-2 text-muted-foreground">=</span>
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-base"
          :class="c_result.startsWith('-') ? 'text-red-500' : 'text-emerald-500'">
          <span class="flex-1">{{ c_result }}</span>
          <CopyButton :text="c_result" icon-only />
        </div>
      </div>
    </div>

    <!-- 3) 应用百分比 -->
    <div v-else-if="mode === 'apply'" class="rounded-lg border bg-card p-4">
      <p class="mb-3 text-sm text-muted-foreground">数值 增加 / 减少 N% 后的结果</p>
      <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto_1fr_auto_1fr]">
        <Input v-model.number="a_val" type="number" />
        <div class="inline-flex rounded-md border bg-background p-0.5">
          <button v-for="op in (['+', '-'] as const)" :key="op" type="button"
            :class="['h-9 w-9 rounded-sm text-base font-semibold', a_op === op ? 'bg-primary text-primary-foreground' : 'text-muted-foreground']"
            @click="a_op = op"
          >{{ op }}</button>
        </div>
        <Input v-model.number="a_pct" type="number" class="!w-24" />
        <span class="px-2 text-muted-foreground">% =</span>
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-base text-primary">
          <span class="flex-1">{{ a_result }}</span>
          <CopyButton :text="a_result" icon-only />
        </div>
      </div>
    </div>

    <!-- 4) 折扣 -->
    <div v-else class="rounded-lg border bg-card p-4">
      <p class="mb-3 text-sm text-muted-foreground">原价 - 折扣百分比 = 折后价 + 节省金额</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">原价</label>
          <Input v-model.number="d_origin" type="number" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">折扣 (%)</label>
          <Input v-model.number="d_pct" type="number" />
        </div>
      </div>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
          <span class="text-xs text-muted-foreground">折后价</span>
          <span class="flex-1 text-right font-mono text-base text-primary">{{ d_final }}</span>
          <CopyButton :text="d_final" icon-only />
        </div>
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
          <span class="text-xs text-muted-foreground">节省</span>
          <span class="flex-1 text-right font-mono text-base text-emerald-500">{{ d_save }}</span>
          <CopyButton :text="d_save" icon-only />
        </div>
      </div>
    </div>
  </div>
</template>
