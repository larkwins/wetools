<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const min = ref(1);
const max = ref(100);
const count = ref(10);
const isInt = ref(true);
const unique = ref(false);
const decimals = ref(2);
const sep = ref<'newline' | 'comma' | 'space'>('newline');

const items = ref<number[]>([]);

function generate() {
  const lo = Number(min.value);
  const hi = Number(max.value);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo >= hi) {
    items.value = [];
    return;
  }
  const n = Math.max(1, Math.min(10000, Number(count.value) || 1));
  const arr: number[] = [];
  if (isInt.value && unique.value) {
    const range = Math.floor(hi) - Math.ceil(lo) + 1;
    if (range < n) {
      items.value = [];
      return;
    }
    const set = new Set<number>();
    while (set.size < n) {
      set.add(Math.floor(Math.random() * range) + Math.ceil(lo));
    }
    arr.push(...set);
  } else {
    for (let i = 0; i < n; i++) {
      const v = Math.random() * (hi - lo) + lo;
      arr.push(isInt.value ? Math.floor(v) : Number(v.toFixed(decimals.value)));
    }
  }
  items.value = arr;
}

generate();

const text = computed(() => {
  const s = sep.value === 'newline' ? '\n' : sep.value === 'comma' ? ', ' : ' ';
  return items.value.join(s);
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">最小值</label>
        <Input v-model.number="min" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">最大值</label>
        <Input v-model.number="max" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">数量</label>
        <Input v-model.number="count" type="number" />
      </div>
      <div v-if="!isInt" class="flex flex-col gap-1.5">
        <label class="tool-section-title">小数位</label>
        <Input v-model.number="decimals" type="number" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="t in [{v:true,l:'整数'},{v:false,l:'小数'}]" :key="String(t.v)" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', isInt === t.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="isInt = t.v"
        >{{ t.l }}</button>
      </div>
      <label v-if="isInt" class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="unique" type="checkbox" class="accent-[hsl(var(--primary))]" />不重复
      </label>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="s in [{v:'newline',l:'每行一个'},{v:'comma',l:'逗号'},{v:'space',l:'空格'}]" :key="s.v" type="button"
          :class="['h-8 rounded-sm px-3 text-xs', sep === s.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="sep = s.v as 'newline' | 'comma' | 'space'"
        >{{ s.l }}</button>
      </div>
      <Button variant="primary" size="sm" class="ml-auto" @click="generate">
        <RefreshCw :size="14" />重新生成
      </Button>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-xs text-muted-foreground">{{ items.length }} 个数</span>
      <CopyButton :text="text" />
    </div>
    <Textarea :model-value="text" mono :rows="12" readonly />
  </div>
</template>
