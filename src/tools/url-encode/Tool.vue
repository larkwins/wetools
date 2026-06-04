<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { ArrowLeftRight, Trash2, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const mode = ref<'encode' | 'decode'>('encode');
const fullUri = ref(false);
const input = ref('https://example.com/搜索?q=hello world&lang=zh');
const error = ref<string | null>(null);

const output = ref('');
watchEffect(() => {
  if (!input.value) { output.value = ''; error.value = null; return; }
  try {
    if (mode.value === 'encode') {
      output.value = fullUri.value ? encodeURI(input.value) : encodeURIComponent(input.value);
    } else {
      output.value = fullUri.value ? decodeURI(input.value) : decodeURIComponent(input.value);
    }
    error.value = null;
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
});

function swap() {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  input.value = output.value || input.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="m in [{v:'encode',l:'编码'},{v:'decode',l:'解码'}]"
          :key="m.v"
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = m.v as 'encode' | 'decode'"
        >{{ m.l }}</button>
      </div>
      <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input v-model="fullUri" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />
        <span>整段 URI（保留 / : ? = & 等）</span>
      </label>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="swap">
          <ArrowLeftRight :size="14" />交换
        </Button>
        <Button variant="ghost" size="sm" @click="input = ''">
          <Trash2 :size="14" />清空
        </Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="14" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" mono :rows="14" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
