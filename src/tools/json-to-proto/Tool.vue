<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/CodeEditor.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const rootName = ref('Root');
const packageName = ref('demo');
const jsonText = ref(JSON.stringify({
  id: 1,
  name: 'Alice',
  active: true,
  score: 12.5,
  tags: ['admin', 'user'],
  profile: { age: 30, city: 'Shanghai' },
}, null, 2));
const error = ref('');

function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/^(.)/, (m) => m.toUpperCase()).replace(/^[0-9]/, (m) => '_' + m);
}
function toSnake(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
}

function protoTypeOf(v: unknown): string {
  if (v === null || v === undefined) return 'string';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v < 0 ? 'int64' : 'int64';
    return 'double';
  }
  if (typeof v === 'string') return 'string';
  return 'string';
}

interface Msg {
  name: string;
  fields: Array<{ name: string; type: string; repeated: boolean; tag: number }>;
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y');
  if (/ses$/i.test(name)) return name.replace(/es$/i, '');
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.replace(/s$/i, '');
  return name;
}
function ensureUnique(name: string, seen: Set<string>): string {
  if (!seen.has(name)) { seen.add(name); return name; }
  let i = 2;
  while (seen.has(name + i)) i++;
  const next = name + i;
  seen.add(next);
  return next;
}

function build(obj: unknown, name: string, msgs: Msg[], seen: Set<string>): { type: string; repeated: boolean } {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return { type: 'string', repeated: true };
    const first = obj[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      const inner = ensureUnique(toPascal(singularize(name)), seen);
      buildObj(first as Record<string, unknown>, inner, msgs, seen);
      return { type: inner, repeated: true };
    }
    return { type: protoTypeOf(first), repeated: true };
  }
  if (typeof obj === 'object' && obj !== null) {
    const inner = ensureUnique(toPascal(name), seen);
    buildObj(obj as Record<string, unknown>, inner, msgs, seen);
    return { type: inner, repeated: false };
  }
  return { type: protoTypeOf(obj), repeated: false };
}

function buildObj(obj: Record<string, unknown>, name: string, msgs: Msg[], seen: Set<string>): void {
  const fields: Msg['fields'] = [];
  let tag = 1;
  for (const [k, v] of Object.entries(obj)) {
    const r = build(v, k, msgs, seen);
    fields.push({ name: toSnake(k), type: r.type, repeated: r.repeated, tag: tag++ });
  }
  msgs.push({ name, fields });
}

function renderMsg(m: Msg): string {
  const lines = m.fields.map((f) =>
    `  ${f.repeated ? 'repeated ' : ''}${f.type} ${f.name} = ${f.tag};`
  );
  return `message ${m.name} {\n${lines.join('\n')}\n}`;
}

const proto = ref('');
watchEffect(() => {
  try {
    const data = JSON.parse(jsonText.value);
    const msgs: Msg[] = [];
    const seen = new Set<string>();
    let out: string;
    if (Array.isArray(data)) {
      const r = build(data, rootName.value, msgs, seen);
      const wrap: Msg = { name: ensureUnique(toPascal(rootName.value), seen), fields: [{ name: 'items', type: r.type, repeated: true, tag: 1 }] };
      msgs.push(wrap);
      const pkg = packageName.value ? `package ${packageName.value};\n\n` : '';
      out = `syntax = "proto3";\n\n${pkg}${msgs.map(renderMsg).join('\n\n')}`;
    } else if (typeof data === 'object' && data !== null) {
      buildObj(data as Record<string, unknown>, ensureUnique(toPascal(rootName.value), seen), msgs, seen);
      const pkg = packageName.value ? `package ${packageName.value};\n\n` : '';
      out = `syntax = "proto3";\n\n${pkg}${msgs.map(renderMsg).join('\n\n')}`;
    } else {
      out = `// 顶层不是对象或数组：${typeof data}`;
    }
    proto.value = out;
    error.value = '';
  } catch (e) {
    error.value = (e as Error).message || String(e);
    proto.value = '';
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">package</label>
        <Input v-model="packageName" placeholder="demo" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">根 message 名</label>
        <Input v-model="rootName" placeholder="Root" />
      </div>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">JSON 输入</label>
          <CopyButton :text="jsonText" icon-only />
        </div>
        <CodeEditor v-model="jsonText" lang="json" :rows="20" placeholder="粘贴 JSON…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Protobuf 3</label>
          <CopyButton :text="proto" icon-only />
        </div>
        <CodeEditor :model-value="proto" lang="proto" :rows="20" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      类型映射：整数 → int64，小数 → double，对象数组取首元素结构。字段名自动转 snake_case，tag 顺序生成。
    </p>
  </div>
</template>
