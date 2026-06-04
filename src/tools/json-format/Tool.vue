<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { Sparkles, Minimize2, Quote, Trash2, AlertCircle } from 'lucide-vue-next';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'beautify' | 'minify' | 'escape';

const mode = ref<Mode>('beautify');
const indent = ref<2 | 4>(2);
const input = ref(`{"name":"WeTools","version":"0.1.0","tags":["dev","tools"],"meta":{"private":true}}`);
const error = ref<{ msg: string; line?: number; col?: number } | null>(null);

function parsePosition(msg: string, src: string): { line?: number; col?: number } {
  // V8: "Unexpected token X in JSON at position 42"
  const m = /position\s+(\d+)/i.exec(msg);
  if (!m) return {};
  const pos = Number(m[1]);
  const before = src.slice(0, pos);
  const line = before.split('\n').length;
  const col = pos - before.lastIndexOf('\n');
  return { line, col };
}

// 用 watchEffect 计算 output + error，避免在 computed 内做副作用
const output = ref('');
watchEffect(() => {
  if (!input.value.trim()) {
    output.value = '';
    error.value = null;
    return;
  }
  try {
    const obj = JSON.parse(input.value);
    if (mode.value === 'minify') output.value = JSON.stringify(obj);
    else if (mode.value === 'escape') output.value = JSON.stringify(JSON.stringify(obj, null, indent.value));
    else output.value = JSON.stringify(obj, null, indent.value);
    error.value = null;
  } catch (e) {
    const msg = (e as Error).message;
    const pos = parsePosition(msg, input.value);
    error.value = { msg, ...pos };
    output.value = '';
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in [{v:'beautify',l:'美化',Ico:Sparkles},{v:'minify',l:'压缩',Ico:Minimize2},{v:'escape',l:'转义字符串',Ico:Quote}]" :key="m.v" type="button"
          :class="[
            'inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm transition-colors',
            mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = m.v as Mode"
        >
          <component :is="m.Ico" :size="14" />{{ m.l }}
        </button>
      </div>

      <div v-if="mode === 'beautify'" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>缩进</span>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="n in [2,4]" :key="n" type="button"
            :class="['h-7 rounded-sm px-2 font-mono text-xs', indent === n ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="indent = n as 2 | 4"
          >{{ n }}</button>
        </div>
      </div>

      <Button variant="ghost" size="sm" @click="input = ''"><Trash2 :size="14" />清空</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">JSON 输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor v-model="input" lang="json" :rows="20" placeholder="粘贴 JSON…" />
        <div v-if="error" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
          <p class="flex items-center gap-1.5 font-medium text-destructive">
            <AlertCircle :size="12" />解析失败
          </p>
          <p class="mt-1 break-all text-destructive/90">{{ error.msg }}</p>
          <p v-if="error.line" class="mt-1 font-mono text-muted-foreground">
            位置：第 {{ error.line }} 行，第 {{ error.col }} 列
          </p>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <!-- escape 模式输出的是 JSON 字符串字面量（外层是字符串），按 text 高亮更合理 -->
        <CodeEditor :model-value="output" :lang="mode === 'escape' ? 'text' : 'json'" :rows="20" readonly />
      </div>
    </div>
  </div>
</template>
