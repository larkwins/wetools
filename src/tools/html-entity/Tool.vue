<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeftRight, Trash2 } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const mode = ref<'encode' | 'decode'>('encode');
const named = ref(true);
const input = ref('<p class="x">Tom & Jerry — "best" friends</p>');

const NAMED: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
];

function encode(s: string) {
  if (named.value) {
    return NAMED.reduce((acc, [re, ent]) => acc.replace(re, ent), s);
  }
  // 数字实体：所有 > 0x7e 字符或 < 0x20 控制字符 + 5 个核心
  return Array.from(s)
    .map((ch) => {
      const c = ch.codePointAt(0)!;
      if (ch === '&' || ch === '<' || ch === '>' || ch === '"' || ch === "'" || c > 126 || c < 32) {
        return `&#${c};`;
      }
      return ch;
    })
    .join('');
}

function decode(s: string) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, '\u00a0');
}

const output = computed(() => (mode.value === 'encode' ? encode(input.value) : decode(input.value)));

function swap() {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  input.value = output.value || input.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="m in [{v:'encode',l:'转义'},{v:'decode',l:'反转义'}]"
          :key="m.v"
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = m.v as 'encode' | 'decode'"
        >{{ m.l }}</button>
      </div>
      <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input v-model="named" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />
        <span>使用命名实体（&amp;amp; / &amp;lt; …）</span>
      </label>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
        <Button variant="ghost" size="sm" @click="input = ''"><Trash2 :size="14" />清空</Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="14" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" mono :rows="14" readonly />
      </div>
    </div>
  </div>
</template>
