<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const user = ref('admin');
const pass = ref('s3cret!');

function utf8btoa(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

const encoded = computed(() => {
  if (!user.value && !pass.value) return '';
  return utf8btoa(`${user.value}:${pass.value}`);
});

const headerLine = computed(() => encoded.value ? `Authorization: Basic ${encoded.value}` : '');
const curlSnippet = computed(() => {
  if (!encoded.value) return '';
  return `curl -H "Authorization: Basic ${encoded.value}" https://example.com`;
});
const fetchSnippet = computed(() => {
  if (!encoded.value) return '';
  return `fetch('https://example.com', {
  headers: { 'Authorization': 'Basic ${encoded.value}' }
})`;
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">用户名</label>
        <Input v-model="user" placeholder="username" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">密码</label>
        <Input v-model="pass" type="text" placeholder="password" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">Base64 凭证</label>
        <CopyButton :text="encoded" icon-only />
      </div>
      <div class="break-all rounded-md border bg-card px-3 py-2 font-mono text-sm">{{ encoded || '—' }}</div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">Authorization 请求头</label>
        <CopyButton :text="headerLine" icon-only />
      </div>
      <div class="break-all rounded-md border bg-card px-3 py-2 font-mono text-sm">{{ headerLine || '—' }}</div>
    </div>

    <!-- 上下两行：cURL 与 fetch 单独一行展示，避免在窄屏挤成一行难读 -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">cURL</label>
        <CopyButton :text="curlSnippet" icon-only />
      </div>
      <pre class="overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>{{ curlSnippet || '—' }}</code></pre>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">JavaScript fetch</label>
        <CopyButton :text="fetchSnippet" icon-only />
      </div>
      <pre class="overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>{{ fetchSnippet || '—' }}</code></pre>
    </div>

    <p class="text-xs text-muted-foreground">
      Basic Auth 仅做 Base64 编码（不是加密），必须配合 HTTPS 使用，避免凭证在网络中明文传输。
    </p>
  </div>
</template>
