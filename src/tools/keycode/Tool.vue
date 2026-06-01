<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Keyboard } from 'lucide-vue-next';
import CopyButton from '@/components/ui/CopyButton.vue';

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  repeat: boolean;
  ts: string;
}

const last = ref<KeyInfo | null>(null);
const history = ref<KeyInfo[]>([]);

function onKey(e: KeyboardEvent) {
  // 忽略页面内输入框聚焦时的输入
  const t = e.target as HTMLElement;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  e.preventDefault();
  const info: KeyInfo = {
    key: e.key,
    code: e.code,
    keyCode: e.keyCode,
    which: e.which,
    location: e.location,
    alt: e.altKey,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    meta: e.metaKey,
    repeat: e.repeat,
    ts: new Date().toTimeString().slice(0, 8),
  };
  last.value = info;
  history.value.unshift(info);
  if (history.value.length > 30) history.value.pop();
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

function clearHistory() {
  history.value = [];
  last.value = null;
}

const LOCATION_MAP: Record<number, string> = {
  0: '标准',
  1: '左侧',
  2: '右侧',
  3: '数字键盘',
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg border-2 border-dashed bg-card/40 p-6 text-center">
      <Keyboard :size="32" class="mx-auto mb-2 text-muted-foreground/60" />
      <p class="text-sm text-muted-foreground">按下键盘上的任意按键</p>
    </div>

    <div v-if="last" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border bg-card p-3">
        <p class="text-xs text-muted-foreground">event.key</p>
        <div class="mt-1 flex items-center gap-2">
          <code class="flex-1 font-mono text-lg font-semibold text-primary">{{ last.key === ' ' ? '(Space)' : last.key }}</code>
          <CopyButton :text="last.key" icon-only />
        </div>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <p class="text-xs text-muted-foreground">event.code</p>
        <div class="mt-1 flex items-center gap-2">
          <code class="flex-1 font-mono text-base text-foreground">{{ last.code }}</code>
          <CopyButton :text="last.code" icon-only />
        </div>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <p class="text-xs text-muted-foreground">event.keyCode</p>
        <code class="mt-1 block font-mono text-base text-foreground">{{ last.keyCode }}</code>
      </div>
      <div class="rounded-lg border bg-card p-3">
        <p class="text-xs text-muted-foreground">event.which</p>
        <code class="mt-1 block font-mono text-base text-foreground">{{ last.which }}</code>
      </div>
    </div>

    <div v-if="last" class="flex flex-wrap items-center gap-2 text-xs">
      <span class="rounded-full border px-2 py-0.5 text-muted-foreground">location: {{ LOCATION_MAP[last.location] ?? last.location }}</span>
      <span v-if="last.alt" class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Alt</span>
      <span v-if="last.ctrl" class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Ctrl</span>
      <span v-if="last.shift" class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Shift</span>
      <span v-if="last.meta" class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Meta (⌘)</span>
      <span v-if="last.repeat" class="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400">Repeat</span>
    </div>

    <div v-if="history.length" class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">历史记录</label>
        <button type="button" class="text-xs text-muted-foreground hover:text-destructive" @click="clearHistory">清空</button>
      </div>
      <div class="max-h-72 overflow-y-auto rounded-lg border bg-card font-mono text-xs">
        <div v-for="(h, i) in history" :key="i" class="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 border-b border-border/50 px-3 py-1.5 last:border-0">
          <span class="text-muted-foreground/70">{{ h.ts }}</span>
          <span class="text-primary">{{ h.key === ' ' ? '(Space)' : h.key }}</span>
          <span class="text-foreground">{{ h.code }}</span>
          <span class="text-muted-foreground">{{ h.keyCode }}</span>
          <span class="text-muted-foreground">{{ h.shift ? '⇧' : '' }}{{ h.ctrl ? '⌃' : '' }}{{ h.alt ? '⌥' : '' }}{{ h.meta ? '⌘' : '' }}</span>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      注意：现代代码应使用 <code class="font-mono">event.key</code>（语义）或 <code class="font-mono">event.code</code>（物理位置），<code class="font-mono">keyCode / which</code> 已废弃。
    </p>
  </div>
</template>
