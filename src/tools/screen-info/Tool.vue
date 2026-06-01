<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import CopyButton from '@/components/ui/CopyButton.vue';

interface Info {
  // 屏幕
  screenW: number;
  screenH: number;
  availW: number;
  availH: number;
  colorDepth: number;
  pixelDepth: number;
  orientation: string;
  // 像素
  dpr: number;
  // 视口
  viewportW: number;
  viewportH: number;
  innerW: number;
  innerH: number;
  // 浏览器
  ua: string;
  language: string;
  languages: string;
  online: boolean;
  cookieEnabled: boolean;
  // 设备
  cores: number;
  memory: string;
  platform: string;
  // 色域 / 主题
  colorGamut: string;
  prefersDark: boolean;
  prefersReducedMotion: boolean;
  prefersContrast: string;
  // 网络
  connection: string;
}

const info = ref<Info | null>(null);

function detectColorGamut(): string {
  if (matchMedia('(color-gamut: rec2020)').matches) return 'rec2020';
  if (matchMedia('(color-gamut: p3)').matches) return 'P3';
  if (matchMedia('(color-gamut: srgb)').matches) return 'sRGB';
  return 'unknown';
}

function detectContrast(): string {
  if (matchMedia('(prefers-contrast: more)').matches) return 'more';
  if (matchMedia('(prefers-contrast: less)').matches) return 'less';
  if (matchMedia('(prefers-contrast: custom)').matches) return 'custom';
  return 'no-preference';
}

function detectConnection(): string {
  const c = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
  if (!c) return '未提供';
  const parts: string[] = [];
  if (c.effectiveType) parts.push(c.effectiveType);
  if (c.downlink) parts.push(`${c.downlink} Mbps`);
  if (c.rtt) parts.push(`RTT ${c.rtt}ms`);
  if (c.saveData) parts.push('Save-Data');
  return parts.join(' · ') || '未提供';
}

function refresh() {
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  info.value = {
    screenW: screen.width,
    screenH: screen.height,
    availW: screen.availWidth,
    availH: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type ?? 'unknown',
    dpr: window.devicePixelRatio,
    viewportW: document.documentElement.clientWidth,
    viewportH: document.documentElement.clientHeight,
    innerW: window.innerWidth,
    innerH: window.innerHeight,
    ua: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages.join(', '),
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    cores: navigator.hardwareConcurrency,
    memory: mem ? `${mem} GB` : '未提供',
    platform: navigator.platform,
    colorGamut: detectColorGamut(),
    prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersContrast: detectContrast(),
    connection: detectConnection(),
  };
}

function onResize() { refresh(); }

onMounted(() => {
  refresh();
  window.addEventListener('resize', onResize);
});
onBeforeUnmount(() => window.removeEventListener('resize', onResize));

const groups = [
  {
    title: '屏幕物理',
    keys: [
      { l: '屏幕分辨率', k: 'screenWxH', fmt: (i: Info) => `${i.screenW} × ${i.screenH}` },
      { l: '可用区域', k: 'availWxH', fmt: (i: Info) => `${i.availW} × ${i.availH}` },
      { l: '色深', k: 'colorDepth', fmt: (i: Info) => `${i.colorDepth} bit` },
      { l: '像素深度', k: 'pixelDepth', fmt: (i: Info) => `${i.pixelDepth} bit` },
      { l: '方向', k: 'orientation', fmt: (i: Info) => i.orientation },
      { l: 'DPR (设备像素比)', k: 'dpr', fmt: (i: Info) => String(i.dpr) },
      { l: '色域', k: 'colorGamut', fmt: (i: Info) => i.colorGamut },
    ],
  },
  {
    title: '窗口 / 视口',
    keys: [
      { l: 'innerWidth × innerHeight', k: 'innerWxH', fmt: (i: Info) => `${i.innerW} × ${i.innerH}` },
      { l: '文档视口', k: 'viewportWxH', fmt: (i: Info) => `${i.viewportW} × ${i.viewportH}` },
      { l: '物理像素 (innerW × DPR)', k: 'physWxH', fmt: (i: Info) => `${Math.round(i.innerW * i.dpr)} × ${Math.round(i.innerH * i.dpr)}` },
    ],
  },
  {
    title: '浏览器 / 系统',
    keys: [
      { l: 'User-Agent', k: 'ua', fmt: (i: Info) => i.ua },
      { l: '平台', k: 'platform', fmt: (i: Info) => i.platform },
      { l: '首选语言', k: 'language', fmt: (i: Info) => i.language },
      { l: '所有语言', k: 'languages', fmt: (i: Info) => i.languages },
      { l: '在线', k: 'online', fmt: (i: Info) => i.online ? '是' : '否' },
      { l: 'Cookie 启用', k: 'cookieEnabled', fmt: (i: Info) => i.cookieEnabled ? '是' : '否' },
      { l: 'CPU 逻辑核心', k: 'cores', fmt: (i: Info) => String(i.cores) },
      { l: '设备内存', k: 'memory', fmt: (i: Info) => i.memory },
      { l: '网络', k: 'connection', fmt: (i: Info) => i.connection },
    ],
  },
  {
    title: '主题 / 偏好',
    keys: [
      { l: '偏好深色模式', k: 'prefersDark', fmt: (i: Info) => i.prefersDark ? '是' : '否' },
      { l: '偏好减少动画', k: 'prefersReducedMotion', fmt: (i: Info) => i.prefersReducedMotion ? '是' : '否' },
      { l: '偏好对比度', k: 'prefersContrast', fmt: (i: Info) => i.prefersContrast },
    ],
  },
];
</script>

<template>
  <div v-if="info" class="flex flex-col gap-4">
    <section v-for="g in groups" :key="g.title" class="flex flex-col gap-2">
      <h3 class="text-sm font-semibold text-foreground">{{ g.title }}</h3>
      <div class="grid gap-1.5 sm:grid-cols-2">
        <div v-for="row in g.keys" :key="row.k" class="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
          <span class="w-40 flex-none text-xs text-muted-foreground">{{ row.l }}</span>
          <code class="flex-1 break-all font-mono text-xs text-foreground">{{ row.fmt(info) }}</code>
          <CopyButton :text="row.fmt(info)" icon-only />
        </div>
      </div>
    </section>

    <p class="text-xs text-muted-foreground">调整浏览器窗口大小可实时更新视口数据。所有信息在浏览器本地读取，未上传。</p>
  </div>
</template>
