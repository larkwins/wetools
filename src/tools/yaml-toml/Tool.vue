<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-vue-next';
import TOML from '@iarna/toml';
import jsYaml from 'js-yaml';
import CodeEditor from '@/components/ui/CodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const yamlText = ref(`title: WeTools
owner:
  name: Alice
database:
  server: 192.168.1.1
  ports:
    - 8001
    - 8002
  enabled: true
`);
const tomlText = ref('');
const error = ref('');

function yamlToToml() {
  error.value = '';
  try {
    const parsed = jsYaml.load(yamlText.value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('TOML 顶层必须是对象');
    }
    tomlText.value = TOML.stringify(parsed as TOML.JsonMap);
  } catch (e) {
    error.value = 'YAML → TOML 失败：' + ((e as Error).message || String(e));
  }
}

function tomlToYaml() {
  error.value = '';
  try {
    const parsed = TOML.parse(tomlText.value);
    yamlText.value = jsYaml.dump(parsed);
  } catch (e) {
    error.value = 'TOML → YAML 失败：' + ((e as Error).message || String(e));
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="primary" @click="yamlToToml"><ArrowRight :size="14" />YAML → TOML</Button>
      <Button variant="outline" @click="tomlToYaml"><ArrowLeft :size="14" />TOML → YAML</Button>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">YAML</label>
          <CopyButton :text="yamlText" icon-only />
        </div>
        <CodeEditor v-model="yamlText" lang="yaml" :rows="18" placeholder="粘贴 YAML…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">TOML</label>
          <CopyButton :text="tomlText" icon-only />
        </div>
        <CodeEditor v-model="tomlText" lang="toml" :rows="18" placeholder="粘贴 TOML…" />
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>
  </div>
</template>
