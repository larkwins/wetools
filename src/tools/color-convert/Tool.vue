<script setup lang="ts">
import { ref, computed } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const input = ref('#10B981');

type RGB = { r: number; g: number; b: number; a: number };

function parse(s: string): RGB | null {
  const v = s.trim().toLowerCase();
  // hex
  let m = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(v);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) {
      h = h.split('').map((c) => c + c).join('');
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  // rgb / rgba
  m = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const r = +parts[0], g = +parts[1], b = +parts[2];
      const a = parts[3] !== undefined ? (parts[3].endsWith('%') ? +parts[3].slice(0, -1) / 100 : +parts[3]) : 1;
      if ([r, g, b].every((n) => n >= 0 && n <= 255)) return { r, g, b, a };
    }
  }
  // hsl / hsla
  m = /^hsla?\(([^)]+)\)$/i.exec(v);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const h = +parts[0];
      const s = +parts[1].replace('%', '') / 100;
      const l = +parts[2].replace('%', '') / 100;
      const a = parts[3] !== undefined ? (parts[3].endsWith('%') ? +parts[3].slice(0, -1) / 100 : +parts[3]) : 1;
      const rgb = hslToRgb(h, s, l);
      return { ...rgb, a };
    }
  }
  return null;
}

function hslToRgb(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (d) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) };
}

const parsed = computed(() => parse(input.value));

const out = computed(() => {
  if (!parsed.value) return null;
  const { r, g, b, a } = parsed.value;
  const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  const hexA = '#' + [r, g, b, Math.round(a * 255)].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  return {
    hex,
    hexA,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${+a.toFixed(2)})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${+a.toFixed(2)})`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    css: `${hex}`,
    preview: `rgba(${r}, ${g}, ${b}, ${a})`,
  };
});

function pick(c: string) {
  input.value = c;
}
const swatches = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0A0A0A', '#FAFAFA'];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
      <section class="space-y-3 rounded-lg border bg-card p-4">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">输入颜色</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="out?.hex ?? '#000000'"
            class="h-10 w-12 cursor-pointer rounded-md border bg-card"
            @input="input = ($event.target as HTMLInputElement).value"
          />
          <Input v-model="input" class="font-mono" placeholder="#10B981 / rgb(...) / hsl(...)" />
        </div>
        <div
          class="flex h-32 items-center justify-center rounded-md border font-mono text-xs"
          :style="{ background: out?.preview ?? 'transparent' }"
        >
          <span class="rounded bg-background/80 px-2 py-1 text-foreground backdrop-blur">{{ out?.hex ?? '无效' }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="s in swatches" :key="s" type="button"
            class="h-7 w-7 rounded-md border ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :style="{ background: s }"
            :title="s"
            @click="pick(s)"
          />
        </div>
      </section>

      <section v-if="out" class="grid grid-cols-1 gap-2">
        <div v-for="i in [
          { k:'HEX', v: out.hex }, { k:'HEX (alpha)', v: out.hexA },
          { k:'RGB', v: out.rgb }, { k:'RGBA', v: out.rgba },
          { k:'HSL', v: out.hsl }, { k:'HSLA', v: out.hsla },
          { k:'HSV', v: out.hsv },
        ]" :key="i.k" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
          <span class="w-24 shrink-0 font-mono text-xs text-muted-foreground">{{ i.k }}</span>
          <span class="flex-1 truncate font-mono text-sm">{{ i.v }}</span>
          <CopyButton :text="i.v" icon-only />
        </div>
      </section>
      <section v-else class="flex items-center justify-center rounded-md border border-dashed text-sm text-destructive">
        无法解析的颜色：{{ input }}
      </section>
    </div>
  </div>
</template>
