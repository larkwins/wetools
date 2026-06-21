<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeftRight } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import { diffLines, diffWordsWithSpace } from 'diff';

type Granularity = 'line' | 'word';
const granularity = ref<Granularity>('line');
const ignoreCase = ref(false);
const ignoreWS = ref(false);

const a = ref(`Hello World
This is the original text.
We use WeTools every day.`);
const b = ref(`Hello, WeTools!
This is the modified text.
We use it every single day.`);

interface Part { value: string; added?: boolean; removed?: boolean }

const parts = computed<Part[]>(() => {
  const opts = { ignoreCase: ignoreCase.value, ignoreWhitespace: ignoreWS.value } as any;
  if (granularity.value === 'line') return diffLines(a.value, b.value, opts);
  return diffWordsWithSpace(a.value, b.value, opts);
});

const stats = computed(() => {
  let add = 0, del = 0;
  for (const p of parts.value) {
    if (p.added) add += p.value.length;
    else if (p.removed) del += p.value.length;
  }
  return { add, del };
});

function swap() {
  const tmp = a.value;
  a.value = b.value;
  b.value = tmp;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="g in [{v:'line',l:'按行'},{v:'word',l:'按词'}]" :key="g.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', granularity === g.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="granularity = g.v as Granularity"
        >{{ g.l }}</button>
      </div>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="ignoreCase" type="checkbox" class="accent-[hsl(var(--primary))]" />忽略大小写
      </label>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="ignoreWS" type="checkbox" class="accent-[hsl(var(--primary))]" />忽略空白
      </label>
      <span class="ml-auto font-mono text-xs">
        <span class="text-primary">+{{ stats.add }}</span>
        <span class="mx-2 text-muted-foreground">/</span>
        <span class="text-destructive">-{{ stats.del }}</span>
      </span>
      <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="tool-section-title">原文 A</label>
        <Textarea v-model="a" mono :rows="10" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="tool-section-title">新文 B</label>
        <Textarea v-model="b" mono :rows="10" />
      </div>
    </div>

    <section>
      <h3 class="mb-2 tool-section-title">差异</h3>
      <pre class="code-area whitespace-pre-wrap break-words rounded-md border bg-card p-4 leading-7" data-no-i18n><span v-for="(p, i) in parts" :key="i" :class="p.added ? 'rounded bg-primary/15 text-primary' : p.removed ? 'rounded bg-destructive/15 text-destructive line-through decoration-destructive/40' : 'text-foreground'">{{ p.value }}</span></pre>
    </section>
  </div>
</template>
