<script setup lang="ts">
import { defineAsyncComponent, computed, h, type Component } from 'vue';
import type { ToolMeta } from '@/lib/types';
import { useToolI18n } from '@/composables/useToolI18n';

const props = defineProps<{ meta: ToolMeta }>();

// 启用工具页文本自动多语言（DOM 扫描 + OpenCC 简繁转换）
useToolI18n({ container: '[data-tool-content]' });

// 收集所有工具组件，由 Vite 自动按工具拆分 chunk
const components = import.meta.glob<{ default: Component }>('/src/tools/*/Tool.vue');

// 预热 CodeEditor 大 chunk（CodeMirror ~150KB gzip）。
// 大量格式化/转换类工具都依赖它，提前与 Tool.vue chunk 并行下载，
// 把"组件 chunk 解析完才发现要加载 CodeMirror"的串行等待变成并行，可省 ~1s。
// 对没用到 CodeEditor 的工具仅多一次 HTTP，命中长缓存代价极低。
if (typeof window !== 'undefined') {
  // 用 link rel=modulepreload 触发，比 import() 更轻（不会执行模块工厂，仅下载+解析）
  import('@/components/ui/CodeEditor.vue').catch(() => { /* 静默：纯预热 */ });
}

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
    // delay=200ms：依赖小、几乎瞬时 import 完的工具直接显示真实组件，不闪 Loading；
    //              依赖大（marked/opencc/mathjs/figlet 等）的工具超过 200ms 才显示转圈，符合用户感知阈值
    delay: 200,
    loadingComponent: {
      render() {
        return h(
          'div',
          { class: 'flex min-h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground' },
          [
            h(
              'svg',
              {
                class: 'h-5 w-5 animate-spin text-primary/70',
                viewBox: '0 0 24 24',
                fill: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
              },
              [
                h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-opacity': 0.2, 'stroke-width': 3 }),
                h('path', { d: 'M22 12a10 10 0 0 1-10 10', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }),
              ]
            ),
            h('p', { class: 'text-xs' }, 'Loading…'),
          ]
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
