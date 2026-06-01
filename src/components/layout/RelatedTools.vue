<script setup lang="ts">
/**
 * RelatedTools - 工具页底部"相关工具"
 *
 * 所有可见文案以中文为源，由 GlobalI18n 在客户端按 locale 翻译为 zh-TW / en，
 * 避免每个 Astro client island 各自创建 Pinia 实例导致的 SSR/CSR locale 不一致。
 */
import type { ToolMeta } from '@/lib/types';
import { getIcon } from '@/lib/icons';
import { LayoutGrid } from 'lucide-vue-next';

defineProps<{ related: ToolMeta[] }>();
</script>

<template>
  <section v-if="related.length > 0" class="mt-10 border-t pt-6">
    <h2 class="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <LayoutGrid :size="13" class="text-primary/70" />
      相关工具
    </h2>
    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <a
        v-for="tool in related"
        :key="tool.id"
        :href="`/${tool.id}`"
        class="group tool-card cursor-pointer !p-2.5"
      >
        <div class="flex items-center gap-2.5">
          <span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-md bg-secondary text-foreground/70 transition-colors group-hover:text-primary">
            <component :is="getIcon(tool.icon)" :size="14" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-medium leading-tight">{{ tool.i18n.zh.title }}</p>
            <p class="truncate text-[11px] text-muted-foreground mt-0.5">{{ tool.i18n.zh.description }}</p>
          </div>
        </div>
      </a>
    </div>
  </section>
</template>
