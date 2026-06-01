<script setup lang="ts">
import { ref, computed } from 'vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const NATO: Record<string, string> = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
};

const input = ref('WeTools 2026');

const output = computed(() => {
  return [...input.value.toUpperCase()].map((ch) => {
    if (ch === ' ') return '(Space)';
    if (ch === '\n') return '\n';
    return NATO[ch] ?? ch;
  }).join(' ');
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">原文</label>
        <Textarea v-model="input" :rows="8" placeholder="输入英文字母或数字…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">NATO 字母</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" :rows="8" readonly />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">完整字母表</label>
      <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        <div v-for="(v, k) in NATO" :key="k" class="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm">
          <span class="font-mono font-semibold text-primary">{{ k }}</span>
          <span class="text-muted-foreground">{{ v }}</span>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      NATO 音标字母（ICAO 拼读字母表），用于无线电通讯避免相似字母混淆，如 B / D、M / N。
    </p>
  </div>
</template>
