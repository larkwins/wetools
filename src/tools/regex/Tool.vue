<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const pattern = ref('\\b([A-Z][a-z]+)\\s+(\\w+)\\b');
const flags = ref('g');
const replacement = ref('$2 ($1)');
const text = ref(`Hello World, this is WeTools.
Made by Anthropic Engineers — for Developers.`);

const compiled = computed<{ regex?: RegExp; error?: string }>(() => {
  try {
    return { regex: new RegExp(pattern.value, flags.value) };
  } catch (e) {
    return { error: (e as Error).message };
  }
});

const matches = computed(() => {
  if (!compiled.value.regex || !text.value) return [];
  const r = new RegExp(pattern.value, flags.value.includes('g') ? flags.value : flags.value + 'g');
  const arr: { index: number; match: string; groups: string[] }[] = [];
  let m: RegExpExecArray | null;
  let safety = 0;
  while ((m = r.exec(text.value)) && safety++ < 10000) {
    arr.push({ index: m.index, match: m[0], groups: m.slice(1) });
    if (m[0].length === 0) r.lastIndex++;
  }
  return arr;
});

const highlighted = computed(() => {
  if (!matches.value.length) return text.value;
  let out = '';
  let cursor = 0;
  for (const m of matches.value) {
    out += escapeHtml(text.value.slice(cursor, m.index));
    out += `<mark class="rounded bg-primary/20 px-0.5 text-foreground ring-1 ring-primary/40">${escapeHtml(m.match)}</mark>`;
    cursor = m.index + m.match.length;
  }
  out += escapeHtml(text.value.slice(cursor));
  return out;
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}

const replaced = computed(() => {
  if (!compiled.value.regex) return '';
  try {
    return text.value.replace(compiled.value.regex, replacement.value);
  } catch (e) {
    return (e as Error).message;
  }
});

const cheatsheet: { token: string; desc: string }[] = [
  { token: '.', desc: '任意字符（不含换行）' },
  { token: '\\d / \\D', desc: '数字 / 非数字' },
  { token: '\\w / \\W', desc: '字母数字下划线 / 反之' },
  { token: '\\s / \\S', desc: '空白 / 非空白' },
  { token: '^ $', desc: '行首 / 行尾' },
  { token: '* + ? {n,m}', desc: '量词' },
  { token: '(...) (?:...)', desc: '捕获组 / 非捕获组' },
  { token: '(?<name>)', desc: '命名组' },
  { token: '(?=) (?!)', desc: '正/负向先行' },
  { token: '[abc] [^abc]', desc: '字符集' },
  { token: 'g i m s u y', desc: 'flags：全局/忽略大小写/多行/dotAll/unicode/sticky' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">正则表达式</label>
        <div class="flex items-center gap-2">
          <span class="font-mono text-muted-foreground">/</span>
          <Input v-model="pattern" class="flex-1 font-mono" />
          <span class="font-mono text-muted-foreground">/</span>
          <Input v-model="flags" class="w-20 font-mono" placeholder="gimsuy" />
        </div>
      </div>
    </div>

    <p v-if="compiled.error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ compiled.error }}
    </p>

    <div class="flex flex-col gap-2">
      <label class="text-[11px] uppercase tracking-wider text-muted-foreground">输入文本</label>
      <Textarea v-model="text" mono :rows="8" />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">
          匹配预览（{{ matches.length }} 项）
        </label>
        <div
          class="code-area min-h-[160px] whitespace-pre-wrap rounded-md border bg-card p-3 leading-7"
          v-html="highlighted"
        />
        <ul v-if="matches.length" class="space-y-1 text-xs">
          <li v-for="(m, i) in matches.slice(0, 20)" :key="i" class="rounded-md border bg-card px-3 py-1.5 font-mono">
            <span class="text-primary">#{{ i + 1 }}</span>
            <span class="ml-2 text-muted-foreground">@{{ m.index }}</span>
            <span class="ml-2">{{ m.match }}</span>
            <span v-if="m.groups.length" class="ml-2 text-muted-foreground">groups: [{{ m.groups.join(', ') }}]</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">替换</label>
        <Input v-model="replacement" class="font-mono" placeholder="替换字符串，支持 $1 $2 $<name>" />
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">替换结果</span>
          <CopyButton :text="replaced" icon-only />
        </div>
        <Textarea :model-value="replaced" mono :rows="8" readonly />
      </div>
    </div>

    <details class="rounded-lg border bg-card/40 p-3 text-xs">
      <summary class="cursor-pointer font-medium text-muted-foreground">速查表</summary>
      <ul class="mt-3 grid gap-2 sm:grid-cols-2">
        <li v-for="c in cheatsheet" :key="c.token" class="flex gap-2">
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{{ c.token }}</code>
          <span class="text-muted-foreground">{{ c.desc }}</span>
        </li>
      </ul>
    </details>
  </div>
</template>
