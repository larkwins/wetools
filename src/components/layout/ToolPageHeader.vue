<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheck, Globe2 } from 'lucide-vue-next';
import type { ToolMeta } from '@/lib/types';
import { useI18n } from '@/composables/useI18n';
import ToolActions from './ToolActions.vue';

const props = defineProps<{ meta: ToolMeta }>();
const { dict, t } = useI18n();

const isExternal = computed(() => props.meta.privacy === 'external');
const i18n = computed(() => t(props.meta));
</script>

<template>
  <header class="flex flex-col gap-4 border-b pb-6">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight">{{ i18n.title }}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">{{ i18n.description }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span v-if="!isExternal" class="badge badge-success">
            <ShieldCheck :size="12" />
            {{ dict.tool.runsLocally }}
          </span>
          <span v-else class="badge badge-warning">
            <Globe2 :size="12" />
            {{ dict.tool.usesExternal }}
          </span>
          <span
            v-if="meta.tags?.includes('new')"
            class="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400"
          >NEW</span>
        </div>
      </div>
      <ToolActions :tool-id="meta.id" />
    </div>
  </header>
</template>
