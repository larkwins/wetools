<script setup lang="ts">
import { ref, computed } from 'vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref('helloWorldFromWeTools 你好 wetools');

function tokenize(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-./]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function toCamel(t: string[]) {
  return t.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
}
function toPascal(t: string[]) {
  return t.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}
function toKebab(t: string[]) {
  return t.join('-');
}
function toSnake(t: string[]) {
  return t.join('_');
}
function toConst(t: string[]) {
  return t.join('_').toUpperCase();
}
function toTitle(t: string[]) {
  return t.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function toSentence(t: string[]) {
  if (t.length === 0) return '';
  const all = t.join(' ');
  return all.charAt(0).toUpperCase() + all.slice(1);
}
function toDot(t: string[]) {
  return t.join('.');
}
function toPath(t: string[]) {
  return t.join('/');
}

const tokens = computed(() => tokenize(input.value));

const items = computed(() => [
  { label: 'camelCase', value: toCamel(tokens.value) },
  { label: 'PascalCase', value: toPascal(tokens.value) },
  { label: 'snake_case', value: toSnake(tokens.value) },
  { label: 'kebab-case', value: toKebab(tokens.value) },
  { label: 'CONSTANT_CASE', value: toConst(tokens.value) },
  { label: 'Title Case', value: toTitle(tokens.value) },
  { label: 'Sentence case', value: toSentence(tokens.value) },
  { label: 'dot.case', value: toDot(tokens.value) },
  { label: 'path/case', value: toPath(tokens.value) },
  { label: 'UPPERCASE', value: input.value.toUpperCase() },
  { label: 'lowercase', value: input.value.toLowerCase() },
]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">输入</label>
      <Textarea v-model="input" mono :rows="5" placeholder="输入任意标识符或短语…" />
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <div v-for="i in items" :key="i.label" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-32 shrink-0 font-mono text-xs text-muted-foreground">{{ i.label }}</span>
        <span class="flex-1 truncate font-mono text-sm">{{ i.value || '—' }}</span>
        <CopyButton :text="i.value" icon-only />
      </div>
    </div>
  </div>
</template>
