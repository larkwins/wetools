<script setup lang="ts">
import { ref, computed } from 'vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref(`apple
banana
apple
Cherry
banana
date
`);

function lines() {
  return input.value.split(/\r?\n/);
}

const stats = computed(() => {
  const ls = input.value.split(/\r?\n/);
  const words = input.value.match(/\S+/g) ?? [];
  const cjk = input.value.match(/[\u4e00-\u9fff]/g) ?? [];
  return {
    chars: input.value.length,
    charsNoSpace: input.value.replace(/\s/g, '').length,
    bytes: new TextEncoder().encode(input.value).length,
    words: words.length,
    cjk: cjk.length,
    lines: ls.length,
    nonEmptyLines: ls.filter((l) => l.trim()).length,
  };
});

function apply(fn: (ls: string[]) => string[]) {
  input.value = fn(lines()).join('\n');
}

const ops: { label: string; fn: () => void }[] = [
  { label: '去重（保留首次）', fn: () => apply((ls) => Array.from(new Set(ls))) },
  { label: '排序 ASC', fn: () => apply((ls) => [...ls].sort((a, b) => a.localeCompare(b))) },
  { label: '排序 DESC', fn: () => apply((ls) => [...ls].sort((a, b) => b.localeCompare(a))) },
  { label: '随机打乱', fn: () => apply((ls) => [...ls].sort(() => Math.random() - 0.5)) },
  { label: '反转行', fn: () => apply((ls) => [...ls].reverse()) },
  { label: '反转字符', fn: () => (input.value = Array.from(input.value).reverse().join('')) },
  { label: '去空行', fn: () => apply((ls) => ls.filter((l) => l.trim())) },
  { label: 'Trim 每行', fn: () => apply((ls) => ls.map((l) => l.trim())) },
  { label: '小写', fn: () => (input.value = input.value.toLowerCase()) },
  { label: '大写', fn: () => (input.value = input.value.toUpperCase()) },
  { label: '加行号', fn: () => apply((ls) => ls.map((l, i) => `${i + 1}\t${l}`)) },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button v-for="op in ops" :key="op.label" variant="secondary" size="sm" @click="op.fn">
        {{ op.label }}
      </Button>
    </div>

    <div class="flex items-center justify-between">
      <span class="font-mono text-xs text-muted-foreground">
        {{ stats.lines }} 行（{{ stats.nonEmptyLines }} 非空）·
        {{ stats.chars }} 字符（去空白 {{ stats.charsNoSpace }}）·
        {{ stats.words }} 词 ·
        中文 {{ stats.cjk }} ·
        {{ stats.bytes }} 字节
      </span>
      <CopyButton :text="input" />
    </div>
    <Textarea v-model="input" mono :rows="20" />
  </div>
</template>
