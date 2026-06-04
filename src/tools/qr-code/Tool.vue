<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Download, Upload, AlertCircle, QrCode, ScanLine } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Tab = 'generate' | 'decode';
const tab = ref<Tab>('generate');

// ============ 生成 ============
const text = ref('https://wetools.cc');
const ecLevel = ref<'L' | 'M' | 'Q' | 'H'>('M');
const size = ref(320);
const margin = ref(2);
const dark = ref('#0A0A0A');
const light = ref('#FFFFFF');
const dataUrl = ref('');
const genError = ref<string | null>(null);

let QR: typeof import('qrcode') | null = null;
async function ensureQR() {
  if (!QR) QR = await import('qrcode');
  return QR;
}

async function regen() {
  if (!text.value) { dataUrl.value = ''; return; }
  try {
    const q = await ensureQR();
    dataUrl.value = await q.toDataURL(text.value, {
      errorCorrectionLevel: ecLevel.value,
      width: size.value,
      margin: margin.value,
      color: { dark: dark.value, light: light.value },
    });
    genError.value = null;
  } catch (e) {
    genError.value = (e as Error).message;
  }
}

watch([text, ecLevel, size, margin, dark, light], regen);
onMounted(() => {
  // 切到生成 tab 时确保有图（首次加载即生成；切回生成 tab 时也会触发）
  if (tab.value === 'generate') regen();
});
watch(tab, (v) => {
  if (v === 'generate' && !dataUrl.value) regen();
});

function download() {
  if (!dataUrl.value) return;
  const a = document.createElement('a');
  a.href = dataUrl.value;
  a.download = 'qrcode.png';
  a.click();
}

// ============ 识别 ============
const result = ref('');
const decError = ref<string | null>(null);
const previewUrl = ref('');
const busy = ref(false);

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
    canvas.width = Math.round(img.width * scale);
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
  // 仅在识别 tab 激活时响应剪贴板粘贴，避免在生成 tab 编辑文本时误触
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
    <!-- Tab 切换：生成 / 识别 -->
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
        <div class="flex flex-col gap-2">
          <label class="tool-section-title">内容</label>
          <Textarea v-model="text" :rows="6" placeholder="输入文字或链接…" />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">容错率</label>
            <div class="inline-flex rounded-md border bg-card p-0.5">
              <button v-for="l in ['L','M','Q','H']" :key="l" type="button"
                :class="['h-9 flex-1 rounded-sm text-sm', ecLevel === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
                @click="ecLevel = l as 'L' | 'M' | 'Q' | 'H'"
              >{{ l }}</button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">尺寸 (px)</label>
            <Input v-model.number="size" type="number" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="tool-section-title">边距</label>
            <Input v-model.number="margin" type="number" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="tool-section-title">前景色</label>
              <input v-model="dark" type="color" class="h-9 w-full rounded-md border bg-card" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="tool-section-title">背景色</label>
              <input v-model="light" type="color" class="h-9 w-full rounded-md border bg-card" />
            </div>
          </div>
        </div>
      </section>

      <section class="flex flex-col items-center gap-3">
        <div class="flex h-80 w-80 items-center justify-center overflow-hidden rounded-lg border bg-card p-2">
          <img v-if="dataUrl" :src="dataUrl" alt="QR" class="h-full w-full object-contain" />
          <span v-else-if="genError" class="text-sm text-destructive">{{ genError }}</span>
          <span v-else class="text-sm text-muted-foreground">输入内容以生成</span>
        </div>
        <Button variant="primary" :disabled="!dataUrl" @click="download">
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
          <p v-if="decError" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ decError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
