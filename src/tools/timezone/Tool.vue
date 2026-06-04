<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const localInput = ref(nowLocal());
const newZone = ref('');

const zones = ref<string[]>([
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
]);

const ts = computed(() => {
  const d = new Date(localInput.value);
  return isNaN(d.getTime()) ? null : d;
});

function formatIn(zone: string, d: Date) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'shortOffset',
    }).format(d);
  } catch {
    return '无效时区';
  }
}

function add() {
  const z = newZone.value.trim();
  if (z && !zones.value.includes(z)) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: z });
      zones.value.push(z);
      newZone.value = '';
    } catch {
      newZone.value = '';
    }
  }
}

function remove(z: string) {
  zones.value = zones.value.filter((x) => x !== z);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">本地时间</label>
        <Input v-model="localInput" type="datetime-local" />
      </div>
      <Button variant="outline" size="md" @click="localInput = nowLocal()">填入当前</Button>
      <div class="flex items-end gap-2">
        <div class="flex flex-col gap-1.5">
          <label class="tool-section-title">添加时区</label>
          <Input v-model="newZone" placeholder="如 Asia/Hong_Kong" class="w-56 font-mono" />
        </div>
        <Button variant="primary" size="md" @click="add"><Plus :size="14" />添加</Button>
      </div>
    </div>

    <div v-if="!ts" class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      日期时间格式无效
    </div>

    <ul v-else class="space-y-2">
      <li v-for="z in zones" :key="z" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
        <span class="w-44 shrink-0 font-mono text-xs text-muted-foreground">{{ z }}</span>
        <span class="flex-1 font-mono text-sm">{{ formatIn(z, ts) }}</span>
        <CopyButton :text="formatIn(z, ts)" icon-only />
        <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" @click="remove(z)">
          <X :size="14" />
        </button>
      </li>
    </ul>
  </div>
</template>
