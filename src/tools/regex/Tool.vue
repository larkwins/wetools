<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
import { AlertCircle, Play, Hash } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

/* ---------- 常用正则预设 ---------- */
const PRESETS: { label: string; pattern: string; sample?: string }[] = [
  { label: '邮箱地址', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', sample: 'admin@example.com' },
  { label: '手机号（中国大陆）', pattern: '1[3-9]\\d{9}', sample: '13800138000' },
  { label: 'URL 链接', pattern: 'https?:\\/\\/[^\\s\'"<>]+', sample: 'https://wetools.cc' },
  { label: 'IPv4 地址', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', sample: '192.168.1.1' },
  { label: 'IPv6 地址', pattern: '[a-fA-F0-9:]+(?::[a-fA-F0-9:]*)+', sample: 'fe80::1' },
  { label: '日期 YYYY-MM-DD', pattern: '\\d{4}-\\d{2}-\\d{2}', sample: '2025-01-01' },
  { label: '时间 HH:mm:ss', pattern: '\\d{2}:\\d{2}:\\d{2}', sample: '12:34:56' },
  { label: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', sample: '你好世界' },
  { label: '整数', pattern: '-?\\d+', sample: '-42' },
  { label: '十进制数字', pattern: '-?\\d+(?:\\.\\d+)?', sample: '3.14' },
  { label: '十六进制颜色', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', sample: '#ff8800' },
  { label: '身份证号（中国大陆）', pattern: '\\d{17}[\\dXx]', sample: '110101199001011234' },
  { label: '邮政编码（中国大陆）', pattern: '[1-9]\\d{5}', sample: '518000' },
  { label: 'HTML 标签', pattern: '<\\/?[a-zA-Z][^>]*>', sample: '<div class="x">' },
  { label: '空白行', pattern: '^\\s*$', sample: '' },
  { label: 'UUID', pattern: '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b', sample: '123e4567-e89b-12d3-a456-426614174000' },
];

/* ---------- 状态 ---------- */
const pattern = ref('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
const flagGlobal = ref(true);
const flagIgnoreCase = ref(false);
const flagMultiline = ref(false);
const flagDotAll = ref(false);
const presetValue = ref('');

const text = ref(`联系信息：
  电话：13800138000 / 13912345678
  邮箱：alice@example.com、bob_smith@wetools.cc
  地址：192.168.1.1（内网）/ 8.8.8.8（外网）
  生日：1990-01-01
  网站：https://wetools.cc/regex
`);

const flags = computed(() => {
  let f = '';
  if (flagGlobal.value) f += 'g';
  if (flagIgnoreCase.value) f += 'i';
  if (flagMultiline.value) f += 'm';
  if (flagDotAll.value) f += 's';
  // u 默认不开（用户的字符类如 [\u4e00-\u9fa5] 在 u 模式下需要用 [\p{Script=Han}]）
  return f;
});

const compileError = computed<string | null>(() => {
  try {
    new RegExp(pattern.value, flags.value);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
});

interface MatchItem { index: number; match: string; groups: string[] }

const matches = ref<MatchItem[]>([]);
const runtimeError = ref('');
const busy = ref(false);

/* ---------- Web Worker：防止灾难性回溯卡死主线程 ---------- */
const WORKER_SRC = `
self.onmessage = (e) => {
  const { id, pattern, flags, text } = e.data;
  try {
    const matches = [];
    const r = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    let m, safety = 0;
    while ((m = r.exec(text)) && safety++ < 100000) {
      matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
      if (m[0].length === 0) r.lastIndex++;
    }
    self.postMessage({ id, ok: true, matches });
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
    const { id, ok, matches: ms, error } = e.data;
    if (id !== currentReqId) return;
    if (killTimer) { clearTimeout(killTimer); killTimer = null; }
    busy.value = false;
    if (ok) {
      matches.value = ms;
      runtimeError.value = '';
    } else {
      matches.value = [];
      runtimeError.value = error;
    }
  };
}

function killWorker() {
  if (worker) { worker.terminate(); worker = null; }
  if (workerUrl) { URL.revokeObjectURL(workerUrl); workerUrl = ''; }
}

function runRegex() {
  runtimeError.value = '';
  if (compileError.value) { matches.value = []; return; }
  if (!text.value || !pattern.value) { matches.value = []; return; }
  ensureWorker();
  if (!worker) return;
  currentReqId++;
  const id = currentReqId;
  busy.value = true;
  worker.postMessage({ id, pattern: pattern.value, flags: flags.value, text: text.value });
  if (killTimer) clearTimeout(killTimer);
  killTimer = setTimeout(() => {
    if (busy.value) {
      killWorker();
      busy.value = false;
      matches.value = [];
      runtimeError.value = '执行超时（>1s）— 表达式可能存在灾难性回溯，请简化后重试';
    }
  }, 1000);
}

onMounted(() => { ensureWorker(); runRegex(); });
onBeforeUnmount(() => {
  if (killTimer) clearTimeout(killTimer);
  killWorker();
});

// 输入变化自动触发，去抖 200ms
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([pattern, flags, text], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRegex, 200);
});

/* ---------- 选择预设 ---------- */
function applyPreset(idx: number) {
  const p = PRESETS[idx];
  if (!p) return;
  pattern.value = p.pattern;
  presetValue.value = String(idx);
}

/* ---------- 高亮匹配预览 ---------- */
const highlighted = computed(() => {
  const t = text.value;
  if (!matches.value.length || compileError.value) return escapeHtml(t);
  let out = '';
  let cursor = 0;
  for (const m of matches.value) {
    out += escapeHtml(t.slice(cursor, m.index));
    out += `<mark class="rounded bg-primary/25 px-0.5 text-foreground ring-1 ring-primary/40">${escapeHtml(m.match)}</mark>`;
    cursor = m.index + m.match.length;
  }
  out += escapeHtml(t.slice(cursor));
  return out;
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---------- 复制结果 ---------- */
const matchesAsText = computed(() => matches.value.map((m) => m.match).join('\n'));
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 1. 文本输入 -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">输入要匹配的文本</label>
        <CopyButton :text="text" icon-only />
      </div>
      <Textarea v-model="text" mono :rows="8" placeholder="粘贴或输入待匹配文本…" />
    </div>

    <!-- 2. 正则栏：输入 + 预设 + 开关 + 测试按钮 -->
    <div class="rounded-lg border bg-card/60 p-3">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
        <!-- 正则输入 -->
        <div class="flex flex-1 flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">正则表达式</label>
          <div class="flex items-center gap-1 font-mono">
            <span class="text-muted-foreground">/</span>
            <Input
              v-model="pattern"
              class="flex-1"
              placeholder="请输入正则表达式…"
              spellcheck="false"
            />
            <span class="text-muted-foreground">/</span>
            <span class="ml-1 inline-flex h-9 items-center rounded-md border bg-muted/40 px-2 text-xs text-muted-foreground">
              {{ flags || '—' }}
            </span>
          </div>
        </div>

        <!-- 预设下拉 -->
        <div class="flex flex-col gap-1.5 lg:w-56">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">常用正则表达式</label>
          <select
            v-model="presetValue"
            class="h-9 rounded-md border border-input bg-card px-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            @change="applyPreset(Number(presetValue))"
          >
            <option value="" disabled>选择预设…</option>
            <option v-for="(p, i) in PRESETS" :key="p.label" :value="i">{{ p.label }}</option>
          </select>
        </div>

        <!-- 测试按钮 -->
        <Button variant="primary" class="lg:self-end" @click="runRegex">
          <Play :size="14" />测试匹配
        </Button>
      </div>

      <!-- 选项开关 -->
      <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm select-none">
          <input v-model="flagGlobal" type="checkbox" class="size-4 accent-primary" />
          <span>全局搜索 <code class="ml-0.5 rounded bg-muted px-1 text-[11px]">g</code></span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm select-none">
          <input v-model="flagIgnoreCase" type="checkbox" class="size-4 accent-primary" />
          <span>忽略大小写 <code class="ml-0.5 rounded bg-muted px-1 text-[11px]">i</code></span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm select-none">
          <input v-model="flagMultiline" type="checkbox" class="size-4 accent-primary" />
          <span>多行 <code class="ml-0.5 rounded bg-muted px-1 text-[11px]">m</code></span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm select-none">
          <input v-model="flagDotAll" type="checkbox" class="size-4 accent-primary" />
          <span>点匹配换行 <code class="ml-0.5 rounded bg-muted px-1 text-[11px]">s</code></span>
        </label>
      </div>

      <!-- 错误提示 -->
      <p v-if="compileError" class="mt-2 flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />正则语法错误：{{ compileError }}
      </p>
      <p v-else-if="runtimeError" class="mt-2 flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ runtimeError }}
      </p>
    </div>

    <!-- 3. 匹配结果 -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">
          匹配结果（{{ matches.length }} 项{{ busy ? ' · 计算中…' : '' }}）
        </label>
        <CopyButton v-if="matches.length" :text="matchesAsText" icon-only />
      </div>

      <!-- 高亮预览 -->
      <div
        class="min-h-[120px] whitespace-pre-wrap break-words rounded-md border bg-card p-3 font-mono text-[13px] leading-[20px]"
        v-html="highlighted"
      />

      <!-- 匹配列表 -->
      <ul v-if="matches.length" class="grid gap-1.5 text-xs sm:grid-cols-2">
        <li
          v-for="(m, i) in matches.slice(0, 50)"
          :key="i"
          class="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 font-mono"
        >
          <Hash :size="11" class="flex-none text-primary/70" />
          <span class="text-primary">{{ i + 1 }}</span>
          <span class="text-muted-foreground">@{{ m.index }}</span>
          <span class="flex-1 truncate">{{ m.match }}</span>
          <span
            v-if="m.groups.length"
            class="text-muted-foreground"
            :title="m.groups.join(', ')"
          >组:{{ m.groups.length }}</span>
        </li>
        <li
          v-if="matches.length > 50"
          class="col-span-full text-center text-muted-foreground"
        >
          已显示前 50 项，共 {{ matches.length }} 项
        </li>
      </ul>
      <p v-else-if="!compileError && !busy && text" class="text-xs text-muted-foreground">
        无匹配结果
      </p>
    </div>

    <p class="text-xs text-muted-foreground">
      正则计算在 Web Worker 中执行，超过 1 秒会自动终止，避免恶意/复杂表达式卡死主线程。
    </p>
  </div>
</template>
