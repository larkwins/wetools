<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Gamepad2 } from 'lucide-vue-next';

interface PadState {
  index: number;
  id: string;
  connected: boolean;
  buttons: Array<{ pressed: boolean; value: number }>;
  axes: number[];
  vibration: boolean;
}

const pads = ref<PadState[]>([]);
let raf = 0;

function poll() {
  const gps = navigator.getGamepads?.() ?? [];
  pads.value = Array.from(gps).filter(Boolean).map((g) => ({
    index: g!.index,
    id: g!.id,
    connected: g!.connected,
    buttons: g!.buttons.map((b) => ({ pressed: b.pressed, value: b.value })),
    axes: Array.from(g!.axes),
    vibration: !!g!.vibrationActuator,
  }));
  raf = requestAnimationFrame(poll);
}

onMounted(() => {
  raf = requestAnimationFrame(poll);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));

// 标准手柄按钮名（Xbox 风格）
const BUTTON_NAMES = [
  'A', 'B', 'X', 'Y',
  'LB', 'RB', 'LT', 'RT',
  'Back', 'Start', 'LS', 'RS',
  'D↑', 'D↓', 'D←', 'D→',
  'Home',
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="pads.length === 0" class="rounded-lg border border-dashed bg-card/40 p-8 text-center">
      <Gamepad2 :size="40" class="mx-auto mb-3 text-muted-foreground/60" />
      <p class="text-sm text-muted-foreground">未检测到手柄</p>
      <p class="mt-1 text-xs text-muted-foreground">请连接手柄后<strong>按下任意按钮</strong>以激活检测</p>
    </div>

    <section v-for="p in pads" :key="p.index" class="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground">手柄 #{{ p.index }}</h3>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>已连接
        </span>
      </div>
      <p class="font-mono text-xs text-muted-foreground">{{ p.id }}</p>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">按键 ({{ p.buttons.length }})</label>
        <div class="grid grid-cols-6 gap-1.5 sm:grid-cols-9 lg:grid-cols-12">
          <div v-for="(b, i) in p.buttons" :key="i"
            :class="['flex flex-col items-center gap-0.5 rounded-md border bg-background p-1.5 text-xs transition-colors',
              b.pressed ? 'border-primary bg-primary/20 text-primary' : 'text-muted-foreground']"
          >
            <span class="font-mono text-[10px]">{{ BUTTON_NAMES[i] ?? i }}</span>
            <span v-if="b.value > 0 && b.value < 1" class="font-mono text-[9px]">{{ b.value.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">摇杆 / 扳机 ({{ p.axes.length }})</label>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="(a, i) in p.axes" :key="i" class="rounded-md border bg-background p-2">
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-muted-foreground">Axis {{ i }}</span>
              <span class="font-mono font-semibold" :class="Math.abs(a) > 0.1 ? 'text-primary' : 'text-foreground/60'">{{ a.toFixed(3) }}</span>
            </div>
            <div class="relative mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div class="absolute top-0 h-full bg-primary"
                :style="{
                  left: a < 0 ? `${50 + a * 50}%` : '50%',
                  width: `${Math.abs(a) * 50}%`,
                }"></div>
              <div class="absolute left-1/2 top-0 h-full w-px bg-muted-foreground/40"></div>
            </div>
          </div>
        </div>
        <div v-if="p.axes.length >= 4" class="grid grid-cols-2 gap-4">
          <!-- 左摇杆可视化 -->
          <div class="flex flex-col items-center gap-1">
            <div class="relative h-32 w-32 rounded-full border bg-secondary/30">
              <div class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-transform"
                :style="{ transform: `translate(calc(-50% + ${p.axes[0] * 50}px), calc(-50% + ${p.axes[1] * 50}px))` }"></div>
            </div>
            <span class="text-xs text-muted-foreground">左摇杆</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="relative h-32 w-32 rounded-full border bg-secondary/30">
              <div class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-transform"
                :style="{ transform: `translate(calc(-50% + ${(p.axes[2] || 0) * 50}px), calc(-50% + ${(p.axes[3] || 0) * 50}px))` }"></div>
            </div>
            <span class="text-xs text-muted-foreground">右摇杆</span>
          </div>
        </div>
      </div>

      <p v-if="p.vibration" class="text-xs text-emerald-600 dark:text-emerald-400">✓ 支持震动</p>
    </section>

    <p class="text-xs text-muted-foreground">
      使用 Gamepad API。注意：浏览器要求<strong>按下任意键后</strong>才会出现在 navigator.getGamepads()，这是出于隐私考虑。
    </p>
  </div>
</template>
