<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Download, Upload, AlertCircle, QrCode, ScanLine, Palette, X } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { generateQRCode, downloadQRCode, QR_TEMPLATES } from '@/lib/qrcode';
import type { QREcLevel, QRTemplate } from '@/lib/qrcode';

type Tab = 'generate' | 'decode';
const tab = ref<Tab>('generate');

// ============ 生成 ============
const text        = ref('https://wetools.cc');
const ecLevel     = ref<QREcLevel>('M');
const size        = ref(400);
const template    = ref<QRTemplate>('water');
const fgColor     = ref('#000000');
const bgColor     = ref('#ffffff');
const innerColor  = ref('');
const outerColor  = ref('');
const useGradient = ref(false);
const fgColor2    = ref('#6366f1');
const logo        = ref('');
const logoName    = ref('');
const dataUrl     = ref('');
const genError    = ref<string | null>(null);
const generating  = ref(false);

// 前景色最终值：单色或渐变逗号拼接
function buildFgColor() {
  if (useGradient.value) return `${fgColor.value},${fgColor2.value}`;
  return fgColor.value;
}

async function regen() {
  if (!text.value) { dataUrl.value = ''; return; }
  generating.value = true;
  genError.value = null;
  try {
    dataUrl.value = await generateQRCode({
      value:           text.value,
      size:            size.value,
      level:           ecLevel.value,
      template:        template.value,
      foregroundColor: buildFgColor(),
      backgroundColor: bgColor.value,
      innerColor:      innerColor.value,
      outerColor:      outerColor.value,
      logo:            logo.value,
    });
  } catch (e) {
    genError.value = (e as Error).message;
  } finally {
    generating.value = false;
  }
}

watch([text, ecLevel, size, template, fgColor, bgColor, innerColor, outerColor, useGradient, fgColor2, logo], regen);
onMounted(() => { if (tab.value === 'generate') regen(); });
watch(tab, (v) => { if (v === 'generate' && !dataUrl.value) regen(); });

function onLogoFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  logoName.value = file.name;
  const reader = new FileReader();
  reader.onload = () => { logo.value = reader.result as string; };
  reader.readAsDataURL(file);
}

function clearLogo() {
  logo.value = '';
  logoName.value = '';
}

function onDownload() {
  downloadQRCode(dataUrl.value, 'qrcode.png');
}

// ============ 识别 ============
const result     = ref('');
const decError   = ref<string | null>(null);
const previewUrl = ref('');
const busy       = ref(false);

