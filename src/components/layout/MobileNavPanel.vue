<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Menu } from 'lucide-vue-next';
import type { ToolMeta, CategoryMeta } from '@/lib/types';
import { useI18n } from '@/composables/useI18n';
import { toTraditional } from '@/lib/i18n';

const props = defineProps<{
  groups: { category: CategoryMeta; tools: ToolMeta[] }[];
}>();

const { locale, dict, t } = useI18n();
const open = ref(false);

function catTitle(cat: CategoryMeta) {
  const base = locale.value === 'en' ? 'en' : 'zh';
  const raw = cat.i18n[base]?.title ?? cat.i18n.zh.title;
  return locale.value === 'zh-TW' ? toTraditional(raw) : raw;
}

function close() {
  open.value = false;
  document.body.style.overflow = '';
}
function openPanel() {
  open.value = true;
  document.body.style.overflow = 'hidden';
}
function toggle() {
  open.value ? close() : openPanel();
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close();
}

onMounted(() => {
  window.addEventListener('keydown', onKey);
  const mq = window.matchMedia('(min-width: 1280px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) close();
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
});
</script>

<template>
  <button
    type="button"
    class="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
    :aria-label="dict.nav.openMenu"
    :aria-expanded="open"
    @click.stop="toggle"
  >
    <Menu :size="18" />
  </button>

  <!-- 遮罩 + 面板 -->
  <Teleport to="body">
    <div v-if="open" class="xl:hidden fixed inset-0 top-14 z-40 bg-background/60 backdrop-blur-sm" @click="close"></div>
    <div
      v-if="open"
      class="xl:hidden fixed left-0 right-0 top-14 z-50 border-b bg-background shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto"
    >
      <nav class="container py-4">
        <div v-for="g in groups" :key="g.category.id" class="mb-5 last:mb-0">
          <div class="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {{ catTitle(g.category) }}
          </div>
          <div class="grid grid-cols-2 gap-1 sm:grid-cols-3">
            <a
              v-for="tool in g.tools"
              :key="tool.id"
              :href="`/${tool.id}`"
              class="block truncate rounded-md px-2 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              @click="close"
            >
              {{ t(tool).title }}
            </a>
          </div>
        </div>
      </nav>
    </div>
  </Teleport>
</template>
