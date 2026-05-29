<script setup lang="ts">
import { Languages } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

const open = ref(false);
const locale = ref<'zh' | 'en'>('zh');

onMounted(() => {
  locale.value = window.location.pathname.startsWith('/en') ? 'en' : 'zh';
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-lang-switch]')) open.value = false;
  });
});

function pick(next: 'zh' | 'en') {
  // i18n 路由将在 i18n-and-pwa 阶段接入；当前先持久化偏好
  localStorage.setItem('wetools:locale', next);
  open.value = false;
  if (next === locale.value) return;
  // 简单策略：跳到首页 / 或 /en
  window.location.href = next === 'en' ? '/en' : '/';
}
</script>

<template>
  <div class="relative" data-lang-switch>
    <button
      type="button"
      class="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      aria-label="切换语言"
      @click="open = !open"
    >
      <Languages :size="16" />
      <span class="hidden font-mono text-xs uppercase sm:inline">{{ locale }}</span>
    </button>
    <div
      v-show="open"
      class="absolute right-0 top-full z-50 mt-2 min-w-[140px] origin-top-right animate-pop-in rounded-lg border bg-popover p-1 shadow-soft"
    >
      <button
        v-for="opt in [{v:'zh',l:'简体中文'},{v:'en',l:'English'}]"
        :key="opt.v"
        type="button"
        :class="[
          'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary',
          locale === opt.v ? 'text-primary' : 'text-foreground',
        ]"
        @click="pick(opt.v as 'zh' | 'en')"
      >
        {{ opt.l }}
        <span v-if="locale === opt.v" class="text-xs text-primary">●</span>
      </button>
    </div>
  </div>
</template>
