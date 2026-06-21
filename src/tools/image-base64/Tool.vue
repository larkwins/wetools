<script setup lang="ts">
import { ref, computed } from 'vue';
import { Upload, AlertCircle, Download } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const dataUrl = ref('');
const error = ref<string | null>(null);
const previewMime = computed(() => /^data:([^;]+);/.exec(dataUrl.value)?.[1] ?? '');

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) {
    error.value = '请选择图片';
    return;
  }
  error.value = null;
  const reader = new FileReader();
  reader.onload = () => {
    dataUrl.value = String(reader.result);
  };
  reader.readAsDataURL(f);
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    const fakeEvent = { target: { files: [f] } } as unknown as Event;
    onFile(fakeEvent);
  }
}

function download() {
  if (!dataUrl.value) return;
  const a = document.createElement('a');
  a.href = dataUrl.value;
  const ext = previewMime.value.split('/')[1] || 'png';
  a.download = `image.${ext}`;
  a.click();
}

const cssExample = computed(() =>
  dataUrl.value ? `.bg {\n  background-image: url("${dataUrl.value.slice(0, 60)}…");\n}` : ''
);

function fmtSize() {
  // base64 长度估算：每 4 个字符表示 3 字节
  const n = dataUrl.value.length;
  const bytes = Math.floor(n * 0.75);
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
    <section class="space-y-3">
      <label
        for="img-b64-file"
        class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card/40 p-8 text-center transition-colors hover:border-primary/60 hover:bg-card"
        @dragover.prevent
        @drop="onDrop"
      >
        <Upload :size="24" class="text-muted-foreground" />
        <p class="text-sm font-medium">拖入图片 / 点击选择</p>
        <input id="img-b64-file" type="file" accept="image/*" class="hidden" @change="onFile" />
      </label>

      <div v-if="dataUrl" class="rounded-lg border bg-card p-3">
        <img :src="dataUrl" alt="preview" class="mx-auto max-h-64 object-contain" data-no-i18n />
        <p class="mt-2 text-center text-xs text-muted-foreground">{{ previewMime }} · {{ fmtSize() }}</p>
      </div>

      <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ error }}</p>
    </section>

    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">Data URL</label>
        <div class="flex items-center gap-2">
          <Button v-if="dataUrl" variant="outline" size="sm" @click="download">
            <Download :size="14" />下载图片
          </Button>
          <CopyButton :text="dataUrl" icon-only />
        </div>
      </div>
      <Textarea v-model="dataUrl" mono :rows="14" placeholder="data:image/png;base64,..." />

      <div v-if="cssExample" class="mt-2">
        <label class="tool-section-title">CSS 示例</label>
        <pre class="code-area mt-1 rounded-md border bg-muted/40 p-3" data-no-i18n>{{ cssExample }}</pre>
      </div>
    </section>
  </div>
</template>
