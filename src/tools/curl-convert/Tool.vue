<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { parseCurl, toFetch, toAxios, toNodeFetch } from './logic';

type Target = 'fetch' | 'axios' | 'nodeFetch';
const target = ref<Target>('fetch');

const input = ref(`curl -X POST 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer eyJ...' \\
  -d '{"name":"WeTools","tags":["dev"]}'`);

// 输出语言：当前 3 个 target 都是 JS 代码
const curlOutLang = computed(() => 'javascript' as const);

const result = computed(() => {
  if (!input.value.trim()) return { ok: false as const, error: '请输入 cURL 命令' };
  try {
    const p = parseCurl(input.value);
    if (!p.url) return { ok: false as const, error: '未找到 URL' };
    let code = '';
    if (target.value === 'fetch') code = toFetch(p);
    else if (target.value === 'axios') code = toAxios(p);
    else code = toNodeFetch(p);
    return { ok: true as const, code, parsed: p };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">cURL 命令</label>
      <CodeEditor v-model="input" lang="shell" :rows="8" />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="t in [{v:'fetch',l:'fetch'},{v:'axios',l:'axios'},{v:'nodeFetch',l:'node-fetch'}]" :key="t.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', target === t.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="target = t.v as Target"
        >{{ t.l }}</button>
      </div>
    </div>

    <p v-if="!result.ok" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ result.error }}
    </p>

    <template v-if="result.ok">
      <div class="flex items-center justify-between">
        <span class="tool-section-title">{{ target }} 代码</span>
        <CopyButton :text="result.code" />
      </div>
      <CodeEditor :model-value="result.code" :lang="curlOutLang" :rows="14" readonly />

      <details class="rounded-lg border bg-card/40 p-3 text-xs">
        <summary class="cursor-pointer font-medium text-muted-foreground">解析结果</summary>
        <pre class="mt-2 overflow-x-auto font-mono">{{ JSON.stringify(result.parsed, null, 2) }}</pre>
      </details>
    </template>
  </div>
</template>
