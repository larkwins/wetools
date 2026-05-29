<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next';

defineProps<{ title?: string; description?: string }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/50 p-10 text-center"
  >
    <ClipboardList :size="48" class="text-muted-foreground/60" />
    <p class="text-sm font-medium">{{ title ?? '暂无内容' }}</p>
    <p v-if="description" class="max-w-sm text-xs text-muted-foreground">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
