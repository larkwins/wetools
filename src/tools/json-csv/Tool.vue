<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { ArrowLeftRight, AlertCircle } from 'lucide-vue-next';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'j2c' | 'c2j';
const mode = ref<Mode>('j2c');
const sep = ref<',' | '\t' | ';' | '|'>(',');
const input = ref(`[
  { "id": 1, "name": "Alice", "city": "Beijing" },
  { "id": 2, "name": "Bob",   "city": "Shanghai" },
  { "id": 3, "name": "Cathy", "city": "Shenzhen" }
]`);
const error = ref<string | null>(null);

function csvEscape(v: unknown, s: string) {
  const str = v === null || v === undefined ? '' : String(v);
  if (str.includes(s) || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jsonToCsv(json: any[], s: string) {
  if (!Array.isArray(json)) throw new Error('期望对象数组（[{...}, ...]）');
  const cols = Array.from(json.reduce((set, row) => {
    if (row && typeof row === 'object') Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set<string>()));
  const lines = [cols.join(s)];
  for (const row of json) {
    lines.push(cols.map((c) => csvEscape(row?.[c], s)).join(s));
  }
  return lines.join('\n');
}

function csvToJson(text: string, s: string) {
  // 极简 CSV 解析（支持引号转义）
  const rows: string[][] = [];
  let cur = '', row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === s) { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); cur = ''; row = []; }
      else if (ch === '\r') { /* skip */ }
      else cur += ch;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.length && r.some((c) => c)).map((r) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = r[i] ?? '';
      // 数字识别
      if (/^-?\d+(\.\d+)?$/.test(v)) obj[h] = Number(v);
      else if (v === 'true' || v === 'false') obj[h] = v === 'true';
      else if (v === 'null') obj[h] = null;
      else obj[h] = v;
    });
    return obj;
  });
}

const output = ref('');
watchEffect(() => {
  if (!input.value.trim()) { output.value = ''; error.value = null; return; }
  try {
    output.value = mode.value === 'j2c'
      ? jsonToCsv(JSON.parse(input.value), sep.value)
      : JSON.stringify(csvToJson(input.value, sep.value), null, 2);
    error.value = null;
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
});

function swap() {
  mode.value = mode.value === 'j2c' ? 'c2j' : 'j2c';
  if (output.value) input.value = output.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in [{v:'j2c',l:'JSON → CSV'},{v:'c2j',l:'CSV → JSON'}]" :key="m.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>
      <div class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>分隔符</span>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="s in [{v:',',l:'逗号'},{v:'\t',l:'Tab'},{v:';',l:'分号'},{v:'|',l:'竖线'}]" :key="s.v" type="button"
            :class="['h-7 rounded-sm px-2 font-mono text-xs', sep === s.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="sep = s.v as ',' | '\t' | ';' | '|'"
          >{{ s.l }}</button>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">{{ mode === 'j2c' ? 'JSON' : 'CSV' }} 输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor v-model="input" :lang="mode === 'j2c' ? 'json' : 'text'" :rows="18" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">{{ mode === 'j2c' ? 'CSV' : 'JSON' }} 输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor :model-value="output" :lang="mode === 'j2c' ? 'text' : 'json'" :rows="18" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ error }}</p>
      </div>
    </div>
  </div>
</template>
