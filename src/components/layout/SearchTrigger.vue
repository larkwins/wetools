<script setup lang="ts">
/**
 * SearchTrigger
 *
 * 设计原则（避免 SSR/CSR hydration mismatch + 中英文闪烁）：
 *  - 所有文案以中文硬编码，由全局 GlobalI18n（DOM 翻译器）按当前 locale 切换。
 *  - 不调用 useI18n() 取响应式字典，避免每个 client:load island 各自的 Pinia
 *    store 与 SSR 渲染结果在 hydration 时不一致。
 */
import { Search } from 'lucide-vue-next';
import { onMounted } from 'vue';

function open() {
  window.dispatchEvent(new CustomEvent('wetools:openPalette'));
}

onMounted(() => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
  });
});
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 items-center gap-2 rounded-md border border-border/60 bg-secondary/50 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    aria-label="搜索工具…"
    @click="open"
  >
    <Search :size="13" />
    <span class="hidden sm:inline">搜索工具…</span>
    <!-- 两个 kbd 都渲染，由 BaseLayout 注入的 <html data-platform="mac|pc"> 通过 CSS
         决定显示哪一个。这样 SSR HTML 加载完成、inline 脚本同步执行后，浏览器首次
         绘制就已显示正确快捷键，不会有 ⌘K → Ctrl K 的闪烁 -->
    <kbd class="kbd-mac hidden sm:inline-flex h-5 w-10 items-center justify-center rounded border bg-background font-mono text-[10px]">⌘K</kbd>
    <kbd class="kbd-pc hidden sm:inline-flex h-5 w-10 items-center justify-center rounded border bg-background font-mono text-[10px]">Ctrl K</kbd>
  </button>
</template>

<style>
/* 全局样式（非 scoped）：依赖 <html data-platform="mac|pc">（由 BaseLayout inline 脚本同步设置）。
   未设置 data-platform 时默认显示 mac 版本（不影响功能，命中率最高的开发者环境是 mac）。 */
html:not([data-platform='pc']) .kbd-pc { display: none !important; }
html[data-platform='pc'] .kbd-mac { display: none !important; }
</style>
