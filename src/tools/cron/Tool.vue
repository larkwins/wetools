<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import cronstrue from 'cronstrue';
import 'cronstrue/locales/zh_CN';
// cron-parser v5 改用 CronExpressionParser 类（v4 的顶层 parseExpression 已废弃）
import { CronExpressionParser } from 'cron-parser';

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
    const it = CronExpressionParser.parse(expr.value);
    const arr: string[] = [];
    for (let i = 0; i < 8; i++) arr.push(it.next().toDate().toLocaleString());
    return arr;
  } catch {
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
    <!-- Cron 表达式输入 -->
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">Cron 表达式</label>
      <div class="rounded-lg border bg-card/60 p-3 flex flex-col gap-3">
        <div class="flex gap-2">
          <Input v-model="expr" class="flex-1 font-mono" placeholder="例如：*/15 9-18 * * MON-FRI" />
          <div class="inline-flex rounded-md border bg-card p-0.5">
            <button v-for="l in [{v:'zh_CN',l:'中'},{v:'en',l:'EN'}]" :key="l.v" type="button"
              :class="['h-9 rounded-sm px-3 text-xs', lang === l.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
              @click="lang = l.v as 'zh_CN' | 'en'"
            >{{ l.l }}</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="p in presets" :key="p.v" type="button"
            class="rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
            @click="expr = p.v"
          >{{ p.l }}</button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm font-medium text-destructive">
      <AlertCircle :size="14" class="inline" /> {{ error }}
    </div>

    <!-- 结果展示 -->
    <div v-else class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <h3 class="tool-section-title">人类可读描述</h3>
        <section class="rounded-lg border bg-card p-4">
          <div class="flex items-center gap-2">
            <p class="flex-1 text-base">{{ human }}</p>
            <CopyButton :text="human ?? ''" icon-only />
          </div>
        </section>
      </div>

      <div class="flex flex-col gap-2">
        <h3 class="tool-section-title">下次执行时间（前 8 次）</h3>
        <section class="rounded-lg border bg-card p-4">
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
  </div>
</template>
