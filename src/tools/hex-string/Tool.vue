<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { ArrowLeftRight, Trash2, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const mode = ref<'toHex' | 'fromHex'>('toHex');
const upper = ref(false);
const sep = ref<' ' | '' | ','>(' ');
const input = ref('Hello, WeTools 👋');
const error = ref<string | null>(null);

function strToHex(s: string) {
  const bytes = new TextEncoder().encode(s);
  const arr: string[] = [];
  for (const b of bytes) arr.push(b.toString(16).padStart(2, '0'));
  let res = arr.join(sep.value);
  if (upper.value) res = res.toUpperCase();
  return res;
}

function hexToStr(s: string) {
  const clean = s.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) throw new Error('Hex 长度不是偶数');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

const output = ref('');
watchEffect(() => {
  if (!input.value) { output.value = ''; error.value = null; return; }
  try {
    output.value = mode.value === 'toHex' ? strToHex(input.value) : hexToStr(input.value);
    error.value = null;
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
});

function swap() {
  mode.value = mode.value === 'toHex' ? 'fromHex' : 'toHex';
  input.value = output.value || input.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="m in [{v:'toHex',l:'字符串 → Hex'},{v:'fromHex',l:'Hex → 字符串'}]"
          :key="m.v"
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = m.v as 'toHex' | 'fromHex'"
        >{{ m.l }}</button>
      </div>

      <div v-if="mode === 'toHex'" class="flex items-center gap-3 text-sm text-muted-foreground">
        <label class="inline-flex cursor-pointer items-center gap-1.5">
          <input v-model="upper" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />
          大写
        </label>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button
            v-for="s in [{v:' ',l:'空格'},{v:'',l:'连续'},{v:',',l:'逗号'}]"
            :key="s.v"
            type="button"
            :class="[
              'h-7 rounded-sm px-2 text-xs transition-colors',
              sep === s.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="sep = s.v as ' ' | '' | ','"
          >{{ s.l }}</button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
        <Button variant="ghost" size="sm" @click="input = ''"><Trash2 :size="14" />清空</Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="14" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">输出</label>
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
