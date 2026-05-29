<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Sun, Moon, MonitorCog } from 'lucide-vue-next';

type Theme = 'light' | 'dark' | 'system';

const theme = ref<Theme>('system');
const open = ref(false);

const STORAGE_KEY = 'wetools:theme';

function apply(t: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = t === 'dark' || (t === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

function setTheme(t: Theme) {
  theme.value = t;
  localStorage.setItem(STORAGE_KEY, t);
  apply(t);
  open.value = false;
}

onMounted(() => {
  const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
  theme.value = stored;
  // 监听系统主题变化（仅当 theme === system 时生效）
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (theme.value === 'system') apply('system');
  });
  // 关闭外部点击
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-theme-toggle]')) open.value = false;
  });
});

watch(theme, (t) => apply(t));

const items: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: MonitorCog },
];
</script>

<template>
  <div class="relative" data-theme-toggle>
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="切换主题"
      @click="open = !open"
    >
      <Sun v-if="theme === 'light'" :size="18" />
      <Moon v-else-if="theme === 'dark'" :size="18" />
      <MonitorCog v-else :size="18" />
    </button>

    <div
      v-show="open"
      class="absolute right-0 top-full z-50 mt-2 min-w-[160px] origin-top-right animate-pop-in rounded-lg border bg-popover p-1 shadow-soft"
      role="menu"
    >
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
        :class="[
          'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary',
          theme === item.value ? 'text-primary' : 'text-foreground',
        ]"
        @click="setTheme(item.value)"
      >
        <component :is="item.icon" :size="14" />
        {{ item.label }}
        <span v-if="theme === item.value" class="ml-auto text-xs text-primary">●</span>
      </button>
    </div>
  </div>
</template>
