<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';

type Theme = 'light' | 'dark' | 'system';
const theme = ref<Theme>('system');
const dark = ref(false); // SSR 时默认 false，客户端同步
const STORAGE_KEY = 'wetools:theme';

function computeDark(t: Theme): boolean {
  if (t === 'dark') return true;
  if (t === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(t: Theme) {
  dark.value = computeDark(t);
  document.documentElement.classList.toggle('dark', dark.value);
  document.documentElement.style.colorScheme = dark.value ? 'dark' : 'light';
}

function toggle() {
  const next: Theme = dark.value ? 'light' : 'dark';
  theme.value = next;
  localStorage.setItem(STORAGE_KEY, next);
  apply(next);
}

onMounted(() => {
  const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
  theme.value = stored;
  dark.value = computeDark(stored);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (theme.value === 'system') apply('system');
  });
});
</script>

<template>
  <button
    type="button"
    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    aria-label="切换主题"
    @click="toggle"
  >
    <Sun v-if="!dark" :size="15" />
    <Moon v-else :size="15" />
  </button>
</template>
