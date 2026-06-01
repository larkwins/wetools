<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const value = ref(16);
const baseFont = ref(16);
const viewportW = ref(1440);
const viewportH = ref(900);

function fmt(n: number) {
  return Math.round(n * 10000) / 10000;
}

const items = computed(() => {
  const px = Number(value.value) || 0;
  const base = Number(baseFont.value) || 16;
  const vw = Number(viewportW.value) || 1;
  const vh = Number(viewportH.value) || 1;
  return [
    { k: 'px', v: fmt(px) + 'px' },
    { k: 'rem', v: fmt(px / base) + 'rem' },
    { k: 'em', v: fmt(px / base) + 'em' },
    { k: 'vw', v: fmt((px / vw) * 100) + 'vw' },
    { k: 'vh', v: fmt((px / vh) * 100) + 'vh' },
    { k: 'pt', v: fmt(px * 0.75) + 'pt' },
    { k: '%', v: fmt((px / base) * 100) + '%' },
  ];
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">输入值（px）</label>
        <Input v-model.number="value" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">根字号 (px)</label>
        <Input v-model.number="baseFont" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">视口宽 (px)</label>
        <Input v-model.number="viewportW" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">视口高 (px)</label>
        <Input v-model.number="viewportH" type="number" />
      </div>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <div v-for="i in items" :key="i.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-12 shrink-0 font-mono text-xs uppercase text-muted-foreground">{{ i.k }}</span>
        <span class="flex-1 truncate font-mono text-sm">{{ i.v }}</span>
        <CopyButton :text="i.v" icon-only />
      </div>
    </div>
  </div>
</template>
