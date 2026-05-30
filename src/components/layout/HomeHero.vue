<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';

const props = defineProps<{ total: number }>();
const { dict } = useI18n();
</script>

<template>
  <section class="container pt-6 pb-8">
    <div class="max-w-2xl">
      <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {{ dict.home.badge }}
      </div>
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        {{ dict.home.title1 }}<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">{{ dict.home.title2 }}</span>
      </h1>
      <p class="mt-3 text-muted-foreground leading-relaxed">
        {{ dict.home.desc(total) }}
      </p>
    </div>
  </section>
</template>
