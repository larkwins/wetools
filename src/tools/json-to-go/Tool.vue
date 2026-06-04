<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const rootName = ref('Root');
const usePointer = ref(false);
const omitempty = ref(true);
const jsonText = ref(JSON.stringify({
  id: 1,
  name: 'Alice',
  email: 'a@a.com',
  active: true,
  score: 12.5,
  tags: ['admin', 'user'],
  profile: { age: 30, city: 'Shanghai' },
}, null, 2));
const error = ref('');

function toPascalCase(s: string): string {
  return s
    .replace(/[^A-Za-z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (m) => m.toUpperCase())
    .replace(/^[0-9]/, (m) => '_' + m);
}

function goTypeOf(v: unknown): string {
  if (v === null || v === undefined) return 'interface{}';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'number') return Number.isInteger(v) ? 'int64' : 'float64';
  if (typeof v === 'string') return 'string';
  return 'interface{}';
}

interface Generated {
  name: string;
  fields: Array<{ field: string; type: string; jsonKey: string }>;
}

/** 递归生成 struct 列表，返回主类型名 */
function generate(obj: unknown, name: string, structs: Generated[], seen: Set<string>): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]interface{}';
    // 推断元素类型；若元素是对象 → 递归生成子 struct
    const first = obj[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      const innerName = singularize(name);
      const inner = generate(first, innerName, structs, seen);
      return `[]${inner}`;
    }
    return `[]${goTypeOf(first)}`;
  }
  if (typeof obj !== 'object' || obj === null) {
    return goTypeOf(obj);
  }
  // object → struct
  const structName = ensureUnique(toPascalCase(name), seen);
  const fields: Generated['fields'] = [];
  for (const [k, v] of Object.entries(obj)) {
    const field = toPascalCase(k);
    let type: string;
    if (Array.isArray(v)) {
      type = generate(v, field, structs, seen);
    } else if (typeof v === 'object' && v !== null) {
      type = generate(v, field, structs, seen);
      if (usePointer.value) type = '*' + type;
    } else {
      type = goTypeOf(v);
    }
    fields.push({ field, type, jsonKey: k });
  }
  structs.push({ name: structName, fields });
  return structName;
}

function singularize(name: string): string {
  // 简单去复数：Tags → Tag, Items → Item, Children → Child（少量特例）
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y');
  if (/ses$/i.test(name)) return name.replace(/es$/i, '');
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.replace(/s$/i, '');
  return name;
}

function ensureUnique(name: string, seen: Set<string>): string {
  if (!seen.has(name)) {
    seen.add(name);
    return name;
  }
  let i = 2;
  while (seen.has(name + i)) i++;
  const next = name + i;
  seen.add(next);
  return next;
}

function renderStruct(s: Generated): string {
  // 计算对齐
  const maxField = Math.max(...s.fields.map((f) => f.field.length));
  const maxType = Math.max(...s.fields.map((f) => f.type.length));
  const lines = s.fields.map((f) => {
    const tag = omitempty.value
      ? `\`json:"${f.jsonKey},omitempty"\``
      : `\`json:"${f.jsonKey}"\``;
    return `\t${f.field.padEnd(maxField)} ${f.type.padEnd(maxType)} ${tag}`;
  });
  return `type ${s.name} struct {\n${lines.join('\n')}\n}`;
}

const goCode = ref('');
watchEffect(() => {
  try {
    const data = JSON.parse(jsonText.value);
    const structs: Generated[] = [];
    const seen = new Set<string>();
    const topName = toPascalCase(rootName.value || 'Root');
    let out: string;
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      generate(data, topName, structs, seen);
      out = structs.map(renderStruct).join('\n\n');
    } else if (Array.isArray(data)) {
      const inner = generate(data, topName, structs, seen);
      out = `${structs.map(renderStruct).join('\n\n')}\n\ntype ${topName}List ${inner}`;
    } else {
      out = `// 顶层不是对象或数组：${typeof data}`;
    }
    goCode.value = out;
    error.value = '';
  } catch (e) {
    error.value = (e as Error).message || String(e);
    goCode.value = '';
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">根 struct 名</label>
        <Input v-model="rootName" placeholder="Root" />
      </div>
      <label class="inline-flex cursor-pointer items-end gap-1.5 pb-2 text-sm text-muted-foreground">
        <input v-model="usePointer" type="checkbox" class="accent-[hsl(var(--primary))]" />嵌套用指针
      </label>
      <label class="inline-flex cursor-pointer items-end gap-1.5 pb-2 text-sm text-muted-foreground">
        <input v-model="omitempty" type="checkbox" class="accent-[hsl(var(--primary))]" />添加 omitempty
      </label>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">JSON 输入</label>
          <CopyButton :text="jsonText" icon-only />
        </div>
        <CodeEditor v-model="jsonText" lang="json" :rows="20" placeholder="粘贴 JSON…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">Go Struct</label>
          <CopyButton :text="goCode" icon-only />
        </div>
        <CodeEditor :model-value="goCode" lang="go" :rows="20" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      类型推断：整数 → int64，小数 → float64，对象数组取首元素结构，空数组退化为 []interface{}。
    </p>
  </div>
</template>
