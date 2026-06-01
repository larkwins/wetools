<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RefreshCw, AlertCircle, Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const query = ref('');
const data = ref<Record<string, any> | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

async function lookup(target = '') {
  loading.value = true;
  error.value = null;
  data.value = null;
  const url = target ? `https://ipapi.co/${encodeURIComponent(target)}/json/` : 'https://ipapi.co/json/';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (json.error) throw new Error(json.reason || 'API 返回错误');
    data.value = json;
  } catch (e) {
    error.value = '查询失败：' + (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => lookup());

function fields(d: Record<string, any>) {
  const list: { k: string; v: string }[] = [
    { k: 'IP', v: d.ip },
    { k: '版本', v: d.version },
    { k: '国家', v: `${d.country_name ?? ''} (${d.country_code ?? ''})` },
    { k: '地区', v: d.region },
    { k: '城市', v: d.city },
    { k: '邮编', v: d.postal },
    { k: '经纬度', v: `${d.latitude}, ${d.longitude}` },
    { k: '时区', v: d.timezone },
    { k: 'UTC 偏移', v: d.utc_offset },
    { k: '运营商', v: d.org },
    { k: 'ASN', v: d.asn },
    { k: '货币', v: `${d.currency} (${d.currency_name})` },
    { k: '语言', v: d.languages },
  ];
  return list.filter((x) => x.v && x.v !== 'undefined' && x.v !== 'null (null)');
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <form class="flex items-center gap-2" @submit.prevent="lookup(query)">
      <div class="relative flex-1">
        <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="query" placeholder="留空查询本机；或输入指定 IP" class="pl-9 font-mono" />
      </div>
      <Button type="submit" variant="primary" :disabled="loading">
        <RefreshCw :size="14" />查询
      </Button>
    </form>

    <p v-if="loading" class="text-sm text-muted-foreground">查询中…</p>
    <p v-if="error" class="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle :size="14" />{{ error }}
    </p>

    <div v-if="data" class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <ul class="space-y-1">
        <li v-for="f in fields(data)" :key="f.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
          <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ f.k }}</span>
          <span class="flex-1 truncate font-mono text-sm">{{ f.v }}</span>
          <CopyButton :text="String(f.v)" icon-only />
        </li>
      </ul>

      <div class="rounded-lg border bg-card p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-muted-foreground">原始 JSON</p>
          <CopyButton :text="JSON.stringify(data, null, 2)" icon-only />
        </div>
        <pre class="code-area mt-2 overflow-auto text-[11px] leading-5">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
