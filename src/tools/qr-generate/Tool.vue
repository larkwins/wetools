<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Download } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';

const text = ref('https://wetools.cc');
const ecLevel = ref<'L' | 'M' | 'Q' | 'H'>('M');
const size = ref(320);
const margin = ref(2);
const dark = ref('#0A0A0A');
const light = ref('#FFFFFF');
const dataUrl = ref('');
const error = ref<string | null>(null);

let QR: typeof import('qrcode') | null = null;

async function ensure() {
  if (!QR) QR = await import('qrcode');
  return QR;
}

async function regen() {
  if (!text.value) {
    dataUrl.value = '';
    return;
  }
  try {
    const q = await ensure();
    dataUrl.value = await q.toDataURL(text.value, {
      errorCorrectionLevel: ecLevel.value,
      width: size.value,
      margin: margin.value,
      color: { dark: dark.value, light: light.value },
    });
    error.value = null;
  } catch (e) {
    error.value = (e as Error).message;
  }
}

watch([text, ecLevel, size, margin, dark, light], regen, { immediate: false });
onMounted(regen);

function download() {
  if (!dataUrl.value) return;
  const a = document.createElement('a');
  a.href = dataUrl.value;
  a.download = 'qrcode.png';
  a.click();
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[1fr_auto]">
    <section class="space-y-4">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">内容</label>
        <Textarea v-model="text" :rows="6" placeholder="输入文字或链接…" />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">容错率</label>
          <div class="inline-flex rounded-md border bg-card p-0.5">
            <button v-for="l in ['L','M','Q','H']" :key="l" type="button"
              :class="['h-9 flex-1 rounded-sm text-sm', ecLevel === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
              @click="ecLevel = l as 'L' | 'M' | 'Q' | 'H'"
            >{{ l }}</button>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">尺寸 (px)</label>
          <Input v-model="size" type="number" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">边距</label>
          <Input v-model="margin" type="number" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] uppercase tracking-wider text-muted-foreground">前景色</label>
            <input v-model="dark" type="color" class="h-9 w-full rounded-md border bg-card" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] uppercase tracking-wider text-muted-foreground">背景色</label>
            <input v-model="light" type="color" class="h-9 w-full rounded-md border bg-card" />
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col items-center gap-3">
      <div class="flex h-80 w-80 items-center justify-center overflow-hidden rounded-lg border bg-card p-2">
        <img v-if="dataUrl" :src="dataUrl" alt="QR" class="h-full w-full object-contain" />
        <span v-else-if="error" class="text-sm text-destructive">{{ error }}</span>
        <span v-else class="text-sm text-muted-foreground">输入内容以生成</span>
      </div>
      <Button variant="primary" :disabled="!dataUrl" @click="download">
        <Download :size="14" />下载 PNG
      </Button>
    </section>
  </div>
</template>
