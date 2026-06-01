<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle, Plus, Minus, Pencil } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';

const left = ref(JSON.stringify({
  name: 'Alice',
  age: 30,
  city: 'Shanghai',
  tags: ['admin', 'dev'],
  profile: { lang: 'zh', theme: 'light' },
}, null, 2));

const right = ref(JSON.stringify({
  name: 'Alice',
  age: 31,
  email: 'alice@example.com',
  tags: ['admin', 'lead'],
  profile: { lang: 'zh', theme: 'dark' },
}, null, 2));

const error = ref('');

interface DiffEntry {
  path: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  before?: unknown;
  after?: unknown;
}

function diff(a: unknown, b: unknown, base = ''): DiffEntry[] {
  const out: DiffEntry[] = [];
  // 同基本类型
  if (a === b) {
    if (base) out.push({ path: base, type: 'unchanged', before: a, after: b });
    return out;
  }
  if (a === undefined) {
    out.push({ path: base, type: 'added', after: b });
    return out;
  }
  if (b === undefined) {
    out.push({ path: base, type: 'removed', before: a });
    return out;
  }
  // 类型不同或非对象 → changed
  const isObjA = typeof a === 'object' && a !== null && !Array.isArray(a);
  const isObjB = typeof b === 'object' && b !== null && !Array.isArray(b);
  if (Array.isArray(a) && Array.isArray(b)) {
    // 简单按 index diff
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      out.push(...diff(a[i], b[i], `${base}[${i}]`));
    }
    return out;
  }
  if (isObjA && isObjB) {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const k of keys) {
      const p = base ? `${base}.${k}` : k;
      out.push(...diff(ao[k], bo[k], p));
    }
    return out;
  }
  out.push({ path: base, type: 'changed', before: a, after: b });
  return out;
}

const entries = computed<DiffEntry[]>(() => {
  error.value = '';
  try {
    const a = JSON.parse(left.value);
    const b = JSON.parse(right.value);
    return diff(a, b).filter((e) => e.type !== 'unchanged');
  } catch (e) {
    error.value = 'JSON 解析失败：' + ((e as Error).message || String(e));
    return [];
  }
});

const stats = computed(() => {
  const s = { added: 0, removed: 0, changed: 0 };
  for (const e of entries.value) s[e.type as keyof typeof s]++;
  return s;
});

function fmt(v: unknown): string {
  if (v === undefined) return '—';
  return JSON.stringify(v);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">原 JSON (A)</label>
        <Textarea v-model="left" mono :rows="14" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">新 JSON (B)</label>
        <Textarea v-model="right" mono :rows="14" />
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <div v-else-if="entries.length === 0" class="rounded-md border border-dashed bg-card/40 p-6 text-center text-sm text-emerald-600">
      ✓ 两段 JSON 完全相同
    </div>

    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-1.5">
        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Plus :size="11" /> 新增 {{ stats.added }}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs text-destructive">
          <Minus :size="11" /> 删除 {{ stats.removed }}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
          <Pencil :size="11" /> 修改 {{ stats.changed }}
        </span>
      </div>

      <div class="overflow-x-auto rounded-lg border bg-card">
        <table class="w-full text-sm">
          <thead class="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th class="px-3 py-2 text-left w-16">类型</th>
              <th class="px-3 py-2 text-left">路径</th>
              <th class="px-3 py-2 text-left">原值 (A)</th>
              <th class="px-3 py-2 text-left">新值 (B)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in entries" :key="i" class="border-t border-border/60 hover:bg-secondary/30">
              <td class="px-3 py-1.5">
                <span :class="['inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
                  e.type === 'added' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  e.type === 'removed' ? 'bg-destructive/10 text-destructive' :
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400']">
                  {{ e.type === 'added' ? '+ 新增' : e.type === 'removed' ? '- 删除' : '~ 修改' }}
                </span>
              </td>
              <td class="px-3 py-1.5 font-mono text-xs text-foreground">{{ e.path }}</td>
              <td class="px-3 py-1.5 font-mono text-xs" :class="e.type === 'removed' || e.type === 'changed' ? 'text-destructive' : 'text-muted-foreground/50'">{{ fmt(e.before) }}</td>
              <td class="px-3 py-1.5 font-mono text-xs" :class="e.type === 'added' || e.type === 'changed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/50'">{{ fmt(e.after) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
