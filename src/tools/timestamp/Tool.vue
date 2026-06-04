<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RefreshCw, Clock } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const tsInput = ref<string>(String(Math.floor(Date.now() / 1000)));
const dateInput = ref<string>(toLocalIso(new Date()));

function toLocalIso(d: Date) {
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function detectUnit(n: number): 's' | 'ms' {
  return Math.abs(n) >= 1e12 ? 'ms' : 's';
}

const tsParsed = computed(() => {
  const n = Number(tsInput.value);
  if (!Number.isFinite(n)) return null;
  const ms = detectUnit(n) === 's' ? n * 1000 : n;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return { d, ms };
});

const tsResults = computed(() => {
  if (!tsParsed.value) return null;
  const { d } = tsParsed.value;
  return {
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toString(),
    rel: relative(d.getTime()),
  };
});

const dateParsed = computed(() => {
  const d = new Date(dateInput.value);
  if (isNaN(d.getTime())) return null;
  return d;
});

function relative(ms: number) {
  const diff = ms - now.value;
  const abs = Math.abs(diff);
  const sec = abs / 1000;
  const sign = diff >= 0 ? '后' : '前';
  if (sec < 60) return Math.floor(sec) + ' 秒' + sign;
  if (sec < 3600) return Math.floor(sec / 60) + ' 分钟' + sign;
  if (sec < 86400) return Math.floor(sec / 3600) + ' 小时' + sign;
  if (sec < 86400 * 30) return Math.floor(sec / 86400) + ' 天' + sign;
  if (sec < 86400 * 365) return Math.floor(sec / 86400 / 30) + ' 个月' + sign;
  return Math.floor(sec / 86400 / 365) + ' 年' + sign;
}

function setNow() {
  tsInput.value = String(Math.floor(now.value / 1000));
  dateInput.value = toLocalIso(new Date(now.value));
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 当前时间 -->
    <section class="rounded-lg border bg-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock :size="16" class="text-primary" />当前时间
        </div>
        <div class="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span class="font-mono text-2xl font-semibold tabular-nums">{{ Math.floor(now / 1000) }}</span>
          <span class="font-mono text-xs text-muted-foreground">{{ now }}ms · {{ new Date(now).toISOString() }}</span>
        </div>
        <Button class="ml-auto" variant="outline" size="sm" @click="setNow">
          <RefreshCw :size="14" />填入当前
        </Button>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 时间戳 → 日期 -->
      <section class="space-y-3 rounded-lg border bg-card p-4">
        <h3 class="tool-section-title">时间戳 → 日期</h3>
        <Input v-model="tsInput" placeholder="支持秒或毫秒，自动识别" />
        <div v-if="tsResults" class="space-y-2 font-mono text-xs">
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">ISO</span><span class="flex-1 break-all">{{ tsResults.iso }}</span><CopyButton :text="tsResults.iso" icon-only /></div>
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">UTC</span><span class="flex-1 break-all">{{ tsResults.utc }}</span><CopyButton :text="tsResults.utc" icon-only /></div>
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">本地</span><span class="flex-1 break-all">{{ tsResults.local }}</span><CopyButton :text="tsResults.local" icon-only /></div>
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">相对</span><span class="text-primary">{{ tsResults.rel }}</span></div>
        </div>
        <p v-else class="text-xs text-destructive">输入不是有效时间戳</p>
      </section>

      <!-- 日期 → 时间戳 -->
      <section class="space-y-3 rounded-lg border bg-card p-4">
        <h3 class="tool-section-title">日期 → 时间戳</h3>
        <Input v-model="dateInput" type="datetime-local" />
        <div v-if="dateParsed" class="space-y-2 font-mono text-xs">
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">秒</span><span class="flex-1">{{ Math.floor(dateParsed.getTime() / 1000) }}</span><CopyButton :text="String(Math.floor(dateParsed.getTime() / 1000))" icon-only /></div>
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">毫秒</span><span class="flex-1">{{ dateParsed.getTime() }}</span><CopyButton :text="String(dateParsed.getTime())" icon-only /></div>
          <div class="flex items-center gap-2"><span class="w-14 shrink-0 text-muted-foreground">ISO</span><span class="flex-1 break-all">{{ dateParsed.toISOString() }}</span><CopyButton :text="dateParsed.toISOString()" icon-only /></div>
        </div>
        <p v-else class="text-xs text-destructive">日期格式无效</p>
      </section>
    </div>
  </div>
</template>
