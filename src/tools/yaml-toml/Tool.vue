<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeftRight, AlertCircle } from 'lucide-vue-next';
// 注：@iarna/toml 是 CJS 包，Vite optimizeDeps 把它包成 default-only 的 ESM，
// 所以必须用 default import：`TOML.parse` / `TOML.stringify` 才是函数。
// 用 `import * as` 反而拿到 `{ default: { parse, stringify } }`，调用时 undefined。
import TOML from '@iarna/toml';
import jsYaml from 'js-yaml';
import CodeEditor from '@/components/ui/CodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'y2t' | 't2y';
const mode = ref<Mode>('y2t');

const input = ref(`title: WeTools
owner:
  name: Alice
database:
  server: 192.168.1.1
  ports:
    - 8001
    - 8002
  enabled: true
`);

const error = ref<string | null>(null);

const output = computed(() => {
  error.value = null;
  if (!input.value.trim()) return '';
  try {
    if (mode.value === 'y2t') {
      const parsed = jsYaml.load(input.value);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('TOML 顶层必须是对象');
      }
      return TOML.stringify(parsed);
    } else {
      const parsed = TOML.parse(input.value);
      return jsYaml.dump(parsed);
    }
  } catch (e) {
    error.value = (e as Error).message;
    return '';
  }
});

function swap() {
  mode.value = mode.value === 'y2t' ? 't2y' : 'y2t';
  if (output.value) input.value = output.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="m in [{ v: 'y2t', l: 'YAML → TOML' }, { v: 't2y', l: 'TOML → YAML' }]"
          :key="m.v"
          type="button"
          :class="['h-8 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>
      <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {{ mode === 'y2t' ? 'YAML' : 'TOML' }} 输入
          </label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor
          v-model="input"
          :lang="mode === 'y2t' ? 'yaml' : 'toml'"
          :rows="20"
          :placeholder="mode === 'y2t' ? '粘贴 YAML…' : '粘贴 TOML…'"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {{ mode === 'y2t' ? 'TOML' : 'YAML' }} 输出
          </label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor
          :model-value="output"
          :lang="mode === 'y2t' ? 'toml' : 'yaml'"
          :rows="20"
          readonly
        />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
