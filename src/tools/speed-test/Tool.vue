<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import {
  Gauge,
  Download,
  Upload,
  Activity,
  Play,
  Square,
  MapPin,
  AlertCircle,
} from 'lucide-vue-next';
import SpeedTest from '@cloudflare/speedtest';
import Button from '@/components/ui/Button.vue';

// ============================================================
// 实现说明：
// 直接使用 Cloudflare 官方测速 SDK @cloudflare/speedtest。
// 该 SDK 已经处理所有边界情况（CORS 预检、多 chunk 并发、TURN
// 服务器用于丢包检测、loaded latency 等），无需手动 fetch/XHR。
//
// 我们只用最常用的 4 个指标：latency / jitter / download / upload。
// 默认配置已经覆盖国内常见场景（接入 HKG colo）。
// ============================================================

type Phase = 'idle' | 'running' | 'done' | 'error';

const phase = ref<Phase>('idle');
const error = ref('');

const pingMs = ref<number | null>(null);
const jitterMs = ref<number | null>(null);
const downloadMbps = ref<number | null>(null);
const uploadMbps = ref<number | null>(null);

// 当前阶段（latency / download / upload 等）的展示文案
const currentPhaseText = ref('');
// 当前阶段实时进度 0-100
const progressPct = ref(0);

interface ServerInfo {
  city?: string;
  country?: string;
  colo?: string;
}
const serverInfo = ref<ServerInfo>({});

let engine: SpeedTest | null = null;

function cleanup() {
  if (engine) {
    try { engine.pause(); } catch {/* ignore */}
    engine = null;
  }
}
onBeforeUnmount(cleanup);

function resetMetrics() {
  pingMs.value = null;
  jitterMs.value = null;
  downloadMbps.value = null;
  uploadMbps.value = null;
  progressPct.value = 0;
  currentPhaseText.value = '';
  serverInfo.value = {};
}

