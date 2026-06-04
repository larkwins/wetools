<script setup lang="ts">
defineProps<{
  modelValue?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  /** 等宽 + 行高 + 较小字号，适合代码 / JSON / Hash 输入输出 */
  mono?: boolean;
}>();
defineEmits<{ (e: 'update:modelValue', value: string): void }>();
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows ?? 8"
    :disabled="disabled"
    :readonly="readonly"
    spellcheck="false"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    :class="[
      'block w-full resize-y rounded-md border-2 border-input bg-card px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground transition-colors hover:border-primary/40 hover:shadow focus:border-primary focus:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      mono ? 'code-area' : 'text-sm leading-6',
    ]"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