async function decode(file: File) {
  busy.value = true;
  decError.value = null;
  result.value = '';
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);

  try {
    const img = new Image();
    img.src = previewUrl.value;
    await new Promise((r, j) => {
      img.onload = () => r(null);
      img.onerror = () => j(new Error('图片加载失败'));
    });
    const canvas = document.createElement('canvas');
    const max = 1200;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const jsQR = (await import('jsqr')).default;
    const code = jsQR(data.data, data.width, data.height);
    if (code) {
      result.value = code.data;
    } else {
      decError.value = '未识别到二维码，可尝试更清晰、更居中的图片';
    }
  } catch (e) {
    decError.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) decode(f);
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) decode(f);
}
async function onPaste(e: ClipboardEvent) {
  if (tab.value !== 'decode') return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const f = item.getAsFile();
      if (f) decode(f);
      break;
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-4" @paste="onPaste">
    <!-- Tab 切换 -->
    <div class="inline-flex self-start rounded-md border bg-card p-0.5">
      <button
        type="button"
        :class="['inline-flex h-9 items-center gap-1.5 rounded-sm px-4 text-sm transition-colors',
          tab === 'generate' ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground']"
        @click="tab = 'generate'"
      >
        <QrCode :size="14" />生成
      </button>
      <button
        type="button"
        :class="['inline-flex h-9 items-center gap-1.5 rounded-sm px-4 text-sm transition-colors',
          tab === 'decode' ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground']"
        @click="tab = 'decode'"
      >
        <ScanLine :size="14" />识别
      </button>
    </div>

    <!-- ============ 生成 ============ -->
    <div v-show="tab === 'generate'" class="grid gap-4 lg:grid-cols-[1fr_auto]">
      <section class="space-y-4">
        <!-- 内容 -->
        <div class="flex flex-col gap-2">
          <label class="tool-section-title">内容</label>
          <Textarea v-model="text" :rows="4" placeholder="输入文字或链接…" />
        </div>

        <!-- 模板选择 -->
        <div class="flex flex-col gap-2">
          <label class="tool-section-title flex items-center gap-1.5">
            <Palette :size="13" />外观模板
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="t in QR_TEMPLATES"
              :key="t.value"
              type="button"
              :class="['h-7 rounded-md border px-2 text-xs transition-colors',
                template === t.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground']"
              @click="template = t.value"
            >{{ t.label }}</button>
          </div>
        </div>

        <!-- 配色 -->
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- 容错率 -->
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">容错率</label>
            <div class="inline-flex rounded-md border bg-card p-0.5">
              <button v-for="l in ['L','M','Q','H']" :key="l" type="button"
                :class="['h-9 flex-1 rounded-sm text-sm transition-colors', ecLevel === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
                @click="ecLevel = l as QREcLevel"
              >{{ l }}</button>
            </div>
          </div>

          <!-- 尺寸 -->
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">尺寸 (px)</label>
            <Input v-model.number="size" type="number" :min="100" :max="1200" />
          </div>

          <!-- 前景色 -->
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title flex items-center justify-between">
              <span>前景色</span>
              <label class="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground font-normal">
                <input v-model="useGradient" type="checkbox" class="accent-[hsl(var(--primary))]" />渐变
              </label>
            </label>
            <div class="flex gap-2">
              <input v-model="fgColor" type="color" class="h-9 flex-1 rounded-md border bg-card cursor-pointer" />
              <input v-if="useGradient" v-model="fgColor2" type="color" class="h-9 flex-1 rounded-md border bg-card cursor-pointer" />
            </div>
          </div>

          <!-- 背景色 -->
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">背景色</label>
            <input v-model="bgColor" type="color" class="h-9 w-full rounded-md border bg-card cursor-pointer" />
          </div>

          <!-- 定位点颜色 -->
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">定位点内层色</label>
            <input v-model="innerColor" type="color" class="h-9 w-full rounded-md border bg-card cursor-pointer" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">定位点外层色</label>
            <input v-model="outerColor" type="color" class="h-9 w-full rounded-md border bg-card cursor-pointer" />
          </div>

          <!-- Logo -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="tool-section-title">Logo（可选，自动升级容错率为 H）</label>
            <div v-if="logo" class="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
              <img :src="logo" class="h-8 w-8 rounded object-contain" alt="logo" />
              <span class="flex-1 truncate text-xs text-muted-foreground">{{ logoName }}</span>
              <button type="button" class="text-muted-foreground hover:text-foreground" @click="clearLogo">
                <X :size="14" />
              </button>
            </div>
            <label v-else class="flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-card/40 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card">
              <Upload :size="14" />
              <span>点击上传图片</span>
              <input type="file" accept="image/*" class="hidden" @change="onLogoFile" />
            </label>
          </div>
        </div>
      </section>

      <!-- 预览 + 下载 -->
      <section class="flex flex-col items-center gap-3">
        <div class="flex h-80 w-80 items-center justify-center overflow-hidden rounded-lg border bg-card p-2">
          <img v-if="dataUrl && !generating" :src="dataUrl" alt="QR" class="h-full w-full object-contain" />
          <span v-else-if="generating" class="text-sm text-muted-foreground">生成中…</span>
          <span v-else-if="genError" class="text-sm text-destructive">{{ genError }}</span>
          <span v-else class="text-sm text-muted-foreground">输入内容以生成</span>
        </div>
        <Button variant="primary" :disabled="!dataUrl || generating" @click="onDownload">
          <Download :size="14" />下载 PNG
        </Button>
      </section>
    </div>

    <!-- ============ 识别 ============ -->
    <div v-show="tab === 'decode'" class="flex flex-col gap-4">
      <label
        for="qr-decode-file"
        class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card/40 p-10 text-center transition-colors hover:border-primary/60 hover:bg-card"
        @dragover.prevent
        @drop="onDrop"
      >
        <Upload :size="24" class="text-muted-foreground" />
        <p class="text-sm font-medium">拖入图片 / 点击选择 / Ctrl+V 粘贴</p>
        <p class="text-xs text-muted-foreground">本地识别，不上传任何数据</p>
        <input id="qr-decode-file" type="file" accept="image/*" class="hidden" @change="onFile" />
      </label>

      <div v-if="busy" class="text-sm text-muted-foreground">识别中…</div>

      <div v-if="previewUrl" class="grid gap-4 lg:grid-cols-[300px_1fr]">
        <img :src="previewUrl" alt="" class="max-h-64 rounded-md border bg-card object-contain" />
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="tool-section-title">识别结果</label>
            <CopyButton :text="result" icon-only />
          </div>
          <Textarea :model-value="result" mono :rows="8" readonly placeholder="未识别到内容" />
          <p v-if="decError" class="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle :size="12" />{{ decError }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
