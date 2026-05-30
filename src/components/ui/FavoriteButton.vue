<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Star } from 'lucide-vue-next';
import { usePrefsStore } from '@/stores/prefs';
import { useI18n } from '@/composables/useI18n';

const { dict } = useI18n();

const props = defineProps<{
  toolId: string;
  /** 尺寸变体：sm (用于工具卡片) / md (用于工具页) */
  size?: 'sm' | 'md';
}>();

const size = props.size ?? 'sm';
const prefs = usePrefsStore();
const { favorites } = storeToRefs(prefs);
const isFav = computed(() => favorites.value.includes(props.toolId));

function onClick(e: MouseEvent) {
  // 阻止冒泡到外层 <a>，避免点收藏时同时跳转
  e.preventDefault();
  e.stopPropagation();
  prefs.toggleFavorite(props.toolId);
}
</script>

<template>
  <button
    type="button"
    :aria-label="isFav ? dict.tool.unfavorite : dict.tool.favorite"
    :title="isFav ? dict.tool.unfavorite : dict.tool.favorite"
    :class="[
      'inline-flex items-center justify-center rounded-md transition-colors',
      size === 'sm'
        ? 'h-7 w-7 hover:bg-secondary'
        : 'h-8 w-8 border hover:border-border',
      isFav
        ? 'text-amber-500 hover:text-amber-600'
        : 'text-muted-foreground/50 hover:text-muted-foreground',
    ]"
    @click="onClick"
  >
    <Star :size="size === 'sm' ? 14 : 15" :fill="isFav ? 'currentColor' : 'none'" :stroke-width="isFav ? 1.5 : 2" />
  </button>
</template>
