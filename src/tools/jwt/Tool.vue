<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldlVG9vbHMgVXNlciIsImlhdCI6MTcxNjAwMDAwMCwiZXhwIjoxOTk5OTk5OTk5fQ.3M-D7C9KQwx-eDh1fFx7p8B2yZx2lPq2HfZgM6vKxXk'
);

function b64urlDecode(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(u8);
}

interface Decoded {
  header: any;
  payload: any;
  signature: string;
  raw: { h: string; p: string; s: string };
}

const decoded = computed<Decoded | { error: string }>(() => {
  const t = input.value.trim();
  const parts = t.split('.');
  if (parts.length !== 3) return { error: 'JWT 必须包含 3 段（用 . 分隔）' };
  try {
    return {
      header: JSON.parse(b64urlDecode(parts[0])),
      payload: JSON.parse(b64urlDecode(parts[1])),
      signature: parts[2],
      raw: { h: parts[0], p: parts[1], s: parts[2] },
    };
  } catch (e) {
    return { error: 'Base64Url 或 JSON 解析失败：' + (e as Error).message };
  }
});

function fmt(d: any) {
  return JSON.stringify(d, null, 2);
}

function relTime(ts: number) {
  const ms = ts * 1000;
  const diff = ms - Date.now();
  const abs = Math.abs(diff) / 1000;
  const sign = diff >= 0 ? '后' : '前';
  if (abs < 60) return `${Math.floor(abs)} 秒${sign}`;
  if (abs < 3600) return `${Math.floor(abs / 60)} 分${sign}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)} 小时${sign}`;
  return `${Math.floor(abs / 86400)} 天${sign}`;
}

const claims = computed(() => {
  if ('error' in decoded.value) return null;
  const p = decoded.value.payload;
  const arr: { k: string; v: string; hint?: string }[] = [];
  if (p.iat) arr.push({ k: 'iat (签发时间)', v: new Date(p.iat * 1000).toLocaleString(), hint: relTime(p.iat) });
  if (p.exp) arr.push({ k: 'exp (过期时间)', v: new Date(p.exp * 1000).toLocaleString(), hint: relTime(p.exp) });
  if (p.nbf) arr.push({ k: 'nbf (生效时间)', v: new Date(p.nbf * 1000).toLocaleString(), hint: relTime(p.nbf) });
  if (p.iss) arr.push({ k: 'iss (签发者)', v: String(p.iss) });
  if (p.aud) arr.push({ k: 'aud (受众)', v: String(p.aud) });
  if (p.sub) arr.push({ k: 'sub (主体)', v: String(p.sub) });
  if (p.jti) arr.push({ k: 'jti (Token ID)', v: String(p.jti) });
  return arr;
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">JWT</label>
      <Textarea v-model="input" mono :rows="4" placeholder="粘贴 JWT…" />
      <p v-if="'error' in decoded" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ decoded.error }}
      </p>
    </div>

    <template v-if="!('error' in decoded)">
      <!-- 三段彩色结构 -->
      <div class="rounded-lg border bg-card p-4 font-mono text-xs leading-6 break-all">
        <span class="text-destructive">{{ decoded.raw.h }}</span>
        <span class="text-muted-foreground">.</span>
        <span class="text-info">{{ decoded.raw.p }}</span>
        <span class="text-muted-foreground">.</span>
        <span class="text-primary">{{ decoded.raw.s }}</span>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <section>
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-destructive">Header</h3>
            <CopyButton :text="fmt(decoded.header)" icon-only />
          </div>
          <Textarea :model-value="fmt(decoded.header)" mono :rows="6" readonly />
        </section>
        <section>
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-info">Payload</h3>
            <CopyButton :text="fmt(decoded.payload)" icon-only />
          </div>
          <Textarea :model-value="fmt(decoded.payload)" mono :rows="6" readonly />
        </section>
      </div>

      <section v-if="claims && claims.length" class="rounded-lg border bg-card p-4">
        <h3 class="mb-3 tool-section-title">标准声明</h3>
        <ul class="space-y-1.5 text-sm">
          <li v-for="c in claims" :key="c.k" class="flex items-center gap-3">
            <span class="w-32 shrink-0 font-mono text-xs text-muted-foreground">{{ c.k }}</span>
            <span class="flex-1">{{ c.v }}</span>
            <span v-if="c.hint" class="font-mono text-xs text-primary">{{ c.hint }}</span>
          </li>
        </ul>
      </section>
    </template>

    <p class="text-xs text-muted-foreground">
      本工具只解码不验证签名（验签需要服务端密钥）。粘贴线上 token 时请注意泄漏风险。
    </p>
  </div>
</template>
