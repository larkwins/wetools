<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick, computed } from 'vue';
import { Plug, PlugZap, Send, Trash2, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';

type Status = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
type LogLevel = 'info' | 'sent' | 'recv' | 'error';

interface LogEntry {
  ts: string;
  level: LogLevel;
  text: string;
}

// 默认使用 Postman 的官方 echo（更稳定）；echo.websocket.events 偶尔会握手失败。
const url = ref('wss://ws.postman-echo.com/raw');
const protocols = ref('');

// 常用公共 echo / 测试服务预设
const presets: Array<{ url: string; label: string }> = [
  { url: 'wss://ws.postman-echo.com/raw', label: 'Postman Echo' },
  { url: 'wss://echo.websocket.events', label: 'Lob Echo' },
  { url: 'wss://socketsbay.com/wss/v2/1/demo/', label: 'Socketsbay' },
  { url: 'wss://stream.binance.com:9443/ws/btcusdt@trade', label: 'Binance BTC trades' },
];
const status = ref<Status>('idle');
const messageInput = ref('Hello, WeTools');
const logs = ref<LogEntry[]>([]);
const autoScroll = ref(true);
const logsEl = ref<HTMLDivElement | null>(null);

let ws: WebSocket | null = null;

function now(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

/** RFC 6455 CloseEvent.code 说明 */
function describeCloseCode(code: number): string {
  const map: Record<number, string> = {
    1000: '正常关闭',
    1001: '端点离开',
    1002: '协议错误',
    1003: '数据类型不支持',
    1005: '未给出状态码',
    1006: '异常关闭（TLS/网络断开或对端未发送 Close 帧）',
    1007: '数据不一致（非 UTF-8）',
    1008: '违反策略',
    1009: '消息过大',
    1010: '需要扩展',
    1011: '服务端内部错误',
    1012: '服务重启中',
    1013: '稍后重试',
    1014: '网关错误',
    1015: 'TLS 握手失败',
  };
  return map[code] ?? '';
}

function log(level: LogLevel, text: string) {
  logs.value.push({ ts: now(), level, text });
  if (autoScroll.value) {
    void nextTick(() => {
      if (logsEl.value) logsEl.value.scrollTop = logsEl.value.scrollHeight;
    });
  }
}

function connect() {
  if (ws) disconnect();
  const u = url.value.trim();
  if (!u) {
    log('error', 'URL 不能为空');
    return;
  }
  if (!/^wss?:\/\//.test(u)) {
    log('error', '只支持 ws:// 或 wss:// 协议');
    return;
  }
  try {
    status.value = 'connecting';
    log('info', `正在连接 ${u}…`);
    const protos = protocols.value.trim()
      ? protocols.value.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    ws = protos ? new WebSocket(u, protos) : new WebSocket(u);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      status.value = 'open';
      log('info', `已连接（${ws?.protocol ? '子协议: ' + ws.protocol : '无子协议'}）`);
    };
    ws.onmessage = (e: MessageEvent) => {
      let text: string;
      if (typeof e.data === 'string') {
        text = e.data;
      } else if (e.data instanceof ArrayBuffer) {
        const u8 = new Uint8Array(e.data);
        text = `[binary ${u8.length} B] ` + Array.from(u8.slice(0, 32)).map((b) => b.toString(16).padStart(2, '0')).join(' ') + (u8.length > 32 ? ' …' : '');
      } else {
        text = String(e.data);
      }
      log('recv', text);
    };
    ws.onerror = () => {
      status.value = 'error';
      log('error', '连接错误（浏览器出于安全考虑不会暴露具体原因，常见情况见下方说明）');
    };
    ws.onclose = (e) => {
      status.value = 'closed';
      const codeDesc = describeCloseCode(e.code);
      log('info', `已关闭（code=${e.code}${codeDesc ? ' · ' + codeDesc : ''}${e.reason ? ', reason=' + e.reason : ''}）`);
      ws = null;
    };
  } catch (e) {
    status.value = 'error';
    log('error', '创建 WebSocket 失败：' + ((e as Error).message || String(e)));
  }
}

function disconnect() {
  if (!ws) return;
  try {
    ws.close(1000, 'client closed');
  } catch {/* ignore */}
  ws = null;
  status.value = 'closed';
}

function send() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    log('error', '未连接，无法发送');
    return;
  }
  const msg = messageInput.value;
  try {
    ws.send(msg);
    log('sent', msg);
  } catch (e) {
    log('error', '发送失败：' + ((e as Error).message || String(e)));
  }
}

