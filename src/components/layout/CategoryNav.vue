<script setup lang="ts">
import type { ToolMeta, CategoryMeta } from '@/lib/types';
import { useI18n } from '@/composables/useI18n';
import { toTraditional } from '@/lib/i18n';

const props = defineProps<{
  groups: { category: CategoryMeta; tools: ToolMeta[] }[];
}>();

const { locale, t } = useI18n();

function catTitle(cat: CategoryMeta) {
  const base = locale.value === 'en' ? 'en' : 'zh';
  const raw = cat.i18n[base]?.title ?? cat.i18n.zh.title;
  return locale.value === 'zh-TW' ? toTraditional(raw) : raw;
}
</script>

<template>
  <nav class="hidden xl:flex items-center gap-0.5" aria-label="分类导航">
    <div v-for="g in groups" :key="g.category.id" class="nav-dropdown relative">
      <button
        type="button"
        class="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
      >
        {{ catTitle(g.category) }}
        <svg class="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="nav-dropdown-menu absolute left-0 top-full hidden min-w-[200px] animate-pop-in rounded-lg border bg-popover p-1.5 shadow-lg">
        <a
          v-for="tool in g.tools"
          :key="tool.id"
          :href="`/${tool.id}`"
          class="flex items-center rounded-md px-2.5 py-1.5 text-[13px] text-popover-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
        >
          {{ t(tool).title }}
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown:focus-within .nav-dropdown-menu {
  display: block;
}
.nav-dropdown-menu {
  padding-top: 6px;
  margin-top: -6px;
}
</style>
