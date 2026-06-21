<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const title = ref('WeTools — 程序员的浏览器工具箱');
const description = ref('100+ 个开发者常用工具，全部在浏览器本地运行，开源免费。');
const url = ref('https://wetools.cc');
const image = ref('https://wetools.cc/og.png');
const author = ref('');
const themeColor = ref('#10b981');
const siteName = ref('WeTools');
const twitterHandle = ref('@wetools');
const lang = ref('zh-CN');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const meta = computed(() => {
  const lines: string[] = [];
  if (title.value) lines.push(`<title>${esc(title.value)}</title>`);
  if (description.value) lines.push(`<meta name="description" content="${esc(description.value)}" />`);
  if (author.value) lines.push(`<meta name="author" content="${esc(author.value)}" />`);
  if (themeColor.value) lines.push(`<meta name="theme-color" content="${esc(themeColor.value)}" />`);
  if (lang.value) lines.push(`<meta http-equiv="content-language" content="${esc(lang.value)}" />`);
  if (url.value) lines.push(`<link rel="canonical" href="${esc(url.value)}" />`);
  lines.push('');
  lines.push('<!-- Open Graph / Facebook -->');
  if (siteName.value) lines.push(`<meta property="og:site_name" content="${esc(siteName.value)}" />`);
  lines.push(`<meta property="og:type" content="website" />`);
  if (url.value) lines.push(`<meta property="og:url" content="${esc(url.value)}" />`);
  if (title.value) lines.push(`<meta property="og:title" content="${esc(title.value)}" />`);
  if (description.value) lines.push(`<meta property="og:description" content="${esc(description.value)}" />`);
  if (image.value) lines.push(`<meta property="og:image" content="${esc(image.value)}" />`);
  if (lang.value) lines.push(`<meta property="og:locale" content="${esc(lang.value.replace('-', '_'))}" />`);
  lines.push('');
  lines.push('<!-- Twitter Card -->');
  lines.push(`<meta name="twitter:card" content="${image.value ? 'summary_large_image' : 'summary'}" />`);
  if (twitterHandle.value) lines.push(`<meta name="twitter:site" content="${esc(twitterHandle.value)}" />`);
  if (title.value) lines.push(`<meta name="twitter:title" content="${esc(title.value)}" />`);
  if (description.value) lines.push(`<meta name="twitter:description" content="${esc(description.value)}" />`);
  if (image.value) lines.push(`<meta name="twitter:image" content="${esc(image.value)}" />`);
  return lines.join('\n');
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="tool-section-title">标题</label>
        <Input v-model="title" />
      </div>
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="tool-section-title">描述</label>
        <Textarea v-model="description" :rows="2" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">站点 URL</label>
        <Input v-model="url" placeholder="https://example.com" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">分享图 URL</label>
        <Input v-model="image" placeholder="https://example.com/og.png" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">站点名</label>
        <Input v-model="siteName" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">Twitter 账号</label>
        <Input v-model="twitterHandle" placeholder="@username" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">作者</label>
        <Input v-model="author" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">主题色</label>
        <div class="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
          <input v-model="themeColor" type="color" class="h-6 w-8 cursor-pointer rounded" />
          <Input v-model="themeColor" class="h-7 flex-1 border-0 bg-transparent" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">语言</label>
        <select v-model="lang" class="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="zh-CN">zh-CN (简体中文)</option>
          <option value="zh-TW">zh-TW (繁体中文)</option>
          <option value="en">en (English)</option>
          <option value="ja">ja (日本語)</option>
          <option value="ko">ko (한국어)</option>
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">Meta 标签代码</label>
        <CopyButton :text="meta" icon-only />
      </div>
      <pre class="max-h-96 overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>{{ meta }}</code></pre>
    </div>

    <div class="rounded-lg border bg-card p-4">
      <p class="mb-2 tool-section-title">社交分享预览</p>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
        <img v-if="image" :src="image" :alt="title" class="h-32 w-56 flex-none rounded border object-cover" data-no-i18n @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs text-muted-foreground">{{ url }}</p>
          <p class="mt-0.5 line-clamp-2 text-sm font-semibold">{{ title }}</p>
          <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
