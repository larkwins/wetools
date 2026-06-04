<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeftRight, Trash2 } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const mode = ref<'encode' | 'decode'>('encode');
const onlyNonAscii = ref(true);
const input = ref('你好，WeTools 🎉');

function encode(s: string) {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (onlyNonAscii.value && cp < 0x80) {
      out += ch;
      continue;
    }
    if (cp <= 0xffff) {
      out += '\\u' + cp.toString(16).padStart(4, '0');
    } else {
      // 转代理对（4 字节）
      const high = 0xd800 + ((cp - 0x10000) >> 10);
      const low = 0xdc00 + ((cp - 0x10000) & 0x3ff);
      out += '\\u' + high.toString(16).padStart(4, '0');
      out += '\\u' + low.toString(16).padStart(4, '0');
    }
  }
  return out;
}

function decode(s: string) {
  return s
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

const output = computed(() => (mode.value === 'encode' ? encode(input.value) : decode(input.value)));

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
          v-for="m in [{v:'encode',l:'转义'},{v:'decode',l:'反转义'}]"
          :key="m.v"
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = m.v as 'encode' | 'decode'"
        >{{ m.l }}</button>
      </div>
      <label v-if="mode === 'encode'" class="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input v-model="onlyNonAscii" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />
        <span>仅转义非 ASCII 字符</span>
      </label>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
        <Button variant="ghost" size="sm" @click="input = ''"><Trash2 :size="14" />清空</Button>
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
      </div>
    </div>
  </div>
</template>
