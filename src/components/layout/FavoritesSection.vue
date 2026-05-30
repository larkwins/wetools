<script setup lang="ts">
/**
 * FavoritesSection - 我的收藏
 *
 * 设计原则（避免 hydration mismatch + FOUC）：
 *  1. 所有可见文案统一用 zh-CN 中文硬编码，交由全局 GlobalI18n（DOM 翻译器）
 *     在客户端按当前 locale 切换为 zh-TW / en。
 *     不再调用 useI18n() 取响应式字典，因为：
 *       - SSR 阶段拿不到 localStorage，store 的 locale 可能与客户端不一致；
 *       - 一旦不一致就会出现 "SSR 渲染中文 → 客户端 hydrate 又变英文" 的闪烁。
 *  2. 外壳（标题/计数/空状态）始终渲染，让分组在 SSR 阶段就可见。
 */
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Star, ClipboardList } from 'lucide-vue-next';
import type { ToolMeta } from '@/lib/types';
import { usePrefsStore } from '@/stores/prefs';
import { getIcon } from '@/lib/icons';
import FavoriteButton from '@/components/ui/FavoriteButton.vue';

const props = defineProps<{ allTools: ToolMeta[] }>();

const prefs = usePrefsStore();
const { favorites } = storeToRefs(prefs);

const favoriteTools = computed<ToolMeta[]>(() => {
  const map = new Map(props.allTools.map((tool) => [tool.id, tool]));
  return favorites.value
    .map((id) => map.get(id))
    .filter((tool): tool is ToolMeta => Boolean(tool));
});
</script>

<template>
  <!-- 整个"我的收藏"分组始终显示（哪怕没有任何收藏，也保留外壳和空状态） -->
  <div>
    <div class="mb-4 flex items-center gap-2.5">
      <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
        <Star :size="14" class="text-amber-500" fill="currentColor" :stroke-width="1.5" />
      </span>
      <h2 class="text-sm font-semibold text-foreground">我的收藏</h2>
      <span
        v-if="favoriteTools.length > 0"
        class="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
      >
        {{ favoriteTools.length }}
      </span>
    </div>

    <!-- 有收藏：卡片网格 -->
    <div
      v-if="favoriteTools.length > 0"
      class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <a
        v-for="tool in favoriteTools"
        :key="tool.id"
        :href="`/${tool.id}`"
        class="group tool-card relative cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors group-hover:text-amber-500">
            <component :is="getIcon(tool.icon)" :size="15" />
          </span>
          <div class="min-w-0 flex-1 pr-7">
            <p class="truncate text-sm font-medium text-foreground">{{ tool.i18n.zh.title }}</p>
            <p class="truncate text-xs text-muted-foreground mt-0.5">{{ tool.i18n.zh.description }}</p>
          </div>
        </div>
        <div class="absolute right-2 top-2">
          <FavoriteButton :tool-id="tool.id" size="sm" />
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="flex items-center gap-3 rounded-lg border border-dashed bg-card/40 px-4 py-5 text-sm text-muted-foreground"
    >
      <ClipboardList :size="20" class="flex-none text-muted-foreground/70" />
      <p>
        还没有收藏任何工具。点击工具卡片右上角的
        <Star :size="13" class="inline-block -mt-0.5 text-amber-500" />
        即可收藏，方便下次快速访问。
      </p>
    </div>
  </div>
</template>