function fmtMbps(mbps: number | null): string {
  if (mbps == null) return '—';
  if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`;
  if (mbps < 100) return mbps.toFixed(2);
  return mbps.toFixed(1);
}

// 通过单独发一个请求拿接入 colo（SDK 内部不暴露这些 header）
async function detectServer(): Promise<void> {
  try {
    const res = await fetch('https://speed.cloudflare.com/__down?bytes=1', { cache: 'no-store' });
    await res.arrayBuffer();
    serverInfo.value = {
      city: res.headers.get('cf-meta-city') ?? undefined,
      country: res.headers.get('cf-meta-country') ?? undefined,
      colo: res.headers.get('cf-meta-colo') ?? undefined,
    };
  } catch {/* ignore */}
}

async function runTest() {
  cleanup();
  resetMetrics();
  error.value = '';
  phase.value = 'running';

  // 先拿一次节点信息（与测速并行）
  void detectServer();

  // 创建 SDK 实例。autoStart=false 让我们手动 play
  // 必须自定义 measurements：
  //   - 默认配置包含 packetLoss，它依赖 /turn-creds 接口（跨域 CORS 拒绝） → 报错
  //   - 跳过 packetLoss 与 loadedLatency（同样走 turn），只保留 latency + download + upload
  // measurement 数组按顺序执行，bytes/count 与 SDK 默认一致以保证带宽估算精度
  engine = new SpeedTest({
    autoStart: false,
    measureDownloadLoadedLatency: false,
    measureUploadLoadedLatency: false,
    measurements: [
      { type: 'latency', numPackets: 1 },
      { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
      { type: 'latency', numPackets: 20 },
      { type: 'download', bytes: 1e5, count: 9 },
      { type: 'download', bytes: 1e6, count: 8 },
      { type: 'upload', bytes: 1e5, count: 8 },
      // 这里原本是 packetLoss，已移除
      { type: 'upload', bytes: 1e6, count: 6 },
      { type: 'download', bytes: 1e7, count: 6 },
      { type: 'upload', bytes: 1e7, count: 4 },
      { type: 'download', bytes: 2.5e7, count: 4 },
      { type: 'upload', bytes: 2.5e7, count: 4 },
    ],
  });

  engine.onPhaseChange = (info: { measurement: { type: string }; measurementId: number }) => {
    const type = info.measurement?.type;
    if (type === 'latency') currentPhaseText.value = '测延迟中…';
    else if (type === 'download') currentPhaseText.value = '测下载中…';
    else if (type === 'upload') currentPhaseText.value = '测上传中…';
    else if (type === 'packetLoss') currentPhaseText.value = '测丢包中…';
    else currentPhaseText.value = '准备中…';
  };

  engine.onResultsChange = () => {
    if (!engine) return;
    const summary = engine.results.getSummary();
    // bps → Mbps（注意 SDK 返回的 download/upload 单位是 bps = bit/s）
    if (summary.latency != null) pingMs.value = Math.round(summary.latency);
    if (summary.jitter != null) jitterMs.value = Math.round(summary.jitter);
    if (summary.download != null) downloadMbps.value = summary.download / 1_000_000;
    if (summary.upload != null) uploadMbps.value = summary.upload / 1_000_000;
    // 粗略估算进度：每多一个指标 +25%
    let p = 0;
    if (pingMs.value != null) p += 25;
    if (downloadMbps.value != null) p += 35;
    if (uploadMbps.value != null) p += 40;
    progressPct.value = Math.min(99, p);
  };

  engine.onFinish = () => {
    if (!engine) return;
    const summary = engine.results.getSummary();
    if (summary.latency != null) pingMs.value = Math.round(summary.latency);
    if (summary.jitter != null) jitterMs.value = Math.round(summary.jitter);
    if (summary.download != null) downloadMbps.value = summary.download / 1_000_000;
    if (summary.upload != null) uploadMbps.value = summary.upload / 1_000_000;
    progressPct.value = 100;
    currentPhaseText.value = '';
    phase.value = 'done';
    engine = null;
  };

  engine.onError = (errMsg: string) => {
    phase.value = 'error';
    error.value = '测速失败：' + errMsg;
    engine = null;
  };

  engine.play();
}

function stop() {
  cleanup();
  phase.value = 'idle';
}

// Cloudflare 大陆 colo 白名单
const CN_MAINLAND_COLOS = new Set([
  'SHA', 'SJW', 'CGO', 'CTU', 'FOC', 'HGH', 'TSN', 'BJS', 'SZX', 'TXG', 'XIY', 'JJN', 'CKG', 'KMG', 'NAY',
]);
const isChinaMainland = computed(() => {
  const c = serverInfo.value.colo;
  return c ? CN_MAINLAND_COLOS.has(c) : false;
});

const running = computed(() => phase.value === 'running');
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 接入节点警告（运行时关键反馈，保留在显眼位置） -->
    <p
      v-if="serverInfo.country && !isChinaMainland"
      class="rounded-md border border-orange-500/30 bg-orange-50/60 px-3 py-2 text-xs text-orange-700 dark:bg-orange-500/5 dark:text-orange-300"
    >
      📡 当前接入境外节点 <strong>{{ serverInfo.city || serverInfo.country }} ({{ serverInfo.colo }})</strong>，速度可能受国际出口拥塞影响，<strong>结果偏低不一定代表本地网络差</strong>。
    </p>

    <!-- 主操作 -->
    <div class="flex flex-wrap items-center gap-3">
      <Button v-if="!running" variant="primary" @click="runTest">
        <Play :size="14" />
        {{ phase === 'idle' ? '开始测试' : '重新测试' }}
      </Button>
      <Button v-else variant="destructive" @click="stop">
        <Square :size="14" />停止
      </Button>
      <span class="text-sm text-muted-foreground">
        {{ running ? currentPhaseText : (phase === 'done' ? '测试完成' : phase === 'error' ? '测试失败' : '点击"开始测试"运行') }}
      </span>
      <span v-if="serverInfo.colo" class="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin :size="12" />
        接入 Cloudflare {{ serverInfo.city || serverInfo.country }} ({{ serverInfo.colo }})
      </span>
    </div>

    <!-- 错误 -->
    <div v-if="error" class="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle :size="16" class="mt-0.5 flex-none" />
      <span class="break-all">{{ error }}</span>
    </div>

    <!-- 实时进度条 -->
    <div v-if="running" class="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">{{ currentPhaseText || '准备中…' }}</span>
        <span class="font-mono text-muted-foreground">{{ progressPct.toFixed(0) }}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div class="h-full bg-primary transition-[width] duration-200" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <!-- 4 个指标卡片 -->
    <div class="grid gap-3 sm:grid-cols-4">
      <article class="flex flex-col gap-1 rounded-lg border bg-card p-4">
        <div class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <Activity :size="12" class="text-amber-500" />延迟
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-semibold tabular-nums">{{ pingMs ?? '—' }}</span>
          <span class="text-xs text-muted-foreground">ms</span>
        </div>
      </article>
      <article class="flex flex-col gap-1 rounded-lg border bg-card p-4">
        <div class="flex items-center gap-1.5 tool-section-title">
          <Activity :size="12" class="text-amber-500" />抖动
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-semibold tabular-nums">{{ jitterMs ?? '—' }}</span>
          <span class="text-xs text-muted-foreground">ms</span>
        </div>
      </article>
      <article class="flex flex-col gap-1 rounded-lg border bg-card p-4">
        <div class="flex items-center gap-1.5 tool-section-title">
          <Download :size="12" class="text-emerald-500" />下载
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-semibold tabular-nums">{{ fmtMbps(downloadMbps) }}</span>
          <span class="text-xs text-muted-foreground">Mbps</span>
        </div>
      </article>
      <article class="flex flex-col gap-1 rounded-lg border bg-card p-4">
        <div class="flex items-center gap-1.5 tool-section-title">
          <Upload :size="12" class="text-blue-500" />上传
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-semibold tabular-nums">{{ fmtMbps(uploadMbps) }}</span>
          <span class="text-xs text-muted-foreground">Mbps</span>
        </div>
      </article>
    </div>

    <!-- 完成后小贴士 -->
    <div v-if="phase === 'done'" class="flex flex-col gap-1 text-xs text-muted-foreground">
      <p>
        <Gauge :size="11" class="inline" /> 1 Mbps ≈ 125 KB/s。游戏延迟 &lt; 50ms 极佳、50-100ms 良好、&gt; 150ms 偏高；视频会议下载 &gt; 5 Mbps、上传 &gt; 1 Mbps 即可流畅。
      </p>
      <p v-if="!isChinaMainland && serverInfo.colo">
        💡 本次测速接入境外节点，结果可能受国际出口影响。如需测本地宽带真实速度，推荐使用
        <a href="https://www.speedtest.cn" target="_blank" rel="noopener" class="text-primary hover:underline">speedtest.cn</a>
        或运营商官方测速。
      </p>
    </div>

    <!-- 数据来源说明（次要信息放最下方） -->
    <p class="text-xs text-muted-foreground">
      数据来源：Cloudflare 官方测速 SDK（@cloudflare/speedtest），测速到 Cloudflare 边缘节点，结果反映国际/区域出口带宽，不等于本地宽带真实速度。
    </p>
  </div>
</template>
