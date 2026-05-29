<script setup lang="ts">
import type { ToolMeta } from '@/lib/types';

defineProps<{ meta: ToolMeta }>();
</script>

<template>
  <section class="rounded-lg border bg-card p-8 text-center">
    <p class="font-mono text-xs uppercase tracking-widest text-primary">tool template</p>
    <p class="mt-3 text-sm text-muted-foreground">
      复制本目录为 <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">src/tools/your-id/</code>
      并修改 index.ts 中的 meta 即可注册新工具。
    </p>
  </section>
</template>
