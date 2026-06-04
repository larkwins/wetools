<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Camera, Video, VideoOff, Download, AlertCircle } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';

const videoEl = ref<HTMLVideoElement | null>(null);
const devices = ref<MediaDeviceInfo[]>([]);
const deviceId = ref<string>('');
const stream = ref<MediaStream | null>(null);
const running = ref(false);
const error = ref('');
const photoUrl = ref('');
const info = ref<{ w: number; h: number; label: string } | null>(null);

async function loadDevices() {
  try {
    const list = await navigator.mediaDevices.enumerateDevices();
    devices.value = list.filter((d) => d.kind === 'videoinput');
    if (!deviceId.value && devices.value.length > 0) {
      deviceId.value = devices.value[0].deviceId;
    }
  } catch (e) {
    error.value = '获取设备列表失败：' + ((e as Error).message || String(e));
  }
}

async function start() {
  error.value = '';
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持 getUserMedia（请使用 HTTPS 或 localhost）');
    }
    const constraints: MediaStreamConstraints = {
      video: deviceId.value ? { deviceId: { exact: deviceId.value } } : true,
      audio: false,
    };
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    // 关键：先设 running=true 触发模板从 v-if 切到 v-else，让 <video> 进入 DOM，
    // 然后 await nextTick 等 Vue 完成渲染、videoEl ref 拿到真实元素，再 attach srcObject。
    // 否则首次启动时 videoEl.value === null，画面永远黑屏。
    running.value = true;
    await nextTick();
    if (videoEl.value && stream.value) {
      videoEl.value.srcObject = stream.value;
      videoEl.value.onloadedmetadata = () => {
        if (videoEl.value && stream.value) {
          const track = stream.value.getVideoTracks()[0];
          const settings = track.getSettings();
          info.value = {
            w: settings.width || videoEl.value.videoWidth,
            h: settings.height || videoEl.value.videoHeight,
            label: track.label,
          };
          // 某些浏览器（特别是带 autoplay 限制时）需要显式调用 play()
          videoEl.value.play().catch(() => {/* autoplay 策略已被 ref 绑定满足，忽略 */});
        }
      };
    }
    // 授权后再列设备（之前 label 为空）
    await loadDevices();
  } catch (e) {
    error.value = '启动摄像头失败：' + ((e as Error).message || String(e));
    running.value = false;
  }
}

function stop() {
  if (stream.value) {
    for (const t of stream.value.getTracks()) t.stop();
    stream.value = null;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
  running.value = false;
  info.value = null;
}

function snapshot() {
  if (!videoEl.value || !info.value) return;
  const canvas = document.createElement('canvas');
  canvas.width = info.value.w;
  canvas.height = info.value.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(videoEl.value, 0, 0);
  photoUrl.value = canvas.toDataURL('image/png');
}

function downloadPhoto() {
  if (!photoUrl.value) return;
  const a = document.createElement('a');
  a.href = photoUrl.value;
  a.download = `snapshot-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

onMounted(loadDevices);
onBeforeUnmount(stop);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="!running" class="rounded-lg border border-dashed bg-card/40 p-8 text-center">
      <Camera :size="40" class="mx-auto mb-3 text-muted-foreground/60" />
      <p class="mb-4 text-sm text-muted-foreground">点击下方按钮启动摄像头预览</p>
      <Button variant="primary" @click="start"><Video :size="14" />启动摄像头</Button>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <select v-if="devices.length > 1" v-model="deviceId" class="h-9 flex-1 min-w-[200px] rounded-md border bg-background px-3 text-sm" @change="() => { stop(); start(); }">
          <option v-for="(d, i) in devices" :key="d.deviceId" :value="d.deviceId">
            {{ d.label || `Camera ${i + 1}` }}
          </option>
        </select>
        <Button variant="primary" @click="snapshot"><Camera :size="14" />拍照</Button>
        <Button variant="destructive" @click="stop"><VideoOff :size="14" />停止</Button>
      </div>

      <div class="relative overflow-hidden rounded-lg border bg-black">
        <video ref="videoEl" autoplay playsinline muted class="block w-full" />
        <span v-if="info" class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white">
          {{ info.w }}×{{ info.h }} · {{ info.label }}
        </span>
      </div>

      <div v-if="photoUrl" class="flex flex-col gap-2">
        <label class="tool-section-title">拍摄结果</label>
        <div class="flex flex-col items-start gap-2 sm:flex-row">
          <img :src="photoUrl" alt="snapshot" class="max-w-full rounded-lg border sm:max-w-md" />
          <Button variant="outline" @click="downloadPhoto"><Download :size="14" />下载</Button>
        </div>
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <p class="text-xs text-muted-foreground">
      需要授权摄像头权限。视频流仅在浏览器本地处理，关闭页面后立即释放。仅 HTTPS / localhost 可用。
    </p>
  </div>
</template>
