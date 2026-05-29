<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readonly?: boolean;
}>();
defineEmits<{ (e: 'update:modelValue', value: string): void }>();
</script>

<template>
  <input
    :type="type ?? 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    class="flex h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
