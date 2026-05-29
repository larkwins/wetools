<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeftRight, Trash2, AlertCircle } from 'lucide-vue-next';
import type { ToolMeta } from '@/lib/types';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { utf8ToBase64, base64ToUtf8 } from './logic';

defineProps<{ meta: ToolMeta }>();

type Mode = 'encode' | 'decode';

const mode = ref<Mode>('encode');
const urlSafe = ref(false);
const input = ref('Hello, WeTools 👋');
const error = ref<string | null>(null);

const output = computed(() => {
  error.value = null;
  if (!input.value) return '';
  try {
    return mode.value === 'encode'
      ? utf8ToBase64(input.value, urlSafe.value)
      : base64ToUtf8(input.value, urlSafe.value);
  } catch (e) {
    error.value =
      mode.value === 'decode'
        ? '输入不是合法的 Base64 字符串'
        : (e as Error)?.message ?? '编码失败';
    return '';
  }
});

function swap() {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode';
  input.value = output.value || input.value;
}

function clearAll() {
  input.value = '';
}

watch(mode, () => {
  // 切换模式时不立即清空，让用户能基于已有结果做反向验证
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 控制栏 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === 'encode'
              ? 'bg-primary text-primary-foreground shadow-soft-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = 'encode'"
        >
          编码
        </button>
        <button
          type="button"
          :class="[
            'h-8 rounded-sm px-3 text-sm transition-colors',
            mode === 'decode'
              ? 'bg-primary text-primary-foreground shadow-soft-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="mode = 'decode'"
        >
          解码
        </button>
      </div>

      <label
        class="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
      >
        <input
          v-model="urlSafe"
          type="checkbox"
          class="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]"
        />
        <span>URL Safe（- _ 替代 + /）</span>
      </label>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="swap">
          <ArrowLeftRight :size="14" />
          交换
        </Button>
        <Button variant="ghost" size="sm" @click="clearAll">
          <Trash2 :size="14" />
          清空
        </Button>
      </div>
    </div>

    <!-- 输入输出双栏 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {{ mode === 'encode' ? '原文输入' : 'Base64 输入' }}
          </label>
          <CopyButton :text="input" label="复制输入" icon-only />
        </div>
        <Textarea
          v-model="input"
          mono
          :rows="14"
          :placeholder="mode === 'encode' ? '输入要编码的文本…' : '粘贴 Base64 字符串…'"
        />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {{ mode === 'encode' ? 'Base64 输出' : '解码结果' }}
          </label>
          <CopyButton :text="output" label="复制输出" icon-only />
        </div>
        <Textarea
          :model-value="output"
          mono
          :rows="14"
          readonly
          placeholder="结果将显示在这里"
        />
        <div
          v-if="error"
          class="flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle :size="12" />
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>
