<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import { format, type SqlLanguage } from 'sql-formatter';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type KeywordCase = 'upper' | 'lower' | 'preserve';

const dialect = ref<SqlLanguage>('sql');
const indent = ref(2);
const kwCase = ref<KeywordCase>('upper');
const input = ref(`select id, name, email from users u left join orders o on o.user_id = u.id where u.active = 1 and o.amount > 100 order by o.created_at desc limit 10;`);
const output = ref('');
const error = ref('');

const dialects: Array<{ v: SqlLanguage; l: string }> = [
  { v: 'sql', l: 'Standard SQL' },
  { v: 'mysql', l: 'MySQL' },
  { v: 'mariadb', l: 'MariaDB' },
  { v: 'postgresql', l: 'PostgreSQL' },
  { v: 'sqlite', l: 'SQLite' },
  { v: 'tsql', l: 'SQL Server' },
  { v: 'plsql', l: 'Oracle' },
  { v: 'bigquery', l: 'BigQuery' },
  { v: 'snowflake', l: 'Snowflake' },
  { v: 'redshift', l: 'Redshift' },
  { v: 'spark', l: 'Spark SQL' },
];

function doFormat() {
  error.value = '';
  try {
    output.value = format(input.value, {
      language: dialect.value,
      tabWidth: Math.max(0, Math.min(8, Number(indent.value) || 2)),
      keywordCase: kwCase.value,
    });
  } catch (e) {
    error.value = (e as Error).message || String(e);
  }
}

function minify() {
  error.value = '';
  try {
    // 用 sql-formatter 先 format，再剔除多余空白与换行
    const formatted = format(input.value, { language: dialect.value });
    output.value = formatted.replace(/\s+/g, ' ').replace(/\s*([(),;])\s*/g, '$1').trim();
  } catch (e) {
    error.value = (e as Error).message || String(e);
  }
}

function swap() {
  input.value = output.value || input.value;
  output.value = '';
}

watch([dialect, indent, kwCase], doFormat, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">方言</label>
        <select v-model="dialect" class="h-9 rounded-md border bg-background px-3 text-sm text-foreground hover:border-primary/40 focus:border-primary focus:outline-none">
          <option v-for="d in dialects" :key="d.v" :value="d.v">{{ d.l }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">关键字</label>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="c in (['upper', 'lower', 'preserve'] as KeywordCase[])" :key="c" type="button"
            :class="['h-9 rounded-sm px-3 text-xs font-medium', kwCase === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="kwCase = c"
          >{{ c === 'upper' ? '大写' : c === 'lower' ? '小写' : '保留' }}</button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">缩进</label>
        <input v-model.number="indent" type="number" min="0" max="8" class="h-9 w-20 rounded-md border bg-background px-3 text-sm text-foreground" />
      </div>
      <Button variant="primary" @click="doFormat">格式化</Button>
      <Button variant="outline" @click="minify">压缩</Button>
      <Button variant="ghost" @click="swap">交换输入/输出</Button>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor v-model="input" lang="sql" :rows="18" placeholder="粘贴 SQL…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor :model-value="output" lang="sql" :rows="18" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
