<script setup lang="ts">
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type Size = 'sm' | 'md' | 'icon';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
  }
);

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none whitespace-nowrap';

  const sizeMap: Record<Size, string> = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-9 px-4 text-sm',
    icon: 'h-9 w-9 p-0',
  };

  const variantMap: Record<Variant, string> = {
    primary:
      'bg-primary text-primary-foreground shadow-soft-sm hover:opacity-90 active:opacity-95',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
    ghost:
      'bg-transparent text-foreground hover:bg-secondary',
    destructive:
      'bg-destructive text-destructive-foreground hover:opacity-90',
    outline:
      'border bg-card text-foreground hover:border-primary/60 hover:text-primary',
  };

  return [base, sizeMap[props.size], variantMap[props.variant]].join(' ');
});
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <slot />
  </button>
</template>
