<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Upload, X } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'text' | 'file';
const mode = ref<Mode>('text');
const text = ref('Hello, WeTools');
const upper = ref(false);
const file = ref<File | null>(null);
const fileName = ref('');
const fileResults = ref<Record<string, string> | null>(null);
const computing = ref(false);

function buf2hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha(algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', data: ArrayBuffer | string) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const out = await crypto.subtle.digest(algo, buf);
  return buf2hex(out);
}

const md5Mod = ref<{ default: (s: string | Uint8Array | ArrayBuffer) => string } | null>(null);
async function ensureMd5() {
  if (!md5Mod.value) md5Mod.value = await import('js-md5');
  return md5Mod.value!.default;
}

const textResults = ref<Record<string, string>>({});

async function recompute() {
  if (mode.value !== 'text') return;
  const md5 = await ensureMd5();
  const r: Record<string, string> = {};
  r['MD5'] = md5(text.value);
  r['SHA-1'] = await sha('SHA-1', text.value);
  r['SHA-256'] = await sha('SHA-256', text.value);
  r['SHA-384'] = await sha('SHA-384', text.value);
  r['SHA-512'] = await sha('SHA-512', text.value);
  textResults.value = r;
}

watch([text, mode], recompute, { immediate: true });

async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  file.value = f;
  fileName.value = f.name;
  computing.value = true;
  try {
    const buf = await f.arrayBuffer();
    const md5 = await ensureMd5();
    const u8 = new Uint8Array(buf);
    fileResults.value = {
      MD5: md5(u8),
      'SHA-1': await sha('SHA-1', buf),
      'SHA-256': await sha('SHA-256', buf),
      'SHA-384': await sha('SHA-384', buf),
      'SHA-512': await sha('SHA-512', buf),
    };
  } finally {
    computing.value = false;
  }
}

function clearFile() {
  file.value = null;
  fileName.value = '';
  fileResults.value = null;
}

const display = computed(() => {
  const src = mode.value === 'text' ? textResults.value : (fileResults.value ?? {});
  if (!upper.value) return src;
  const out: Record<string, string> = {};
  for (const k in src) out[k] = src[k].toUpperCase();
  return out;
});

function fmtSize(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in [{v:'text',l:'文本'},{v:'file',l:'文件'}]" :key="m.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
        <input v-model="upper" type="checkbox" class="accent-[hsl(var(--primary))]" />大写输出
      </label>
    </div>

    <Textarea v-if="mode === 'text'" v-model="text" mono :rows="6" placeholder="输入要哈希的文本…" />

    <div v-else class="rounded-lg border-2 border-dashed bg-card/40 p-6 text-center">
      <input type="file" id="hash-file" class="hidden" @change="onFile" />
      <label for="hash-file" class="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm hover:border-primary/60 hover:text-primary">
        <Upload :size="14" />选择文件
      </label>
      <div v-if="fileName" class="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span class="font-mono">{{ fileName }}</span>
        <span v-if="file">· {{ fmtSize(file.size) }}</span>
        <button type="button" class="text-muted-foreground hover:text-destructive" @click="clearFile">
          <X :size="14" />
        </button>
      </div>
      <p v-if="computing" class="mt-3 text-xs text-muted-foreground">正在计算…（大文件会读入内存，仅在浏览器本地处理）</p>
    </div>

    <ul class="space-y-2">
      <li v-for="(v, k) in display" :key="k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-20 shrink-0 font-mono text-xs text-muted-foreground">{{ k }}</span>
        <span class="flex-1 break-all font-mono text-xs">{{ v || '—' }}</span>
        <CopyButton :text="String(v)" icon-only />
      </li>
    </ul>
  </div>
</template>
