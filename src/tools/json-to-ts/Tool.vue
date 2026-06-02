<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import JsonToTS from 'json-to-ts';

const root = ref('Root');
const input = ref(`{
  "name": "WeTools",
  "version": "0.1.0",
  "tools": [
    { "id": "base64", "tags": ["hot"] },
    { "id": "json-format" }
  ],
  "config": { "private": true, "mirror": null }
}`);

const error = ref<string | null>(null);

const output = ref('');
watchEffect(() => {
  if (!input.value.trim()) { output.value = ''; error.value = null; return; }
  try {
    const obj = JSON.parse(input.value);
    output.value = JsonToTS(obj, { rootName: root.value || 'Root' }).join('\n\n');
    error.value = null;
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] uppercase tracking-wider text-muted-foreground">根接口名</label>
      <Input v-model="root" class="max-w-xs font-mono" />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">JSON</label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor v-model="input" lang="json" :rows="20" />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ error }}</p>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">TypeScript</label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor :model-value="output" lang="typescript" :rows="20" readonly />
      </div>
    </div>
  </div>
</template>
