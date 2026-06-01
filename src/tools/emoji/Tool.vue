<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import { EMOJI_GROUPS } from './data';

const keyword = ref('');
const activeGroup = ref('all');
const copied = ref('');

const allItems = computed(() => EMOJI_GROUPS.flatMap((g) => g.items));

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  let pool = activeGroup.value === 'all'
    ? allItems.value
    : EMOJI_GROUPS.find((g) => g.id === activeGroup.value)?.items ?? [];
  if (kw) {
    pool = pool.filter((it) =>
      it.n.toLowerCase().includes(kw) ||
      it.c.includes(kw) ||
      (it.k && it.k.some((k) => k.toLowerCase().includes(kw)))
    );
  }
  return pool;
});

async function copy(c: string) {
  try {
    await navigator.clipboard.writeText(c);
    copied.value = c;
    setTimeout(() => { if (copied.value === c) copied.value = ''; }, 1200);
  } catch {/* ignore */}
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" placeholder="搜索 emoji（中英文关键词）…" class="pl-9" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        type="button"
        :class="['rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          activeGroup === 'all' ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground']"
        @click="activeGroup = 'all'"
      >全部 ({{ allItems.length }})</button>
      <button
        v-for="g in EMOJI_GROUPS" :key="g.id" type="button"
        :class="['rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          activeGroup === g.id ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground']"
        @click="activeGroup = g.id"
      >{{ g.title }} ({{ g.items.length }})</button>
    </div>

    <div v-if="filtered.length === 0" class="rounded-md border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
      没有匹配的 emoji
    </div>

    <div v-else class="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-14 xl:grid-cols-16">
      <button
        v-for="(item, i) in filtered" :key="i" type="button"
        :title="`${item.c} ${item.n}${item.k ? ' · ' + item.k.join(' / ') : ''}`"
        :class="['relative flex aspect-square items-center justify-center rounded-md border bg-card text-2xl transition-all hover:scale-110 hover:border-primary/60 hover:bg-secondary',
          copied === item.c && 'ring-2 ring-primary']"
        @click="copy(item.c)"
      >
        {{ item.c }}
        <span v-if="copied === item.c" class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
          已复制
        </span>
      </button>
    </div>

    <p class="text-xs text-muted-foreground">
      点击任意 emoji 即复制到剪贴板。共收录 {{ allItems.length }} 个常用 emoji，覆盖日常使用 95%+。
    </p>
  </div>
</template>
