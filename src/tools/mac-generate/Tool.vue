<script setup lang="ts">
import { ref } from 'vue';
import { Shuffle } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Sep = ':' | '-' | '.' | '';
const sep = ref<Sep>(':');
const upperCase = ref(true);
const unicast = ref(true);
const global = ref(true);
const count = ref(10);
const prefix = ref(''); // 可选前缀，如 'B8:27:EB' 模拟某厂商
const list = ref<string[]>([]);

function hex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

function generateOne(): string {
  const bytes: number[] = [];
  if (prefix.value) {
    const cleaned = prefix.value.replace(/[^0-9a-fA-F]/g, '');
    const slice = cleaned.slice(0, 6);
    for (let i = 0; i < slice.length; i += 2) {
      bytes.push(parseInt(slice.slice(i, i + 2), 16));
    }
  }
  while (bytes.length < 6) bytes.push(Math.floor(Math.random() * 256));
  // 第一字节：bit0 = multicast (1) / unicast (0)
  //          bit1 = local (1) / global (0)
  if (!prefix.value) {
    let b = bytes[0];
    if (unicast.value) b &= ~0x01; else b |= 0x01;
    if (global.value) b &= ~0x02; else b |= 0x02;
    bytes[0] = b;
  }
  const parts = bytes.slice(0, 6).map(hex);
  let s = parts.join(sep.value === '.' ? '' : sep.value);
  if (sep.value === '.') {
    // 思科风格：xxxx.xxxx.xxxx
    s = `${parts[0]}${parts[1]}.${parts[2]}${parts[3]}.${parts[4]}${parts[5]}`;
  }
  return upperCase.value ? s.toUpperCase() : s.toLowerCase();
}

function generate() {
  const n = Math.max(1, Math.min(1000, Number(count.value) || 1));
  list.value = Array.from({ length: n }, () => generateOne());
}

generate();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">分隔符</label>
        <div class="inline-flex w-fit rounded-md border bg-card p-0.5">
          <button v-for="s in ([':', '-', '.', ''] as Sep[])" :key="s" type="button"
            :class="['h-9 rounded-sm px-3 text-xs font-mono', sep === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="sep = s"
          >{{ s === '' ? '无' : s === '.' ? '. (思科)' : s }}</button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">数量</label>
        <input v-model.number="count" type="number" min="1" max="1000" class="h-9 w-24 rounded-md border bg-background px-3 text-sm" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">OUI 前缀（可选）</label>
        <input v-model="prefix" placeholder="B8:27:EB" class="h-9 rounded-md border bg-background px-3 font-mono text-sm uppercase" />
      </div>
      <div class="flex flex-col gap-2 sm:col-span-2">
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
          <input v-model="upperCase" type="checkbox" class="accent-[hsl(var(--primary))]" />大写
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
          <input v-model="unicast" type="checkbox" class="accent-[hsl(var(--primary))]" :disabled="!!prefix" />单播（unicast，bit0=0）
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
          <input v-model="global" type="checkbox" class="accent-[hsl(var(--primary))]" :disabled="!!prefix" />全局唯一（global，bit1=0）
        </label>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="primary" @click="generate"><Shuffle :size="14" />生成</Button>
      <CopyButton :text="list.join('\n')" icon-only />
    </div>

    <pre class="max-h-96 overflow-auto rounded-lg border bg-card p-3 font-mono text-xs"><code>{{ list.join('\n') }}</code></pre>
  </div>
</template>
