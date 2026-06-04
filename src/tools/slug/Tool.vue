<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref('Hello, WeTools 你好世界! / Astro & Vue 3 — 2026');
const sep = ref('-');
const lower = ref(true);

function slugify(s: string, separator: string, toLower: boolean): string {
  if (!s) return '';
  // 1) Unicode 标准化分解，便于去重音符
  let r = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // 2) 去掉 emoji 和不可打印
  r = r.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/[\u{2600}-\u{27BF}]/gu, '');
  // 3) 中日韩字符尝试做轻量处理：直接保留（slug 工具不内置音译表，太重）
  //    若包含 CJK，会被替换为分隔符再合并 —— 让 slug 仍可用
  // 4) 把任何非字母数字/CJK/横线 替换为分隔符占位
  r = r.replace(/[^a-zA-Z0-9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af-]+/g, ' ');
  // 5) 去首尾空白；连续空白合并为单个分隔符
  r = r.trim().replace(/\s+/g, separator);
  // 6) 折叠多个分隔符
  if (separator) {
    const re = new RegExp(`\\${separator}+`, 'g');
    r = r.replace(re, separator);
    // 去掉首尾分隔符
    const trimRe = new RegExp(`^\\${separator}|\\${separator}$`, 'g');
    r = r.replace(trimRe, '');
  }
  if (toLower) r = r.toLowerCase();
  return r;
}

const result = computed(() => slugify(input.value, sep.value, lower.value));

const presets: Array<{ label: string; v: string }> = [
  { label: '横线 (kebab)', v: '-' },
  { label: '下划线 (snake)', v: '_' },
  { label: '点号', v: '.' },
  { label: '无分隔', v: '' },
];

const examples = [
  'Hello World!',
  '你好 世界',
  'CamelCaseExample',
  '  multi   spaces  ',
  'résumé—naïve façade',
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">原文</label>
      <Input v-model="input" placeholder="输入文本…" />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-muted-foreground">分隔符：</span>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="p in presets" :key="p.label" type="button"
            :class="['h-8 rounded-sm px-2.5 text-[11px] font-medium', sep === p.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="sep = p.v"
          >{{ p.label }}</button>
        </div>
      </div>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="lower" type="checkbox" class="accent-[hsl(var(--primary))]" />转小写
      </label>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">Slug 结果</label>
        <CopyButton :text="result" icon-only />
      </div>
      <div class="break-all rounded-md border bg-card px-3 py-3 font-mono text-base text-primary">{{ result || '—' }}</div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="tool-section-title">示例</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="e in examples" :key="e" type="button"
          class="rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="input = e"
        >{{ e }}</button>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      规则：去除变音符号 / 标点 / emoji，CJK 字符原样保留（适合中文 URL）。如需音译为拼音可在后端单独处理。
    </p>
  </div>
</template>
