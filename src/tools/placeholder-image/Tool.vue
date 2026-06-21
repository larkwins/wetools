<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Download, Copy, AlertCircle, RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Fmt = 'svg' | 'png';

const width = ref(600);
const height = ref(400);
const bg = ref('#e2e8f0');
const bg2 = ref('#94a3b8');
const fg = ref('#475569');
const text = ref('');
const useGradient = ref(false);
const fontSize = ref(0); // 0 = 自动
const fmt = ref<Fmt>('svg');
const error = ref('');

const displayText = computed(() => text.value || `${width.value} × ${height.value}`);

// 计算字号：未指定时取较短边的 1/8
const autoFontSize = computed(() => {
  if (fontSize.value > 0) return fontSize.value;
  return Math.max(12, Math.floor(Math.min(width.value, height.value) / 8));
});

/** 生成 SVG 字符串 */
const svgString = computed<string>(() => {
  error.value = '';
  const w = Math.max(1, Math.min(4096, Number(width.value) || 1));
  const h = Math.max(1, Math.min(4096, Number(height.value) || 1));
  const fs = autoFontSize.value;
  const bgFill = useGradient.value
    ? 'url(#g)'
    : escapeAttr(bg.value);
  const txt = escapeXml(displayText.value);
  const fgC = escapeAttr(fg.value);
  const defs = useGradient.value
    ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeAttr(bg.value)}"/><stop offset="100%" stop-color="${escapeAttr(bg2.value)}"/></linearGradient></defs>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<rect width="${w}" height="${h}" fill="${bgFill}"/><text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="${fs}" font-weight="600" fill="${fgC}" text-anchor="middle" dominant-baseline="central">${txt}</text></svg>`;
});

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[c]!);
}
function escapeAttr(s: string): string {
  return s.replace(/["<>]/g, '');
}

const dataUrl = computed<string>(() => {
  // 用 encodeURIComponent 而非 base64，更短
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.value)}`;
});

const cssUrl = computed<string>(() => `url("${dataUrl.value}")`);

// PNG 由 canvas 实时渲染
const pngDataUrl = ref('');
const pngBusy = ref(false);

async function renderPng() {
  pngBusy.value = true;
  try {
    const w = Math.max(1, Math.min(4096, Number(width.value) || 1));
    const h = Math.max(1, Math.min(4096, Number(height.value) || 1));
    const img = new Image();
    img.decoding = 'sync';
    const blob = new Blob([svgString.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('SVG 转 PNG 失败'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 canvas 上下文');
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    pngDataUrl.value = canvas.toDataURL('image/png');
  } catch (e) {
    error.value = (e as Error).message || String(e);
  } finally {
    pngBusy.value = false;
  }
}

// fmt 切到 png 时即时渲染
watch([fmt, svgString], () => {
  if (fmt.value === 'png') void renderPng();
}, { immediate: false });

function downloadSvg() {
  const blob = new Blob([svgString.value], { type: 'image/svg+xml' });
  triggerDownload(URL.createObjectURL(blob), `placeholder-${width.value}x${height.value}.svg`);
}

async function downloadPng() {
  if (!pngDataUrl.value) await renderPng();
  if (!pngDataUrl.value) return;
  triggerDownload(pngDataUrl.value, `placeholder-${width.value}x${height.value}.png`);
}

function triggerDownload(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 配色预设
const presets: Array<{ name: string; bg: string; bg2: string; fg: string }> = [
  { name: '浅灰', bg: '#e2e8f0', bg2: '#94a3b8', fg: '#475569' },
  { name: '深灰', bg: '#334155', bg2: '#0f172a', fg: '#cbd5e1' },
  { name: '翠绿', bg: '#10b981', bg2: '#059669', fg: '#ecfdf5' },
  { name: '海蓝', bg: '#3b82f6', bg2: '#1d4ed8', fg: '#eff6ff' },
  { name: '玫红', bg: '#ec4899', bg2: '#be185d', fg: '#fdf2f8' },
  { name: '琥珀', bg: '#f59e0b', bg2: '#d97706', fg: '#fffbeb' },
  { name: '紫罗兰', bg: '#a855f7', bg2: '#7c3aed', fg: '#faf5ff' },
];

function applyPreset(p: typeof presets[number]) {
  bg.value = p.bg;
  bg2.value = p.bg2;
  fg.value = p.fg;
}

// 常用尺寸预设
const sizes: Array<{ name: string; w: number; h: number }> = [
  { name: '正方', w: 400, h: 400 },
  { name: '横版', w: 800, h: 450 }, // 16:9
  { name: '竖版', w: 450, h: 800 },
  { name: '横幅', w: 1200, h: 300 },
  { name: '头像', w: 200, h: 200 },
  { name: '社交分享', w: 1200, h: 630 },
];

function applySize(s: typeof sizes[number]) {
  width.value = s.w;
  height.value = s.h;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 尺寸 -->
    <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">宽度 (px)</label>
        <Input v-model.number="width" type="number" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">高度 (px)</label>
        <Input v-model.number="height" type="number" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">字号 (0 = 自动)</label>
        <Input v-model.number="fontSize" type="number" />
      </div>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="s in sizes"
        :key="s.name"
        type="button"
        :class="['rounded-md border bg-card px-2.5 py-1 text-[11px] transition-colors',
          width === s.w && height === s.h ? 'border-primary/60 text-primary' : 'text-muted-foreground hover:text-foreground']"
        @click="applySize(s)"
      >{{ s.name }} {{ s.w }}×{{ s.h }}</button>
    </div>

    <!-- 配色 -->
    <div class="grid gap-3 sm:grid-cols-[auto_1fr_1fr_1fr]">
      <label class="flex flex-col gap-1">
        <span class="tool-section-title">渐变</span>
        <div class="inline-flex h-9 items-center rounded-md border bg-card px-2.5">
          <input v-model="useGradient" type="checkbox" class="accent-[hsl(var(--primary))]" />
        </div>
      </label>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">背景色 {{ useGradient ? '①' : '' }}</label>
        <div class="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
          <input v-model="bg" type="color" class="h-6 w-8 cursor-pointer rounded" />
          <Input v-model="bg" class="h-7 flex-1 border-0 bg-transparent" />
        </div>
      </div>
      <div v-if="useGradient" class="flex flex-col gap-1">
        <label class="tool-section-title">背景色 ②</label>
        <div class="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
          <input v-model="bg2" type="color" class="h-6 w-8 cursor-pointer rounded" />
          <Input v-model="bg2" class="h-7 flex-1 border-0 bg-transparent" />
        </div>
      </div>
      <div class="flex flex-col gap-1" :class="!useGradient && 'sm:col-span-2'">
        <label class="tool-section-title">文字色</label>
        <div class="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
          <input v-model="fg" type="color" class="h-6 w-8 cursor-pointer rounded" />
          <Input v-model="fg" class="h-7 flex-1 border-0 bg-transparent" />
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="p in presets"
        :key="p.name"
        type="button"
        :class="['inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] transition-colors hover:text-foreground',
          bg === p.bg && fg === p.fg ? 'border-primary/60 text-primary' : 'text-muted-foreground']"
        @click="applyPreset(p)"
      >
        <span class="h-3 w-3 rounded-sm" :style="{ background: `linear-gradient(135deg, ${p.bg}, ${p.bg2})` }"></span>
        {{ p.name }}
      </button>
    </div>

    <!-- 文字 -->
    <div class="flex flex-col gap-1">
      <label class="tool-section-title">文字（留空使用尺寸）</label>
      <Input v-model="text" :placeholder="`${width} × ${height}`" />
    </div>

    <!-- 预览 -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">预览</label>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="f in (['svg', 'png'] as Fmt[])" :key="f" type="button"
            :class="['h-7 rounded-sm px-2.5 text-[11px] font-medium uppercase', fmt === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="fmt = f"
          >{{ f }}</button>
        </div>
      </div>
      <div class="flex max-h-[500px] items-center justify-center overflow-auto rounded-lg border bg-[linear-gradient(45deg,hsl(var(--muted)/.5)_25%,transparent_25%),linear-gradient(-45deg,hsl(var(--muted)/.5)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,hsl(var(--muted)/.5)_75%),linear-gradient(-45deg,transparent_75%,hsl(var(--muted)/.5)_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4">
        <img :src="dataUrl" :alt="displayText" class="max-w-full" :style="{ maxHeight: '460px' }" data-no-i18n />
      </div>
    </div>

    <!-- 下载 -->
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="primary" @click="downloadSvg">
        <Download :size="14" />下载 SVG
      </Button>
      <Button variant="outline" :disabled="pngBusy" @click="downloadPng">
        <Download :size="14" />{{ pngBusy ? '生成中…' : '下载 PNG' }}
      </Button>
      <Button v-if="fmt === 'png'" variant="ghost" @click="renderPng">
        <RefreshCw :size="14" />重新渲染
      </Button>
    </div>

    <!-- 代码片段：三段各自一行（标题+复制按钮 -> 文本框） -->
    <div class="flex flex-col gap-4">
      <!-- SVG 源码 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">SVG 源码</label>
          <CopyButton :text="svgString" icon-only />
        </div>
        <pre class="max-h-40 overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>{{ svgString }}</code></pre>
      </div>

      <!-- Data URL -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">Data URL（&lt;img src&gt; / CSS background）</label>
          <CopyButton :text="dataUrl" icon-only />
        </div>
        <pre class="max-h-40 overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>{{ dataUrl }}</code></pre>
      </div>

      <!-- CSS background-image -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">CSS background-image</label>
          <CopyButton :text="`background-image: ${cssUrl};`" icon-only />
        </div>
        <pre class="max-h-40 overflow-auto rounded-md border bg-card p-3 font-mono text-xs" data-no-i18n><code>background-image: {{ cssUrl }};</code></pre>
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <p class="text-xs text-muted-foreground">
      在浏览器本地用 SVG 生成，PNG 由 Canvas 实时栅格化下载。无网络请求，无水印。
    </p>
  </div>
</template>
