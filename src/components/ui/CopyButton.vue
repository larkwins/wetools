<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next';
import { useCopy } from '@/composables/useCopy';

const props = withDefaults(
  defineProps<{
    text: string;
    label?: string;
    /** 仅显示图标的紧凑按钮 */
    iconOnly?: boolean;
    size?: 'sm' | 'md';
  }>(),
  {
    iconOnly: false,
    size: 'sm',
  }
);

const { copied, copy } = useCopy();

async function onClick() {
  await copy(props.text);
}

const sizeClass = props.size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3 text-sm';
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-1.5 rounded-md border bg-card text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      sizeClass,
      iconOnly ? 'aspect-square !px-0 justify-center' : '',
    ]"
    :aria-label="label ?? '复制'"
    :title="label ?? '复制'"
    @click="onClick"
  >
    <Check v-if="copied" :size="14" class="text-primary" />
    <Copy v-else :size="14" />
    <span v-if="!iconOnly">{{ copied ? '已复制' : label ?? '复制' }}</span>
  </button>
</template>
