<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle, SearchCheck } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { OUI_DB, OUI_COUNT } from './oui';

const input = ref('B8:27:EB:12:34:56');

function normalize(s: string): string {
  return s.toUpperCase().replace(/[^0-9A-F]/g, '');
}

const parsed = computed(() => {
  const hex = normalize(input.value);
  if (hex.length < 6) return null;
  const oui = `${hex.slice(0, 2)}-${hex.slice(2, 4)}-${hex.slice(4, 6)}`;
  const vendor = OUI_DB[oui] ?? null;
  // 解析全 MAC（如果输入了完整 12 位）
  let formatted: string | null = null;
  if (hex.length === 12) {
    formatted = hex.match(/.{2}/g)!.join(':');
  }
  // 第一字节判断单播/组播 与 本地/全局
  const firstByte = parseInt(hex.slice(0, 2), 16);
  const multicast = (firstByte & 0x01) === 1;
  const local = (firstByte & 0x02) === 2;
  return { oui, vendor, formatted, multicast, local };
});

const examples = [
  { mac: 'B8:27:EB:00:00:01', label: 'Raspberry Pi' },
  { mac: '3C:5A:B4:00:00:01', label: 'Google Nest' },
  { mac: '24:0A:C4:00:00:01', label: 'ESP32' },
  { mac: '00-25-9E-00-00-01', label: 'Huawei' },
  { mac: 'F4F5D800000A', label: 'Google (无分隔)' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="tool-section-title">MAC 地址</label>
      <Input v-model="input" placeholder="格式不限：00:11:22, 00-11-22, 001122…" class="font-mono text-base uppercase" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button v-for="e in examples" :key="e.mac" type="button"
        class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
        @click="input = e.mac"
      >
        <code class="font-mono text-foreground">{{ e.mac.slice(0, 8) }}…</code>
        <span>{{ e.label }}</span>
      </button>
    </div>

    <div v-if="!parsed" class="rounded-md border border-dashed bg-card/40 p-6 text-center text-sm text-muted-foreground">
      请至少输入 MAC 地址的前 6 位（OUI）
    </div>

    <div v-else class="grid gap-2">
      <div class="flex items-center gap-3 rounded-lg border bg-card p-3">
        <SearchCheck :size="16" :class="parsed.vendor ? 'text-emerald-500' : 'text-muted-foreground/50'" />
        <span class="w-20 text-xs text-muted-foreground">OUI</span>
        <code class="flex-1 font-mono text-sm font-semibold">{{ parsed.oui }}</code>
        <CopyButton :text="parsed.oui" icon-only />
      </div>
      <div class="flex items-center gap-3 rounded-lg border bg-card p-3">
        <span class="w-20 text-xs text-muted-foreground">厂商</span>
        <span v-if="parsed.vendor" class="flex-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">{{ parsed.vendor }}</span>
        <span v-else class="flex-1 text-sm text-muted-foreground">
          未在本地 OUI 库中找到（本地共 {{ OUI_COUNT }} 条，覆盖主流厂商）
        </span>
        <CopyButton v-if="parsed.vendor" :text="parsed.vendor" icon-only />
      </div>
      <div v-if="parsed.formatted" class="flex items-center gap-3 rounded-lg border bg-card p-3">
        <span class="w-20 text-xs text-muted-foreground">完整 MAC</span>
        <code class="flex-1 font-mono text-sm">{{ parsed.formatted }}</code>
        <CopyButton :text="parsed.formatted" icon-only />
      </div>
      <div class="flex items-center gap-3 rounded-lg border bg-card p-3 text-xs">
        <span class="w-20 text-muted-foreground">类型</span>
        <span :class="parsed.multicast ? 'text-amber-500' : 'text-emerald-500'">{{ parsed.multicast ? '组播 (multicast)' : '单播 (unicast)' }}</span>
        <span class="text-muted-foreground/40">·</span>
        <span :class="parsed.local ? 'text-amber-500' : 'text-emerald-500'">{{ parsed.local ? '本地管理 (locally administered)' : '全局唯一 (globally unique)' }}</span>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      MAC 前 24 位是 OUI（IEEE 分配的厂商唯一标识）。本地 OUI 库覆盖主流厂商 ~{{ OUI_COUNT }} 条；完整库 ~30000 条可访问 IEEE 官网。
    </p>
  </div>
</template>
