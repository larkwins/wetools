<script setup lang="ts">
import { ref } from 'vue';
import { Upload, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const result = ref('');
const error = ref<string | null>(null);
const previewUrl = ref('');
const busy = ref(false);

async function decode(file: File) {
  busy.value = true;
  error.value = null;
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
      error.value = '未识别到二维码，可尝试更清晰、更居中的图片';
    }
  } catch (e) {
    error.value = (e as Error).message;
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
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">识别结果</label>
          <CopyButton :text="result" icon-only />
        </div>
        <Textarea :model-value="result" mono :rows="8" readonly placeholder="未识别到内容" />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ error }}</p>
      </div>
    </div>
  </div>
</template>
