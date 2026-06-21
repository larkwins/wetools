<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Download, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import { generateQRCode, downloadQRCode, QR_TEMPLATES } from '@/lib/qrcode';
import type { QRTemplate } from '@/lib/qrcode';

type Auth = 'WPA' | 'WEP' | 'nopass';
const ssid      = ref('MyWiFi');
const password  = ref('hunter2hunter2');
const auth      = ref<Auth>('WPA');
const hidden    = ref(false);
const template  = ref<QRTemplate>('water');
const fgColor   = ref('#000000');
const bgColor   = ref('#ffffff');

const error      = ref('');
const dataUrl    = ref('');
const generating = ref(false);

// WiFi QR 协议格式：WIFI:T:WPA;S:<ssid>;P:<password>;H:true;;
// 特殊字符 \;,":\ 需要用 \ 转义
function escWifi(s: string): string {
  return s.replace(/([\\;,":])/g, '\\$1');
}

const wifiString = computed(() => {
  const parts = [`WIFI:T:${auth.value};S:${escWifi(ssid.value)}`];
  if (auth.value !== 'nopass') parts.push(`P:${escWifi(password.value)}`);
  if (hidden.value) parts.push('H:true');
  return parts.join(';') + ';;';
});

async function render() {
  error.value = '';
  generating.value = true;
  try {
    dataUrl.value = await generateQRCode({
      value:           wifiString.value,
      size:            400,
      level:           'M',
      template:        template.value,
      foregroundColor: fgColor.value,
      backgroundColor: bgColor.value,
    });
  } catch (e) {
    error.value = (e as Error).message || String(e);
  } finally {
    generating.value = false;
  }
}

watch([wifiString, template, fgColor, bgColor], render, { immediate: true });

function onDownload() {
  downloadQRCode(dataUrl.value, `wifi-${ssid.value}.png`);
}

const auths: Array<{ k: Auth; l: string }> = [
  { k: 'WPA',    l: 'WPA / WPA2 / WPA3' },
  { k: 'WEP',    l: 'WEP（已淘汰）' },
  { k: 'nopass', l: '无密码' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">WiFi 名称 (SSID)</label>
        <Input v-model="ssid" placeholder="MyWiFi" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">加密方式</label>
        <select v-model="auth" class="h-9 rounded-md border bg-background px-3 text-sm text-foreground hover:border-primary/40 focus:border-primary focus:outline-none">
          <option v-for="a in auths" :key="a.k" :value="a.k">{{ a.l }}</option>
        </select>
      </div>
      <div v-if="auth !== 'nopass'" class="flex flex-col gap-1 sm:col-span-2">
        <label class="tool-section-title">WiFi 密码</label>
        <Input v-model="password" type="text" placeholder="password" />
      </div>
      <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        <input v-model="hidden" type="checkbox" class="accent-[hsl(var(--primary))]" />隐藏网络
      </label>
    </div>

    <!-- 外观 -->
    <div class="flex flex-col gap-2">
      <label class="tool-section-title">外观模板</label>
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

    <div class="grid grid-cols-2 gap-3 sm:w-64">
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">前景色</label>
        <input v-model="fgColor" type="color" class="h-9 w-full rounded-md border bg-card cursor-pointer" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="tool-section-title">背景色</label>
        <input v-model="bgColor" type="color" class="h-9 w-full rounded-md border bg-card cursor-pointer" />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[auto_1fr]">
      <div class="flex flex-col items-center gap-2 rounded-lg border bg-card p-4">
        <div class="flex h-64 w-64 items-center justify-center overflow-hidden rounded">
          <img v-if="dataUrl && !generating" :src="dataUrl" alt="WiFi QR" class="h-full w-full object-contain" />
          <span v-else class="text-sm text-muted-foreground">渲染中…</span>
        </div>
        <Button variant="primary" :disabled="!dataUrl || generating" @click="onDownload">
          <Download :size="14" />下载 PNG
        </Button>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">WiFi 编码字符串</label>
          <CopyButton :text="wifiString" icon-only />
        </div>
        <pre class="overflow-auto rounded-md border bg-card p-3 font-mono text-xs"><code>{{ wifiString }}</code></pre>
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
        <p class="text-xs text-muted-foreground">
          iOS 11+ / Android 10+ 直接扫码即可连接。生成的二维码完全离线，无任何上传。
        </p>
      </div>
    </div>
  </div>
</template>
