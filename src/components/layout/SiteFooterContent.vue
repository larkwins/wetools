<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';

const { dict } = useI18n();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t">
    <div class="container flex items-center justify-between py-6 text-xs text-muted-foreground">
      <span>{{ dict.footer.copyright(year) }}</span>
      <div class="flex items-center gap-4">
        <a href="/about" class="transition-colors hover:text-foreground">{{ dict.footer.about }}</a>
      </div>
    </div>
  </footer>
</template>
