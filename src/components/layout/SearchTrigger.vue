<script setup lang="ts">
import { Search, Command } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const isMac = ref(false);
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent);
});

function open() {
  // 触发全局命令面板（CommandPalette 监听该事件）
  window.dispatchEvent(new CustomEvent('wetools:openPalette'));
}

onMounted(() => {
  function onKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
  }
  window.addEventListener('keydown', onKey);
});
</script>

<template>
  <button
    type="button"
    class="group inline-flex h-9 w-full max-w-xs items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    aria-label="打开命令面板"
    @click="open"
  >
    <Search :size="14" />
    <span class="flex-1 truncate text-left">搜索工具…</span>
    <kbd
      class="hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex"
    >
      <Command v-if="isMac" :size="10" />
      <span v-else>Ctrl</span>
      <span>K</span>
    </kbd>
  </button>
</template>
