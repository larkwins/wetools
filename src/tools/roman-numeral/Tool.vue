<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const arabic = ref(2026);
const roman = ref('');
const error1 = ref('');
const error2 = ref('');

const NUMS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    error1.value = '请输入 1 - 3999 之间的整数';
    return '';
  }
  error1.value = '';
  let res = '';
  for (const [v, s] of NUMS) {
    while (n >= v) { res += s; n -= v; }
  }
  return res;
}

function fromRoman(s: string): number {
  const str = s.trim().toUpperCase();
  if (!str) { error2.value = ''; return 0; }
  if (!/^[MDCLXVI]+$/.test(str)) {
    error2.value = '只能包含 M D C L X V I';
    return 0;
  }
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let n = 0;
  for (let i = 0; i < str.length; i++) {
    const cur = map[str[i]];
    const next = map[str[i + 1]];
    if (next && cur < next) n -= cur;
    else n += cur;
  }
  // 反向校验：能解析但可能不是规范罗马数字
  if (toRoman(n) !== str) {
    error2.value = '不是规范的罗马数字写法';
    return n;
  }
  error2.value = '';
  return n;
}

let lock = false;
watch(arabic, (v) => {
  if (lock) return;
  lock = true;
  roman.value = toRoman(Number(v));
  lock = false;
}, { immediate: true });

watch(roman, (v) => {
  if (lock) return;
  lock = true;
  const n = fromRoman(v);
  if (n) arabic.value = n;
  lock = false;
});

const presets: Array<{ n: number; r: string; label: string }> = [
  { n: 4, r: 'IV', label: '4' },
  { n: 9, r: 'IX', label: '9' },
  { n: 49, r: 'XLIX', label: '49' },
  { n: 99, r: 'XCIX', label: '99' },
  { n: 500, r: 'D', label: '500' },
  { n: 1999, r: 'MCMXCIX', label: '1999' },
  { n: 2026, r: 'MMXXVI', label: '2026' },
  { n: 3999, r: 'MMMCMXCIX', label: '3999 (最大)' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">阿拉伯数字</label>
        <div class="flex items-center gap-2">
          <Input v-model.number="arabic" type="number" min="1" max="3999" />
          <CopyButton :text="String(arabic)" icon-only />
        </div>
        <p v-if="error1" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error1 }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">罗马数字</label>
        <div class="flex items-center gap-2">
          <Input v-model="roman" class="font-mono text-base uppercase tracking-wider" />
          <CopyButton :text="roman" icon-only />
        </div>
        <p v-if="error2" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error2 }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">常用示例</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="p in presets" :key="p.n" type="button"
          class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="arabic = p.n"
        >
          <span class="font-mono font-medium text-foreground">{{ p.r }}</span>
          <span>= {{ p.label }}</span>
        </button>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      罗马数字使用 7 个字母：I(1) V(5) X(10) L(50) C(100) D(500) M(1000)。支持范围 1 - 3999。
    </p>
  </div>
</template>
