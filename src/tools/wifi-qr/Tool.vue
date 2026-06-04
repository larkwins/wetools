<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Download, AlertCircle } from 'lucide-vue-next';
import QRCode from 'qrcode';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Auth = 'WPA' | 'WEP' | 'nopass';
const ssid = ref('MyWiFi');
const password = ref('hunter2hunter2');
const auth = ref<Auth>('WPA');
const hidden = ref(false);

const error = ref('');
const dataUrl = ref('');

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
  try {
    dataUrl.value = await QRCode.toDataURL(wifiString.value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch (e) {
    error.value = (e as Error).message || String(e);
  }
}

watch(wifiString, render, { immediate: true });

function download() {
  if (!dataUrl.value) return;
  const a = document.createElement('a');
  a.href = dataUrl.value;
  a.download = `wifi-${ssid.value}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const auths: Array<{ k: Auth; l: string }> = [
  { k: 'WPA', l: 'WPA / WPA2 / WPA3' },
  { k: 'WEP', l: 'WEP（已淘汰）' },
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

    <div class="grid gap-4 lg:grid-cols-[auto_1fr]">
      <div class="flex flex-col items-center gap-2 rounded-lg border bg-card p-4">
        <img v-if="dataUrl" :src="dataUrl" alt="WiFi QR" class="w-64 h-64" />
        <div v-else class="flex h-64 w-64 items-center justify-center text-muted-foreground">渲染中…</div>
        <Button variant="primary" :disabled="!dataUrl" @click="download">
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
