<script setup lang="ts">
/**
 * ToolMount —— 工具页加载入口
 *
 * 关键：使用 Vue `<script setup>` 顶层 await 同步加载 Tool 组件。
 * - SSR：Vue 在 await import() 完成后才输出 HTML，所以服务端渲染就拿到了
 *        实际工具的完整骨架（包括 CodeEditor 内 SSR 占位 <pre> 显示的默认值）。
 * - 客户端：Astro hydrate 时 Vue 也会等 import 完成，组件树与 SSR 一致，
 *        无 hydration mismatch；同时 Vite 会为每个工具生成独立 chunk，
 *        modulepreload 让浏览器与 Vue runtime 并行下载它。
 *
 * 这是相对原 `defineAsyncComponent` 方案的核心改进：
 *   - 旧：SSR 渲染 loadingComponent (spinner) → 客户端串行加载 Tool 才能渲染
 *         → 用户感知 ~2 秒空白
 *   - 新：SSR 直接出 Tool 完整 HTML → 用户首屏即可读 → CodeMirror 之后无缝接管
 */
import { computed, type Component } from 'vue';
import type { ToolMeta } from '@/lib/types';
import { useToolI18n } from '@/composables/useToolI18n';

const props = defineProps<{ meta: ToolMeta }>();

// 在 build 时由 Vite 解析为 per-tool 的动态 import 映射；不带 eager 保留代码分割
const toolModules = import.meta.glob<{ default: Component }>('/src/tools/*/Tool.vue');

const importer = toolModules[`/src/tools/${props.meta.id}/Tool.vue`];
if (!importer) {
  throw new Error(`[ToolMount] 找不到工具组件：${props.meta.id}`);
}
// 顶层 await：触发 Vue async setup；SSR 等待完成才输出 HTML
const ToolComp = (await importer()).default;

const Comp = computed(() => ToolComp);

// 启用工具内容区文本自动多语言（与 GlobalI18n 互补，覆盖 Vue 动态渲染节点）
useToolI18n({ container: '[data-tool-content]' });
</script>

<template>
  <div data-tool-content>
    <component :is="Comp" :meta="meta" />
  </div>
</template>
