<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const length = ref(20);
const count = ref(5);
const useUpper = ref(true);
const useLower = ref(true);
const useDigit = ref(true);
const useSymbol = ref(true);
const exclude = ref(true); // 排除易混 0O1lI

const items = ref<string[]>([]);

function generate() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digit = '0123456789';
  const symbol = '!@#$%^&*()-_=+[]{};:,.<>/?~';
  let pool = '';
  if (useUpper.value) pool += upper;
  if (useLower.value) pool += lower;
  if (useDigit.value) pool += digit;
  if (useSymbol.value) pool += symbol;
  if (exclude.value) pool = pool.replace(/[0Oo1lI|]/g, '');
  if (!pool) {
    items.value = ['请至少选择一种字符集'];
    return;
  }
  const len = Math.max(4, Math.min(128, Number(length.value) || 16));
  const n = Math.max(1, Math.min(50, Number(count.value) || 1));
  const arr: string[] = [];
  for (let i = 0; i < n; i++) {
    const buf = crypto.getRandomValues(new Uint8Array(len));
    let s = '';
    for (let j = 0; j < len; j++) s += pool[buf[j] % pool.length];
    arr.push(s);
  }
  items.value = arr;
}

generate();

const text = computed(() => items.value.join('\n'));

function strength(p: string) {
  let s = 0;
  if (/[a-z]/.test(p)) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length >= 16) s++;
  return Math.min(5, s);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <section class="space-y-4 rounded-lg border bg-card p-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">长度</label>
            <Input v-model="length" type="number" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">数量</label>
            <Input v-model="count" type="number" />
          </div>
        </div>
        <div class="flex flex-col gap-2 text-sm">
          <label class="inline-flex cursor-pointer items-center gap-2"><input v-model="useUpper" type="checkbox" class="accent-[hsl(var(--primary))]" />大写字母 A-Z</label>
          <label class="inline-flex cursor-pointer items-center gap-2"><input v-model="useLower" type="checkbox" class="accent-[hsl(var(--primary))]" />小写字母 a-z</label>
          <label class="inline-flex cursor-pointer items-center gap-2"><input v-model="useDigit" type="checkbox" class="accent-[hsl(var(--primary))]" />数字 0-9</label>
          <label class="inline-flex cursor-pointer items-center gap-2"><input v-model="useSymbol" type="checkbox" class="accent-[hsl(var(--primary))]" />符号 !@#$…</label>
          <label class="inline-flex cursor-pointer items-center gap-2 border-t pt-2 text-muted-foreground"><input v-model="exclude" type="checkbox" class="accent-[hsl(var(--primary))]" />排除易混淆字符（0O1lI|）</label>
        </div>
        <Button variant="primary" class="w-full" @click="generate">
          <RefreshCw :size="14" />生成
        </Button>
      </section>

      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">{{ items.length }} 条结果</span>
          <CopyButton :text="text" />
        </div>
        <ul class="space-y-2">
          <li v-for="(p, i) in items" :key="i" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
            <span class="flex-1 font-mono text-sm">{{ p }}</span>
            <span class="flex items-center gap-0.5">
              <span v-for="n in 5" :key="n"
                :class="['inline-block h-1.5 w-3 rounded-full', n <= strength(p) ? 'bg-primary' : 'bg-muted']"
              ></span>
            </span>
            <CopyButton :text="p" icon-only />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
