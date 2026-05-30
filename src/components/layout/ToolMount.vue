<script setup lang="ts">
import { defineAsyncComponent, computed, h, type Component } from 'vue';
import type { ToolMeta } from '@/lib/types';
import { useToolI18n } from '@/composables/useToolI18n';

const props = defineProps<{ meta: ToolMeta }>();

// 启用工具页文本自动多语言（DOM 扫描 + OpenCC 简繁转换）
useToolI18n({ container: '[data-tool-content]' });

// 收集所有工具组件，由 Vite 自动按工具拆分 chunk
const components = import.meta.glob<{ default: Component }>('/src/tools/*/Tool.vue');

const Comp = computed(() => {
  const path = `/src/tools/${props.meta.id}/Tool.vue`;
  const importer = components[path];
  if (!importer) {
    return {
      render() {
        return h(
          'div',
          { class: 'rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive' },
          `[ToolMount] 找不到工具组件：${path}`
        );
      },
    } as Component;
  }
  return defineAsyncComponent({
    loader: () => importer(),
    delay: 80,
    loadingComponent: {
      render() {
        return h(
          'div',
          { class: 'flex items-center justify-center rounded-lg border bg-card/50 py-16 text-sm text-muted-foreground' },
          '加载工具中…'
        );
      },
    } as Component,
  });
});
</script>

<template>
  <div data-tool-content>
    <component :is="Comp" :meta="meta" />
  </div>
</template>
