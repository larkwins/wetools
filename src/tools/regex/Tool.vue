<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const pattern = ref('\\b([A-Z][a-z]+)\\s+(\\w+)\\b');
const flags = ref('g');
const replacement = ref('$2 ($1)');
const text = ref(`Hello World, this is WeTools.
Made by Anthropic Engineers — for Developers.`);

// 仅做语法校验（new RegExp 本身是 O(pattern.length)，不会卡死）
const compiled = computed<{ regex?: RegExp; error?: string }>(() => {
  try {
    return { regex: new RegExp(pattern.value, flags.value) };
  } catch (e) {
    return { error: (e as Error).message };
  }
});

interface MatchItem { index: number; match: string; groups: string[] }

const matches = ref<MatchItem[]>([]);
const replaced = ref('');
const runtimeError = ref('');
const busy = ref(false);

// —— Web Worker：把 regex.exec / replace 跑到 worker 里，超时 1s 自动 terminate，
//     防止 catastrophic backtracking 卡死主线程
const WORKER_SRC = `
self.onmessage = (e) => {
  const { id, pattern, flags, text, replacement } = e.data;
  try {
    const matches = [];
    const r = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    let m;
    let safety = 0;
    while ((m = r.exec(text)) && safety++ < 10000) {
      matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
      if (m[0].length === 0) r.lastIndex++;
    }
    let replaced = '';
    try {
      replaced = text.replace(new RegExp(pattern, flags), replacement);
    } catch (er) {
      replaced = '[replace error] ' + (er && er.message || String(er));
    }
    self.postMessage({ id, ok: true, matches, replaced });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err && err.message || String(err) });
  }
};
`;

let worker: Worker | null = null;
let workerUrl = '';
let killTimer: ReturnType<typeof setTimeout> | null = null;
let currentReqId = 0;

function ensureWorker() {
  if (worker || typeof window === 'undefined') return;
  workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'application/javascript' }));
  worker = new Worker(workerUrl);
  worker.onmessage = (e) => {
    const { id, ok, matches: ms, replaced: rp, error } = e.data;
    if (id !== currentReqId) return; // 过期响应
    if (killTimer) { clearTimeout(killTimer); killTimer = null; }
    busy.value = false;
    if (ok) {
      matches.value = ms;
      replaced.value = rp;
      runtimeError.value = '';
    } else {
      matches.value = [];
      replaced.value = '';
      runtimeError.value = error;
    }
  };
}

function killWorker() {
  if (worker) { worker.terminate(); worker = null; }
  if (workerUrl) { URL.revokeObjectURL(workerUrl); workerUrl = ''; }
}

function runRegex() {
  // 语法错误直接停（不进 worker）
  if (compiled.value.error) {
    matches.value = [];
    replaced.value = '';
    runtimeError.value = '';
    busy.value = false;
    return;
  }
  if (!text.value) {
    matches.value = [];
    replaced.value = '';
    runtimeError.value = '';
    busy.value = false;
    return;
  }
  ensureWorker();
  if (!worker) return;
  currentReqId++;
  const id = currentReqId;
  busy.value = true;
  runtimeError.value = '';
  worker.postMessage({
    id,
    pattern: pattern.value,
    flags: flags.value,
    text: text.value,
    replacement: replacement.value,
  });
  // 1s 看门狗：可能 catastrophic backtracking，杀 worker 并提示
  if (killTimer) clearTimeout(killTimer);
  killTimer = setTimeout(() => {
    if (busy.value) {
      killWorker();
      busy.value = false;
      matches.value = [];
      replaced.value = '';
      runtimeError.value = '执行超时（>1s）— 表达式可能存在灾难性回溯，请简化后重试';
    }
  }, 1000);
}

onMounted(() => {
  ensureWorker();
  runRegex();
});
onBeforeUnmount(() => {
  if (killTimer) clearTimeout(killTimer);
  killWorker();
});

// 任意输入变化都重跑（去抖 100ms，避免输入卡）
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([pattern, flags, text, replacement], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRegex, 100);
});

const highlighted = computed(() => {
  if (!matches.value.length) return escapeHtml(text.value);
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
    <p v-else-if="runtimeError" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ runtimeError }}
    </p>

    <div class="flex flex-col gap-2">
      <label class="text-[11px] uppercase tracking-wider text-muted-foreground">输入文本</label>
      <Textarea v-model="text" mono :rows="8" />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">
          匹配预览（{{ matches.length }} 项{{ busy ? ' · 计算中…' : '' }}）
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

    <p class="text-xs text-muted-foreground">
      正则计算在 Web Worker 中执行，超过 1 秒会自动终止，避免恶意/复杂表达式卡死浏览器主线程。
    </p>
  </div>
</template>
