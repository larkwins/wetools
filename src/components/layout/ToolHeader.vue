<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Star, ShieldCheck, Globe2, Link as LinkIcon } from 'lucide-vue-next';
import type { ToolMeta } from '@/lib/types';
import { usePrefsStore } from '@/stores/prefs';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{
  meta: ToolMeta;
  locale?: 'zh' | 'en';
}>();

const locale = props.locale ?? 'zh';

const prefs = usePrefsStore();
const { favorites } = storeToRefs(prefs);
const isFav = computed(() => favorites.value.includes(props.meta.id));

const { copied, copy } = useCopy();
async function copyLink() {
  await copy(window.location.href);
}

onMounted(() => {
  // 进入工具页 → 写入"最近使用"
  prefs.pushRecent(props.meta.id);
});

const isExternal = props.meta.privacy === 'external';
const i18n = props.meta.i18n[locale];
</script>

<template>
  <header class="flex flex-col gap-4 border-b pb-6">
    <!-- 面包屑 -->
    <nav class="text-xs text-muted-foreground">
      <a href="/" class="transition-colors hover:text-foreground">{{
        locale === 'en' ? 'Home' : '首页'
      }}</a>
      <span class="px-1.5">/</span>
      <span class="text-foreground">{{ i18n.title }}</span>
    </nav>

    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          {{ i18n.title }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          {{ i18n.description }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span
            v-if="!isExternal"
            class="badge badge-success"
            :title="locale === 'en' ? 'Runs locally' : '本地处理'"
          >
            <ShieldCheck :size="12" />
            {{ locale === 'en' ? 'Runs locally' : '本地处理' }}
          </span>
          <span v-else class="badge badge-warning">
            <Globe2 :size="12" />
            {{ locale === 'en' ? 'Uses external API' : '调用外部 API' }}
          </span>
          <span
            v-if="meta.tags?.includes('new')"
            class="badge"
            style="border-color: hsl(var(--info) / 0.3); background: hsl(var(--info) / 0.1); color: hsl(var(--info));"
          >NEW</span>
          <span
            v-if="meta.tags?.includes('hot')"
            class="badge"
            style="border-color: hsl(var(--destructive) / 0.3); background: hsl(var(--destructive) / 0.1); color: hsl(var(--destructive));"
          >HOT</span>
          <span
            v-if="meta.tags?.includes('beta')"
            class="badge badge-info"
          >BETA</span>
        </div>
      </div>

      <div class="flex flex-none items-center gap-2">
        <button
          type="button"
          :aria-label="isFav ? '取消收藏' : '收藏'"
          :title="isFav ? '取消收藏' : '收藏'"
          :class="[
            'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:border-primary/60',
            isFav ? 'border-primary/60 text-primary' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="prefs.toggleFavorite(meta.id)"
        >
          <Star :size="16" :fill="isFav ? 'currentColor' : 'none'" />
        </button>
        <button
          type="button"
          :aria-label="copied ? '已复制链接' : '复制链接'"
          :title="copied ? '已复制' : '复制链接'"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="copyLink"
        >
          <LinkIcon :size="16" />
        </button>
      </div>
    </div>
  </header>
</template>
