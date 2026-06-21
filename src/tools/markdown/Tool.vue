<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { marked } from 'marked';

const md = ref(`# WeTools Markdown

WeTools 是一个 **本地运行** 的开发者工具集。

## 特性

- ⚡️ 静态站点，加载极快
- 🔒 数据不离开浏览器
- 🧩 插件化架构

## 代码

\`\`\`ts
function hello() {
  console.log('Hello, WeTools');
}
\`\`\`

> 引用：所有计算都在浏览器中完成。

| 工具 | 分类 |
| ---- | ---- |
| Base64 | 编码 |
| JSON | 数据 |

[访问主页](https://wetools.cc)
`);

marked.setOptions({ gfm: true, breaks: false });

// DOMPurify 仅在浏览器加载（avoid SSR ReferenceError）
const purifier = shallowRef<((s: string) => string) | null>(null);
onMounted(async () => {
  const mod = await import('dompurify');
  const DOMPurify = (mod as any).default ?? mod;
  purifier.value = (s: string) => DOMPurify.sanitize(s, { ADD_ATTR: ['target', 'rel'] });
});

const html = computed(() => {
  const raw = marked.parse(md.value, { async: false }) as string;
  return purifier.value ? purifier.value(raw) : raw;
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">Markdown</label>
          <CopyButton :text="md" icon-only />
        </div>
        <Textarea v-model="md" mono :rows="22" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">预览（已 sanitize）</label>
          <CopyButton :text="html" icon-only label="复制 HTML" />
        </div>
        <article
          class="prose-md min-h-[400px] rounded-md border bg-card p-5"
          v-html="html"
          data-no-i18n
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose-md :deep(h1) { @apply mb-3 mt-4 text-2xl font-bold tracking-tight; }
.prose-md :deep(h2) { @apply mb-2 mt-5 text-xl font-semibold; }
.prose-md :deep(h3) { @apply mb-2 mt-4 text-lg font-semibold; }
.prose-md :deep(p)  { @apply my-3 leading-7; }
.prose-md :deep(ul) { @apply my-3 list-disc pl-6; }
.prose-md :deep(ol) { @apply my-3 list-decimal pl-6; }
.prose-md :deep(li) { @apply my-1; }
.prose-md :deep(a)  { @apply text-primary underline-offset-4 hover:underline; }
.prose-md :deep(strong) { @apply font-semibold text-foreground; }
.prose-md :deep(blockquote) {
  @apply my-3 border-l-2 border-primary/40 bg-primary/5 px-4 py-2 text-muted-foreground;
}
.prose-md :deep(code) {
  @apply rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-primary;
}
.prose-md :deep(pre) {
  @apply my-3 overflow-x-auto rounded-md border bg-muted/60 p-3 font-mono text-[12px] leading-6;
}
.prose-md :deep(pre code) {
  @apply bg-transparent p-0 text-foreground;
}
.prose-md :deep(table) { @apply my-3 w-full border-collapse text-sm; }
.prose-md :deep(th), .prose-md :deep(td) { @apply border px-3 py-1.5; }
.prose-md :deep(th) { @apply bg-muted font-semibold; }
.prose-md :deep(hr) { @apply my-4 border-border; }
</style>
