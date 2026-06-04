<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Sep = ' ' | '' | '|';
const sep = ref<Sep>(' ');
const text = ref('Hello, WeTools');
const binary = ref('');
const error = ref('');

function textToBinary() {
  error.value = '';
  const bytes = new TextEncoder().encode(text.value);
  binary.value = Array.from(bytes).map((b) => b.toString(2).padStart(8, '0')).join(sep.value);
}

function binaryToText() {
  error.value = '';
  try {
    const cleaned = binary.value.replace(/[\s|]/g, '');
    if (!/^[01]+$/.test(cleaned)) throw new Error('只能包含 0 / 1 和分隔符');
    if (cleaned.length % 8 !== 0) throw new Error('总长度必须是 8 的倍数');
    const bytes = new Uint8Array(cleaned.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 8, i * 8 + 8), 2);
    }
    text.value = new TextDecoder().decode(bytes);
  } catch (e) {
    error.value = (e as Error).message;
  }
}

const seps: Array<{ k: Sep; l: string }> = [
  { k: ' ', l: '空格' },
  { k: '|', l: '竖线' },
  { k: '', l: '无' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-xs text-muted-foreground">字节间分隔：</span>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="s in seps" :key="s.k" type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium', sep === s.k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="sep = s.k"
        >{{ s.l }}</button>
      </div>
      <Button variant="primary" @click="textToBinary"><ArrowRight :size="14" />文本 → 二进制</Button>
      <Button variant="outline" @click="binaryToText"><ArrowLeft :size="14" />二进制 → 文本</Button>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">文本 (UTF-8)</label>
          <CopyButton :text="text" icon-only />
        </div>
        <Textarea v-model="text" mono :rows="10" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">二进制</label>
          <CopyButton :text="binary" icon-only />
        </div>
        <Textarea v-model="binary" mono :rows="10" />
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>
    <p class="text-xs text-muted-foreground">每个字节 8 bit，UTF-8 编码。中文字符通常占 3 个字节 = 24 bit。</p>
  </div>
</template>
