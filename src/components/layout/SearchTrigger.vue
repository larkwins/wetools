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

  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  const el = document.getElementById('search-shortcut');
  if (el) el.textContent = isMac ? '⌘K' : 'Ctrl K';
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
    <kbd
      id="search-shortcut"
      class="hidden sm:inline-flex h-5 w-10 items-center justify-center rounded border bg-background font-mono text-[10px]"
    >⌘K</kbd>
  </button>
</template>
