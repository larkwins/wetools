<script setup lang="ts">
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

  // 客户端检测平台后更新快捷键显示
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  const el = document.getElementById('search-shortcut');
  if (el) el.textContent = isMac ? '⌘K' : 'Ctrl K';
});
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 items-center gap-2 rounded-md border border-border/60 bg-secondary/50 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    aria-label="搜索"
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
