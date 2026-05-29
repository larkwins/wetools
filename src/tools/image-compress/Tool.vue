<script setup lang="ts">
import { ref } from 'vue';
import { Upload, Download, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';

interface Item {
  origin: File;
  originUrl: string;
  output?: File;
  outputUrl?: string;
  ratio?: number;
  busy: boolean;
  error?: string;
}

const items = ref<Item[]>([]);
const maxSize = ref(1.0); // MB
const maxWH = ref(1920);
const useWebWorker = ref(true);

function fmtSize(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

async function compressOne(it: Item) {
  it.busy = true;
  try {
    const compress = (await import('browser-image-compression')).default;
    const out = await compress(it.origin, {
      maxSizeMB: Number(maxSize.value),
      maxWidthOrHeight: Number(maxWH.value),
      useWebWorker: useWebWorker.value,
    });
    if (it.outputUrl) URL.revokeObjectURL(it.outputUrl);
    const file = new File([out], it.origin.name, { type: out.type || it.origin.type });
    it.output = file;
    it.outputUrl = URL.createObjectURL(file);
    it.ratio = (1 - file.size / it.origin.size) * 100;
    it.error = undefined;
  } catch (e) {
    it.error = (e as Error).message;
  } finally {
    it.busy = false;
  }
}

function add(files: FileList | File[]) {
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    const it: Item = { origin: f, originUrl: URL.createObjectURL(f), busy: false };
    items.value.push(it);
    compressOne(it);
  }
}

function onFile(e: Event) {
  const fs = (e.target as HTMLInputElement).files;
  if (fs) add(fs);
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer?.files) add(e.dataTransfer.files);
}

function downloadOne(it: Item) {
  if (!it.output || !it.outputUrl) return;
  const a = document.createElement('a');
  a.href = it.outputUrl;
  a.download = it.origin.name.replace(/(\.\w+)$/, '.min$1');
  a.click();
}

function clear() {
  for (const it of items.value) {
    URL.revokeObjectURL(it.originUrl);
    if (it.outputUrl) URL.revokeObjectURL(it.outputUrl);
  }
  items.value = [];
}

function recompress() {
  for (const it of items.value) compressOne(it);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">最大文件大小 (MB)</label>
        <Input v-model="maxSize" type="number" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">最大边长 (px)</label>
        <Input v-model="maxWH" type="number" />
      </div>
      <div class="flex items-end">
        <Button variant="outline" :disabled="items.length === 0" @click="recompress">使用新参数重压</Button>
      </div>
    </div>

    <label
      for="img-compress-file"
      class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card/40 p-10 text-center transition-colors hover:border-primary/60 hover:bg-card"
      @dragover.prevent
      @drop="onDrop"
    >
      <Upload :size="24" class="text-muted-foreground" />
      <p class="text-sm font-medium">拖入或选择多张图片</p>
      <p class="text-xs text-muted-foreground">支持 PNG / JPG / WebP，本地压缩</p>
      <input id="img-compress-file" type="file" accept="image/*" multiple class="hidden" @change="onFile" />
    </label>

    <div v-if="items.length" class="flex items-center justify-between">
      <span class="text-xs text-muted-foreground">{{ items.length }} 张图片</span>
      <Button variant="ghost" size="sm" @click="clear">全部清除</Button>
    </div>

    <ul v-if="items.length" class="space-y-2">
      <li v-for="(it, i) in items" :key="i" class="flex items-center gap-3 rounded-md border bg-card p-3">
        <img :src="it.originUrl" class="h-16 w-16 rounded object-cover" alt="" />
        <div class="flex-1 min-w-0 space-y-1">
          <p class="truncate text-sm font-medium">{{ it.origin.name }}</p>
          <p class="font-mono text-xs text-muted-foreground">
            {{ fmtSize(it.origin.size) }}
            <template v-if="it.output"> → <span class="text-foreground">{{ fmtSize(it.output.size) }}</span></template>
            <span v-if="it.ratio != null" class="ml-2 text-primary">省 {{ it.ratio.toFixed(1) }}%</span>
            <span v-if="it.busy" class="ml-2">压缩中…</span>
          </p>
          <p v-if="it.error" class="flex items-center gap-1 text-xs text-destructive"><AlertCircle :size="12" />{{ it.error }}</p>
        </div>
        <Button variant="outline" size="sm" :disabled="!it.output" @click="downloadOne(it)">
          <Download :size="14" />下载
        </Button>
      </li>
    </ul>
  </div>
</template>
