<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Star, Link as LinkIcon } from 'lucide-vue-next';
import { usePrefsStore } from '@/stores/prefs';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{ toolId: string }>();

const prefs = usePrefsStore();
const { favorites } = storeToRefs(prefs);
const isFav = computed(() => favorites.value.includes(props.toolId));

const { copied, copy } = useCopy();
async function copyLink() {
  await copy(window.location.href);
}

onMounted(() => {
  prefs.pushRecent(props.toolId);
});
</script>

<template>
  <div class="flex flex-none items-center gap-2">
    <button
      type="button"
      :aria-label="isFav ? '取消收藏' : '收藏'"
      :class="[
        'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
        isFav ? 'border-primary/60 text-primary' : 'text-muted-foreground hover:text-foreground hover:border-border',
      ]"
      @click="prefs.toggleFavorite(toolId)"
    >
      <Star :size="14" :fill="isFav ? 'currentColor' : 'none'" />
    </button>
    <button
      type="button"
      :aria-label="copied ? '已复制' : '复制链接'"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground hover:border-border"
      @click="copyLink"
    >
      <LinkIcon :size="14" />
    </button>
  </div>
</template>
