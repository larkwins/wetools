<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const value = ref('255');
const fromBase = ref(10);
const dec = ref<bigint | null>(255n);

function tryParse(s: string, base: number) {
  const v = s.trim().replace(/^[+]/, '');
  if (!v) return null;
  const neg = v.startsWith('-');
  const body = neg ? v.slice(1) : v;
  // BigInt 不支持直接非 10 进制构造，需要先解析
  const valid = new RegExp(`^[0-9a-z]+$`, 'i').test(body);
  if (!valid) return null;
  let n = 0n;
  const B = BigInt(base);
  for (const ch of body) {
    const d = parseInt(ch, base);
    if (Number.isNaN(d)) return null;
    n = n * B + BigInt(d);
  }
  return neg ? -n : n;
}

watch(
  [value, fromBase],
  () => {
    dec.value = tryParse(value.value, Number(fromBase.value));
  },
  { immediate: true }
);

const presets = [2, 8, 10, 16];
const customBase = ref(36);
const items = computed(() => {
  if (dec.value === null) return null;
  const arr: { k: string; v: string }[] = [];
  for (const b of presets) {
    arr.push({ k: `${b} 进制`, v: dec.value.toString(b) });
  }
  arr.push({ k: `${customBase.value} 进制`, v: dec.value.toString(Number(customBase.value)) });
  return arr;
});

const extras = computed(() => {
  if (dec.value === null) return null;
  const n = dec.value;
  return [
    { k: 'BIN', v: n.toString(2) },
    { k: 'OCT', v: '0o' + n.toString(8) },
    { k: 'HEX', v: '0x' + n.toString(16).toUpperCase() },
  ];
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">输入值</label>
        <Input v-model="value" class="font-mono" placeholder="支持负数；进制由右侧选择" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">输入进制</label>
        <Input v-model.number="fromBase" type="number" class="w-32" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">自定义输出进制</label>
        <Input v-model.number="customBase" type="number" class="w-32" />
      </div>
    </div>

    <div v-if="dec === null" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      无法将 "{{ value }}" 解析为 {{ fromBase }} 进制数
    </div>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <div v-for="i in items" :key="i.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-20 shrink-0 font-mono text-xs text-muted-foreground">{{ i.k }}</span>
        <span class="flex-1 break-all font-mono text-sm">{{ i.v }}</span>
        <CopyButton :text="i.v" icon-only />
      </div>
    </div>

    <div v-if="extras" class="grid gap-2 sm:grid-cols-3">
      <div v-for="e in extras" :key="e.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-12 shrink-0 font-mono text-xs text-muted-foreground">{{ e.k }}</span>
        <span class="flex-1 break-all font-mono text-sm">{{ e.v }}</span>
        <CopyButton :text="e.v" icon-only />
      </div>
    </div>
  </div>
</template>
