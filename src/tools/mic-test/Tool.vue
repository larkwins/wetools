<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from 'vue';
import { Mic, MicOff, Play, Pause, Download, AlertCircle, Circle, Square } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const devices = ref<MediaDeviceInfo[]>([]);
const deviceId = ref<string>('');
const running = ref(false);
const error = ref('');
const volume = ref(0); // 0-100
const recording = ref(false);
const recordedUrl = ref('');
const chunks = ref<Blob[]>([]);

let stream: MediaStream | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let raf = 0;
let recorder: MediaRecorder | null = null;

async function loadDevices() {
  try {
    const list = await navigator.mediaDevices.enumerateDevices();
    devices.value = list.filter((d) => d.kind === 'audioinput');
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
      audio: deviceId.value ? { deviceId: { exact: deviceId.value } } : true,
      video: false,
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    running.value = true;
    loop();
    await loadDevices();
  } catch (e) {
    error.value = '启动麦克风失败：' + ((e as Error).message || String(e));
    running.value = false;
  }
}

function stop() {
  cancelAnimationFrame(raf);
  if (recorder && recorder.state === 'recording') recorder.stop();
  if (stream) { for (const t of stream.getTracks()) t.stop(); stream = null; }
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  analyser = null;
  running.value = false;
  volume.value = 0;
  recording.value = false;
}

function loop() {
  if (!analyser || !canvas.value) return;
  const c = canvas.value;
  const ctx = c.getContext('2d')!;
  const buf = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    if (!analyser || !c) return;
    analyser.getByteTimeDomainData(buf);
    // 计算 RMS 音量
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    volume.value = Math.min(100, Math.round(Math.sqrt(sum / buf.length) * 200));

    // 绘制波形
    const w = c.width;
    const h = c.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    const slice = w / buf.length;
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i] / 128;
      const y = (v * h) / 2;
      const x = i * slice;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    raf = requestAnimationFrame(draw);
  }
  draw();
}

function startRecord() {
  if (!stream) return;
  // 释放上一次录音的 blob URL，避免每次重新录音都泄漏
  if (recordedUrl.value) {
    URL.revokeObjectURL(recordedUrl.value);
    recordedUrl.value = '';
  }
  chunks.value = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.value.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks.value, { type: recorder!.mimeType });
    recordedUrl.value = URL.createObjectURL(blob);
  };
  recorder.start();
  recording.value = true;
}

function stopRecord() {
  if (recorder && recorder.state === 'recording') recorder.stop();
  recording.value = false;
}

function downloadRecord() {
  if (!recordedUrl.value) return;
  const a = document.createElement('a');
  a.href = recordedUrl.value;
  a.download = `recording-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

onBeforeUnmount(() => {
  stop();
  // 卸载时释放录音 blob URL
  if (recordedUrl.value) {
    URL.revokeObjectURL(recordedUrl.value);
    recordedUrl.value = '';
  }
});
watch(deviceId, () => { if (running.value) { stop(); start(); } });

// 进入时尝试列出设备（放进 onMounted 防 SSR 出错；同时 catch Promise）
onMounted(() => {
  void loadDevices().catch(() => {/* loadDevices 内部已写 error.value */});
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="!running" class="rounded-lg border border-dashed bg-card/40 p-8 text-center">
      <Mic :size="40" class="mx-auto mb-3 text-muted-foreground/60" />
      <p class="mb-4 text-sm text-muted-foreground">点击下方按钮启动麦克风</p>
      <Button variant="primary" @click="start"><Mic :size="14" />启动麦克风</Button>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <select v-if="devices.length > 1" v-model="deviceId" class="h-9 flex-1 min-w-[200px] rounded-md border bg-background px-3 text-sm">
          <option v-for="(d, i) in devices" :key="d.deviceId" :value="d.deviceId">
            {{ d.label || `Microphone ${i + 1}` }}
          </option>
        </select>
        <Button v-if="!recording" variant="primary" @click="startRecord">
          <Circle :size="12" class="fill-current text-red-500" />录音
        </Button>
        <Button v-else variant="outline" @click="stopRecord">
          <Square :size="12" class="fill-current" />停止录音
        </Button>
        <Button variant="destructive" @click="stop"><MicOff :size="14" />关闭</Button>
      </div>

      <div class="rounded-lg border bg-card p-3">
        <div class="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>音量</span>
          <span class="font-mono text-foreground">{{ volume }}%</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-secondary">
          <div class="h-full transition-[width,background-color] duration-100"
            :class="volume > 80 ? 'bg-red-500' : volume > 50 ? 'bg-amber-500' : 'bg-emerald-500'"
            :style="{ width: volume + '%' }"></div>
        </div>
      </div>

      <canvas ref="canvas" width="800" height="160" class="w-full rounded-lg border bg-slate-950" />

      <div v-if="recordedUrl" class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">录音回放</label>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <audio :src="recordedUrl" controls class="w-full max-w-md" />
          <Button variant="outline" @click="downloadRecord"><Download :size="14" />下载</Button>
        </div>
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <p class="text-xs text-muted-foreground">
      需要授权麦克风权限。音频数据仅在浏览器本地处理，关闭页面后立即释放。仅 HTTPS / localhost 可用。
    </p>
  </div>
</template>
