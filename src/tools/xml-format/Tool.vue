<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import xmlFormatter from 'xml-formatter';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const indent = ref(2);
const input = ref(`<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>`);
const output = ref('');
const error = ref('');

function format() {
  error.value = '';
  try {
    output.value = xmlFormatter(input.value, {
      indentation: ' '.repeat(Math.max(0, Math.min(8, Number(indent.value) || 2))),
      collapseContent: true,
      lineSeparator: '\n',
    });
  } catch (e) {
    error.value = (e as Error).message || String(e);
  }
}

function minify() {
  error.value = '';
  try {
    output.value = xmlFormatter(input.value, {
      indentation: '',
      collapseContent: true,
      lineSeparator: '',
    });
  } catch (e) {
    error.value = (e as Error).message || String(e);
  }
}

function swap() {
  input.value = output.value || input.value;
  output.value = '';
}

watch([indent], format);
watch(input, format, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">缩进</label>
        <input v-model.number="indent" type="number" min="0" max="8" class="h-9 w-20 rounded-md border bg-background px-3 text-sm" />
      </div>
      <Button variant="primary" @click="format">格式化</Button>
      <Button variant="outline" @click="minify">压缩</Button>
      <Button variant="ghost" @click="swap">交换输入/输出</Button>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor v-model="input" lang="xml" :rows="18" placeholder="粘贴 XML…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor :model-value="output" lang="xml" :rows="18" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