function clearLogs() {
  logs.value = [];
}

const statusBadge = computed(() => {
  switch (status.value) {
    case 'open': return { l: '已连接', c: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    case 'connecting': return { l: '连接中', c: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    case 'closed': return { l: '已关闭', c: 'bg-secondary text-muted-foreground border-border' };
    case 'error': return { l: '错误', c: 'bg-destructive/10 text-destructive border-destructive/30' };
    default: return { l: '未连接', c: 'bg-secondary text-muted-foreground border-border' };
  }
});

const levelClass: Record<LogLevel, string> = {
  info: 'text-muted-foreground',
  sent: 'text-blue-600 dark:text-blue-400',
  recv: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-destructive',
};
const levelLabel: Record<LogLevel, string> = {
  info: 'INFO',
  sent: '↑ SEND',
  recv: '↓ RECV',
  error: 'ERR',
};

onBeforeUnmount(disconnect);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <Input v-model="url" placeholder="wss://example.com/ws" />
      <Input v-model="protocols" placeholder="子协议（逗号分隔，可选）" class="sm:w-60" />
      <div class="flex gap-2">
        <Button v-if="status !== 'open' && status !== 'connecting'" variant="primary" @click="connect">
          <Plug :size="14" />连接
        </Button>
        <Button v-else variant="destructive" @click="disconnect">
          <PlugZap :size="14" />断开
        </Button>
      </div>
    </div>

    <!-- 常用 echo / 测试服务预设 -->
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="text-xs text-muted-foreground">常用：</span>
      <button
        v-for="p in presets"
        :key="p.url"
        type="button"
        :class="['rounded-md border bg-card px-2.5 py-1 text-[11px] transition-colors',
          url === p.url ? 'border-primary/60 text-primary' : 'text-muted-foreground hover:text-foreground']"
        @click="url = p.url"
      >{{ p.label }}</button>
    </div>

    <div class="flex items-center gap-2">
      <span :class="['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', statusBadge.c]">
        <span class="h-1.5 w-1.5 rounded-full" :class="status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-60'"></span>
        {{ statusBadge.l }}
      </span>
      <span class="text-xs text-muted-foreground">{{ logs.length }} 条日志</span>
      <label class="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
        <input v-model="autoScroll" type="checkbox" class="accent-[hsl(var(--primary))]" />自动滚动
      </label>
      <Button variant="ghost" size="sm" @click="clearLogs">
        <Trash2 :size="13" />清空
      </Button>
    </div>

    <div ref="logsEl" class="h-80 overflow-y-auto rounded-lg border bg-card p-3 font-mono text-xs">
      <div v-if="logs.length === 0" class="flex h-full items-center justify-center text-muted-foreground">
        <span class="flex items-center gap-1.5"><AlertCircle :size="12" />日志为空，连接后收发消息会出现在这里</span>
      </div>
      <div v-for="(item, i) in logs" :key="i" class="flex items-start gap-2 py-0.5">
        <span class="shrink-0 text-muted-foreground/70">{{ item.ts }}</span>
        <span :class="['shrink-0 w-14 font-semibold', levelClass[item.level]]">{{ levelLabel[item.level] }}</span>
        <span class="break-all" :class="levelClass[item.level]">{{ item.text }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="tool-section-title">发送消息</label>
      <div class="flex gap-2">
        <Textarea v-model="messageInput" mono :rows="3" placeholder="要发送的文本…" />
        <Button variant="primary" :disabled="status !== 'open'" @click="send" class="self-stretch">
          <Send :size="14" />发送
        </Button>
      </div>
    </div>

    <div class="space-y-1 text-xs text-muted-foreground">
      <p>使用浏览器原生 WebSocket，连接与消息全部在客户端处理，不经任何中转。</p>
      <p>连接失败常见原因：① HTTPS 页面只能连 wss://（不能连 ws://）；② 远端服务暂时不可用；③ 公司网络/防火墙拦截 WebSocket；④ 跨域 CSP 限制。</p>
    </div>
  </div>
</template>
