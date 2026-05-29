<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Star, Clock } from 'lucide-vue-next';
import type { ToolMeta, CategoryMeta } from '@/lib/types';
import { usePrefsStore } from '@/stores/prefs';
import { getIcon } from '@/lib/icons';

const props = defineProps<{
  groups: { category: CategoryMeta; tools: ToolMeta[] }[];
  /** 当前激活工具 id，用于高亮 */
  activeId?: string;
  /** 用于按 id 反查 ToolMeta */
  allTools: ToolMeta[];
  locale?: 'zh' | 'en';
}>();

const locale = props.locale ?? 'zh';
const prefs = usePrefsStore();
const { favorites, recents } = storeToRefs(prefs);

const ico = getIcon;

const favoriteTools = computed(() =>
  favorites.value
    .map((id) => props.allTools.find((t) => t.id === id))
    .filter((t): t is ToolMeta => Boolean(t))
);

const recentTools = computed(() =>
  recents.value
    .map((id) => props.allTools.find((t) => t.id === id))
    .filter((t): t is ToolMeta => Boolean(t))
);
</script>

<template>
  <nav class="flex h-full flex-col gap-6 py-6 pr-3 text-sm">
    <!-- 收藏 -->
    <section v-if="favoriteTools.length > 0">
      <h3
        class="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <Star :size="12" class="text-primary" />
        {{ locale === 'en' ? 'Favorites' : '收藏' }}
      </h3>
      <ul class="space-y-0.5">
        <li v-for="t in favoriteTools" :key="t.id">
          <a
            :href="`/tools/${t.id}`"
            :class="[
              'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
              activeId === t.id
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-secondary',
            ]"
          >
            <component :is="ico(t.icon)" :size="14" class="flex-none" />
            <span class="truncate">{{ t.i18n[locale].title }}</span>
          </a>
        </li>
      </ul>
    </section>

    <!-- 最近使用 -->
    <section v-if="recentTools.length > 0">
      <h3
        class="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <Clock :size="12" />
        {{ locale === 'en' ? 'Recent' : '最近使用' }}
      </h3>
      <ul class="space-y-0.5">
        <li v-for="t in recentTools.slice(0, 5)" :key="t.id">
          <a
            :href="`/tools/${t.id}`"
            :class="[
              'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
              activeId === t.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ]"
          >
            <component :is="ico(t.icon)" :size="14" class="flex-none" />
            <span class="truncate">{{ t.i18n[locale].title }}</span>
          </a>
        </li>
      </ul>
    </section>

    <!-- 全部分类 -->
    <section
      v-for="g in groups"
      :key="g.category.id"
      class="space-y-1"
    >
      <h3
        class="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <component :is="ico(g.category.icon)" :size="12" />
        {{ g.category.i18n[locale].title }}
      </h3>
      <ul class="space-y-0.5">
        <li v-for="t in g.tools" :key="t.id">
          <a
            :href="`/tools/${t.id}`"
            :class="[
              'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
              activeId === t.id
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-foreground/80 hover:bg-secondary hover:text-foreground',
            ]"
          >
            <component :is="ico(t.icon)" :size="14" class="flex-none opacity-70" />
            <span class="truncate">{{ t.i18n[locale].title }}</span>
            <span
              v-if="t.tags?.includes('new')"
              class="ml-auto rounded-sm bg-primary/15 px-1 py-0 text-[9px] font-bold uppercase tracking-wider text-primary"
            >new</span>
            <span
              v-else-if="t.tags?.includes('hot')"
              class="ml-auto rounded-sm bg-destructive/15 px-1 py-0 text-[9px] font-bold uppercase tracking-wider text-destructive"
            >hot</span>
          </a>
        </li>
      </ul>
    </section>
  </nav>
</template>
