<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import cronstrue from 'cronstrue';
import 'cronstrue/locales/zh_CN';
import cronParser from 'cron-parser';

const expr = ref('*/15 9-18 * * MON-FRI');
const lang = ref<'zh_CN' | 'en'>('zh_CN');

const human = computed(() => {
  try {
    return cronstrue.toString(expr.value, { locale: lang.value, throwExceptionOnParseError: true });
  } catch (e) {
    return null;
  }
});

const upcoming = computed(() => {
  try {
    const it = cronParser.parseExpression(expr.value);
    const arr: string[] = [];
    for (let i = 0; i < 8; i++) arr.push(it.next().toDate().toLocaleString());
    return arr;
  } catch (e) {
    return null;
  }
});

const error = computed(() => (human.value === null ? '无法解析的 Cron 表达式' : null));

const presets: { v: string; l: string }[] = [
  { v: '*/5 * * * *', l: '每 5 分钟' },
  { v: '0 * * * *', l: '每小时整点' },
  { v: '0 9 * * *', l: '每天 09:00' },
  { v: '0 9 * * MON', l: '每周一 09:00' },
  { v: '0 0 1 * *', l: '每月 1 号 0:00' },
  { v: '0 0 1 1 *', l: '每年 1 月 1 日' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] uppercase tracking-wider text-muted-foreground">Cron 表达式</label>
      <div class="flex gap-2">
        <Input v-model="expr" class="flex-1 font-mono" placeholder="例如：*/15 9-18 * * MON-FRI" />
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="l in [{v:'zh_CN',l:'中'},{v:'en',l:'EN'}]" :key="l.v" type="button"
            :class="['h-9 rounded-sm px-3 text-xs', lang === l.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="lang = l.v as 'zh_CN' | 'en'"
          >{{ l.l }}</button>
        </div>
      </div>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <button v-for="p in presets" :key="p.v" type="button"
          class="rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="expr = p.v"
        >{{ p.l }}</button>
      </div>
    </div>

    <div v-if="error" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle :size="14" class="inline" /> {{ error }}
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <section class="rounded-lg border bg-card p-4">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">人类可读描述</h3>
        <div class="flex items-center gap-2">
          <p class="flex-1 text-base">{{ human }}</p>
          <CopyButton :text="human ?? ''" icon-only />
        </div>
      </section>

      <section class="rounded-lg border bg-card p-4">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">下次执行时间（前 8 次）</h3>
        <ol class="space-y-1 font-mono text-xs">
          <li v-for="(t, i) in upcoming ?? []" :key="i" class="flex items-center gap-2">
            <span class="w-6 shrink-0 text-muted-foreground">{{ i + 1 }}.</span>
            <span class="flex-1">{{ t }}</span>
            <CopyButton :text="t" icon-only />
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
