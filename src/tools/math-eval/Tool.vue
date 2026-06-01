<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle, Trash2 } from 'lucide-vue-next';
import { evaluate } from 'mathjs';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const expr = ref(`# 多行表达式（变量会保留到下一行）
x = 5
y = 2 * x + 3
sin(pi / 4)
sqrt(2)
12 cm to inch
(3 + 4i) * (2 - i)`);
const error = ref('');

const lines = computed(() => {
  // 错误是行级的（each line 的 err），不需要全局 error
  const out: Array<{ src: string; result: string; err?: boolean }> = [];
  const scope: Record<string, unknown> = {};
  const all = expr.value.split('\n');
  for (const raw of all) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      out.push({ src: raw, result: '' });
      continue;
    }
    try {
      const r = evaluate(line, scope);
      out.push({ src: raw, result: formatResult(r) });
    } catch (e) {
      out.push({ src: raw, result: (e as Error).message, err: true });
    }
  }
  return out;
});

function formatResult(r: unknown): string {
  if (r === undefined) return '';
  if (typeof r === 'number') return Number.isInteger(r) ? String(r) : r.toPrecision(12).replace(/\.?0+$/, '');
  if (typeof r === 'object' && r !== null && 'toString' in r) return String(r);
  return String(r);
}

function clear() {
  expr.value = '';
}

const examples: Array<{ label: string; v: string }> = [
  { label: '基本运算', v: '2 + 3 * 4\n(1 + 2)^10' },
  { label: '函数', v: 'sin(pi / 2)\nsqrt(144)\nlog(100, 10)' },
  { label: '单位换算', v: '5 km to mile\n100 kg to lb\n25 inch to cm' },
  { label: '复数', v: '(2 + 3i) * (1 - 2i)\nabs(3 + 4i)' },
  { label: '矩阵', v: '[[1,2],[3,4]] * [[5,6],[7,8]]' },
  { label: '统计', v: 'mean([1,2,3,4,5])\nstd([1,2,3,4,5])' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-1.5">
      <button v-for="e in examples" :key="e.label" type="button"
        class="rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
        @click="expr = e.v"
      >{{ e.label }}</button>
      <button type="button" class="ml-auto inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground hover:text-destructive" @click="clear">
        <Trash2 :size="12" />清空
      </button>
    </div>

    <Textarea v-model="expr" mono :rows="10" placeholder="输入表达式，每行一个，支持变量、函数、单位、矩阵…" />

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">逐行结果</label>
      </div>
      <div class="rounded-lg border bg-card font-mono text-xs">
        <div v-for="(l, i) in lines" :key="i" class="grid grid-cols-[1fr_auto_1fr_auto] items-start gap-3 border-b border-border/50 px-3 py-1.5 last:border-0">
          <code class="text-muted-foreground/80 whitespace-pre-wrap">{{ l.src || '\u00A0' }}</code>
          <span v-if="l.result" class="text-muted-foreground/40">=</span>
          <code v-if="l.result" :class="l.err ? 'text-destructive' : 'text-primary'">{{ l.result }}</code>
          <CopyButton v-if="l.result && !l.err" :text="l.result" icon-only />
          <span v-else />
        </div>
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>
    <p class="text-xs text-muted-foreground">
      基于 mathjs。支持：基础运算、内置函数（sin/cos/log/sqrt 等）、变量、单位换算、复数、矩阵、统计函数。# 或 // 开头的行作注释。
    </p>
  </div>
</template>
