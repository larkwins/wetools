<script setup lang="ts">
import { computed } from 'vue';
import type { ToolMeta, CategoryMeta } from '@/lib/types';
import { getIcon } from '@/lib/icons';
import { useI18n } from '@/composables/useI18n';
import FavoriteButton from '@/components/ui/FavoriteButton.vue';
import FavoritesSection from './FavoritesSection.vue';

const props = defineProps<{
  groups: { category: CategoryMeta; tools: ToolMeta[] }[];
  allTools: ToolMeta[];
}>();

const { locale, t } = useI18n();

// 每个分类分配一个辅助色
const categoryColors: Record<string, { icon: string; iconBg: string; hover: string }> = {
  common:     { icon: 'text-amber-500',   iconBg: 'bg-amber-500/10',   hover: 'group-hover:text-amber-500' },
  encoding:   { icon: 'text-purple-500',  iconBg: 'bg-purple-500/10',  hover: 'group-hover:text-purple-500' },
  generator:  { icon: 'text-pink-500',    iconBg: 'bg-pink-500/10',    hover: 'group-hover:text-pink-500' },
  converter:  { icon: 'text-emerald-500', iconBg: 'bg-emerald-500/10', hover: 'group-hover:text-emerald-500' },
  text:       { icon: 'text-orange-500',  iconBg: 'bg-orange-500/10',  hover: 'group-hover:text-orange-500' },
  web:        { icon: 'text-teal-500',    iconBg: 'bg-teal-500/10',    hover: 'group-hover:text-teal-500' },
  cheatsheet: { icon: 'text-indigo-500',  iconBg: 'bg-indigo-500/10',  hover: 'group-hover:text-indigo-500' },
  detect:     { icon: 'text-cyan-500',    iconBg: 'bg-cyan-500/10',    hover: 'group-hover:text-cyan-500' },
};
const defaultColor = { icon: 'text-primary', iconBg: 'bg-primary/10', hover: 'group-hover:text-primary' };

// 分类的多语言名称（用工具的 meta 也支持转繁，所以这里直接用 t 处理 meta 的方法不行，分类没 meta；用 i18n+OpenCC）
function categoryTitle(cat: CategoryMeta) {
  const base = locale.value === 'en' ? 'en' : 'zh';
  const raw = cat.i18n[base]?.title ?? cat.i18n.zh.title;
  if (locale.value === 'zh-TW') {
    // 复用工具的转换器
    return tradFn(raw);
  }
  return raw;
}

// 简单调用一次 OpenCC（与 i18n.ts 一致）
import { toTraditional as tradFn } from '@/lib/i18n';
</script>

<template>
  <section class="container space-y-12 pb-20">
    <!-- 我的收藏 -->
    <FavoritesSection :all-tools="allTools" />

    <div
      v-for="g in groups"
      :key="g.category.id"
      :id="g.category.id"
    >
      <div class="mb-4 flex items-center gap-2.5">
        <span :class="['inline-flex h-7 w-7 items-center justify-center rounded-md', (categoryColors[g.category.id] ?? defaultColor).iconBg]">
          <component :is="getIcon(g.category.icon)" :size="14" :class="(categoryColors[g.category.id] ?? defaultColor).icon" />
        </span>
        <h2 class="text-sm font-semibold text-foreground">{{ categoryTitle(g.category) }}</h2>
        <span class="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
          {{ g.tools.length }}
        </span>
      </div>

      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <a
          v-for="tool in g.tools"
          :key="tool.id"
          :href="`/${tool.id}`"
          class="group tool-card relative cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <span :class="['inline-flex h-8 w-8 flex-none items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors', (categoryColors[g.category.id] ?? defaultColor).hover]">
              <component :is="getIcon(tool.icon)" :size="15" />
            </span>
            <div class="min-w-0 flex-1 pr-7">
              <p class="truncate text-sm font-medium text-foreground">{{ t(tool).title }}</p>
              <p class="truncate text-xs text-muted-foreground mt-0.5">{{ t(tool).description }}</p>
            </div>
          </div>
          <div class="absolute right-2 top-2">
            <FavoriteButton :tool-id="tool.id" size="sm" />
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
