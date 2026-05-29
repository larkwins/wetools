<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw, Trash2 } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Kind = 'uuid' | 'nanoid';
const kind = ref<Kind>('uuid');
const count = ref(8);
const noDash = ref(false);
const upper = ref(false);
const length = ref(21);
const alphabet = ref('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-');
const items = ref<string[]>([]);

function uuid() {
  // 优先 crypto.randomUUID（HTTPS / 现代浏览器）
  let s = (crypto as any).randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
  if (noDash.value) s = s.replace(/-/g, '');
  if (upper.value) s = s.toUpperCase();
  return s;
}

function nano(len: number) {
  const buf = crypto.getRandomValues(new Uint8Array(len));
  const ab = alphabet.value || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let out = '';
  for (let i = 0; i < len; i++) out += ab[buf[i] % ab.length];
  return out;
}

function generate() {
  const n = Math.max(1, Math.min(500, Number(count.value) || 1));
  const l = Math.max(1, Math.min(128, Number(length.value) || 1));
  const arr: string[] = [];
  for (let i = 0; i < n; i++) arr.push(kind.value === 'uuid' ? uuid() : nano(l));
  items.value = arr;
}

generate();

const text = computed(() => items.value.join('\n'));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="k in [{v:'uuid',l:'UUID v4'},{v:'nanoid',l:'NanoID'}]" :key="k.v" type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            kind === k.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="kind = k.v as Kind"
        >{{ k.l }}</button>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">数量</label>
        <Input v-model="count" type="number" class="w-24" />
      </div>

      <div v-if="kind === 'nanoid'" class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">长度</label>
        <Input v-model="length" type="number" class="w-24" />
      </div>

      <div v-if="kind === 'uuid'" class="flex items-center gap-3 self-end pb-2 text-sm text-muted-foreground">
        <label class="inline-flex cursor-pointer items-center gap-1.5">
          <input v-model="noDash" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />去掉短横
        </label>
        <label class="inline-flex cursor-pointer items-center gap-1.5">
          <input v-model="upper" type="checkbox" class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]" />大写
        </label>
      </div>

      <div class="ml-auto flex items-end gap-2 pb-0.5">
        <Button variant="primary" size="sm" @click="generate">
          <RefreshCw :size="14" />重新生成
        </Button>
        <Button variant="ghost" size="sm" @click="items = []">
          <Trash2 :size="14" />清空
        </Button>
      </div>
    </div>

    <div v-if="kind === 'nanoid'" class="flex flex-col gap-1.5">
      <label class="text-[11px] uppercase tracking-wider text-muted-foreground">字符集</label>
      <Input v-model="alphabet" />
    </div>

    <div class="flex items-center justify-between">
      <span class="text-xs text-muted-foreground">共生成 {{ items.length }} 条</span>
      <CopyButton :text="text" :label="`复制全部`" />
    </div>
    <Textarea :model-value="text" mono :rows="14" readonly />
  </div>
</template>
