<script setup lang="ts">
import { ref, computed } from 'vue';
import { Trash2, Plus } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref('https://wetools.cc:443/tools/url-parse?lang=zh&q=hello%20world&utm_source=demo#section-1');

interface Param { key: string; value: string }

interface Parsed {
  ok: true;
  url: URL;
  params: Param[];
}
interface ParseError { ok: false; error: string }

const parsed = computed<Parsed | ParseError>(() => {
  try {
    const u = new URL(input.value);
    const params: Param[] = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return { ok: true, url: u, params };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
});

const params = ref<Param[]>([]);
// 当 parsed 变化时同步可编辑参数列表
import { watch } from 'vue';
watch(
  parsed,
  (p) => {
    if (p.ok) params.value = p.params.map((x) => ({ ...x }));
  },
  { immediate: true }
);

function rebuild() {
  if (!parsed.value.ok) return;
  const u = new URL(parsed.value.url.toString());
  u.search = '';
  for (const p of params.value) if (p.key) u.searchParams.set(p.key, p.value);
  input.value = u.toString();
}

function addParam() {
  params.value.push({ key: '', value: '' });
}
function removeParam(i: number) {
  params.value.splice(i, 1);
  rebuild();
}

const parts = computed(() => {
  if (!parsed.value.ok) return null;
  const u = parsed.value.url;
  return [
    { k: 'protocol', v: u.protocol },
    { k: 'host', v: u.host },
    { k: 'hostname', v: u.hostname },
    { k: 'port', v: u.port || '(default)' },
    { k: 'pathname', v: u.pathname },
    { k: 'search', v: u.search || '(none)' },
    { k: 'hash', v: u.hash || '(none)' },
    { k: 'origin', v: u.origin },
  ];
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">URL</label>
      <div class="flex gap-2">
        <Input v-model="input" class="flex-1 font-mono" />
        <CopyButton :text="input" />
      </div>
    </div>

    <div v-if="!parsed.ok" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      {{ parsed.error }}
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <section>
        <h3 class="mb-2 tool-section-title">组件</h3>
        <div class="space-y-1">
          <div v-for="p in parts" :key="p.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-1.5">
            <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ p.k }}</span>
            <span class="flex-1 truncate font-mono text-sm">{{ p.v }}</span>
            <CopyButton :text="String(p.v)" icon-only />
          </div>
        </div>
      </section>

      <section>
        <div class="mb-2 flex items-center justify-between">
          <h3 class="tool-section-title">查询参数</h3>
          <Button variant="ghost" size="sm" @click="addParam">
            <Plus :size="14" />新增
          </Button>
        </div>
        <ul class="space-y-2">
          <li v-for="(p, i) in params" :key="i" class="flex items-center gap-2">
            <Input v-model="p.key" placeholder="key" class="flex-1 font-mono" @blur="rebuild" />
            <Input v-model="p.value" placeholder="value" class="flex-[2] font-mono" @blur="rebuild" />
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="删除"
              @click="removeParam(i)"
            >
              <Trash2 :size="14" />
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
