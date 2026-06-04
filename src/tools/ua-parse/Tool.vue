<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { UAParser } from 'ua-parser-js';

const ua = ref('');

onMounted(() => {
  if (!ua.value) ua.value = navigator.userAgent;
});

const parsed = computed(() => {
  try {
    const p = new UAParser(ua.value);
    return {
      browser: p.getBrowser(),
      engine: p.getEngine(),
      os: p.getOS(),
      device: p.getDevice(),
      cpu: p.getCPU(),
    };
  } catch {
    return null;
  }
});

function fillCurrent() {
  ua.value = navigator.userAgent;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">User-Agent</label>
        <Button variant="ghost" size="sm" @click="fillCurrent"><RefreshCw :size="14" />使用当前浏览器</Button>
      </div>
      <Textarea v-model="ua" mono :rows="4" />
    </div>

    <div v-if="parsed" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(v, k) in parsed" :key="k" class="rounded-lg border bg-card p-4">
        <p class="tool-section-title">{{ k }}</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li v-for="(val, key) in v" :key="key" class="flex items-center gap-2">
            <span class="w-20 shrink-0 font-mono text-xs text-muted-foreground">{{ key }}</span>
            <span class="flex-1 font-mono">{{ val ?? '—' }}</span>
            <CopyButton v-if="val" :text="String(val)" icon-only />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
