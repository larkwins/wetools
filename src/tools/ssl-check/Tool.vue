<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';

// ============================================================
// 设计说明：
// 浏览器无法直接读取站点 TLS 配置（沙箱限制），SSL Labs 等权威 API
// 也禁止从浏览器跨域调用（403）。所以本工具：
//   1. 提供一键跳转到 3 个权威在线检测站点（SSL Labs / MySSL /
//      Mozilla Observatory）→ 用户在新窗口看完整报告
//   2. 通过 Certificate Transparency Log 查询该域名的证书签发记录：
//      - 主源：certspotter (api.certspotter.com)，由 SSLMate 运营，
//              CORS 全开、响应秒级、数据格式干净
//      - 兜底：crt.sh，certspotter 失败时尝试（更全面但慢）
// ============================================================

// certspotter API 返回（精简）
interface CertSpotterEntry {
  id: string;
  cert_sha256?: string;
  dns_names: string[];
  issuer?: { friendly_name?: string; name?: string };
  not_before: string;          // ISO
  not_after: string;           // ISO
  revoked?: boolean;
}

// crt.sh 兜底响应
interface CrtEntry {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  serial_number: string;
}

interface CertGroup {
  issuer: string;          // 友好名（如 "Sectigo" / "DigiCert"）
  commonName: string;
  altNames: string[];
  notBefore: number;       // ms
  notAfter: number;        // ms
  fingerprint: string;     // 用于去重；certspotter 用 cert_sha256，crt.sh 用 serial_number
  revoked?: boolean;
  source: 'certspotter' | 'crt.sh';
}

const host = ref('');
const groups = ref<CertGroup[]>([]);
const error = ref('');
const loading = ref(false);
const loadingHint = ref('');
const lastQueried = ref('');
// crt.sh 兜底时控制是否包含已过期（certspotter 一次性返回全部，前端再分流）
const onlyValid = ref(true);

let abortCtrl: AbortController | null = null;

function abort() {
  if (abortCtrl) {
    abortCtrl.abort();
    abortCtrl = null;
  }
}

onBeforeUnmount(abort);

// 把用户输入清洗成 host
function normalizeHost(input: string): string {
  let h = input.trim();
  if (!h) return '';
  h = h.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
  return h.toLowerCase();
}

// 从 issuer DN 里提取易读名（优先 CN，否则 O）
function simplifyIssuer(dn: string): string {
  const cn = /CN=([^,]+)/.exec(dn)?.[1];
  if (cn) return cn.trim();
  const o = /O=([^,]+)/.exec(dn)?.[1];
  return (o ?? dn).trim();
}

/**
 * 主源：certspotter (SSLMate 运营)
 *   - CORS 全开，响应秒级
 *   - 免费版每小时 100 个不重复域名查询
 *   - 默认只查精确域名；想包含子域要 include_subdomains=true（会大幅减慢且数据多）
 *   - 默认只返回最近 N 条；后续翻页用 after=ID 拉历史
 */
async function fetchCertSpotter(domain: string, signal: AbortSignal): Promise<CertSpotterEntry[]> {
  const params = new URLSearchParams({
    domain,
    include_subdomains: 'false',
    expand: 'dns_names',
  });
  // 三个 expand 必须用三个 key，URLSearchParams 不能直接传重复 key 数组，手动拼
  const url = `https://api.certspotter.com/v1/issuances?${params.toString()}&expand=issuer&expand=not_before&expand=not_after&expand=revocation`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    if (res.status === 429) throw new Error('certspotter 限流（免费版 100 次/小时），请稍后重试');
    throw new Error(`certspotter 返回 HTTP ${res.status}`);
  }
  return (await res.json()) as CertSpotterEntry[];
}

function aggregateCertSpotter(entries: CertSpotterEntry[]): CertGroup[] {
  const map = new Map<string, CertGroup>();
  for (const e of entries) {
    const key = e.cert_sha256 ?? e.id;
    if (map.has(key)) continue;
    const issuer = e.issuer?.friendly_name || simplifyIssuer(e.issuer?.name ?? '') || '未知 CA';
    const altNames = (e.dns_names || []).filter(Boolean);
    // certspotter 把通配符或主域随机放第一个，挑最短的作为 commonName 展示
    const commonName = altNames.length ? [...altNames].sort((a, b) => a.length - b.length)[0] : '—';
    map.set(key, {
      issuer,
      commonName,
      altNames,
      notBefore: Date.parse(e.not_before),
      notAfter: Date.parse(e.not_after),
      fingerprint: key,
      revoked: e.revoked,
      source: 'certspotter',
    });
  }
  return [...map.values()].sort((a, b) => b.notAfter - a.notAfter);
}

/**
 * 兜底：crt.sh（certspotter 失败时调用）
 *   - 用 Identity=DOMAIN（精确索引）+ deduplicate=Y（服务侧去重）
 *   - exclude=expired 进一步减少数据量
 */
async function fetchCrtSh(domain: string, includeExpired: boolean, signal: AbortSignal): Promise<CrtEntry[]> {
  const params = new URLSearchParams({
    Identity: domain,
    output: 'json',
    deduplicate: 'Y',
    ...(includeExpired ? {} : { exclude: 'expired' }),
  });
  const res = await fetch(`https://crt.sh/?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`crt.sh 返回 HTTP ${res.status}`);
  const text = await res.text();
  if (!text.trim()) return [];
  try {
    return JSON.parse(text) as CrtEntry[];
  } catch {
    throw new Error('crt.sh 返回了非 JSON 内容（可能正在维护）');
  }
}

function aggregateCrtSh(entries: CrtEntry[]): CertGroup[] {
  const map = new Map<string, CertGroup>();
  for (const e of entries) {
    const key = e.serial_number;
    if (map.has(key)) continue;
    const altNames = e.name_value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    map.set(key, {
      issuer: simplifyIssuer(e.issuer_name),
      commonName: e.common_name,
      altNames,
      notBefore: Date.parse(e.not_before + 'Z'),
      notAfter: Date.parse(e.not_after + 'Z'),
      fingerprint: key,
      source: 'crt.sh',
    });
  }
  return [...map.values()].sort((a, b) => b.notAfter - a.notAfter);
}

async function query() {
  const h = normalizeHost(host.value);
  if (!h) {
    error.value = '请输入有效的域名';
    return;
  }
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h)) {
    error.value = '域名格式不正确（示例：example.com）';
    return;
  }
  abort();
  loading.value = true;
  error.value = '';
  groups.value = [];
  lastQueried.value = h;

  abortCtrl = new AbortController();
  const TIMEOUT_MS = 15_000; // certspotter 通常 < 2s，15s 已是异常
  const timeoutId = window.setTimeout(() => abortCtrl?.abort(), TIMEOUT_MS);
  loadingHint.value = '正在查询 certspotter…';

  try {
    const entries = await fetchCertSpotter(h, abortCtrl.signal);
    groups.value = aggregateCertSpotter(entries);
    window.clearTimeout(timeoutId);
  } catch (e) {
    window.clearTimeout(timeoutId);
    const err = e as Error;
    const isLimit = /限流|429/.test(err.message || '');
    if (err.name !== 'AbortError' && !isLimit) {
      // 真错误才尝试 crt.sh 兜底；超时和限流不重试（兜底会更慢/也同样会失败）
      try {
        loadingHint.value = 'certspotter 失败，切换 crt.sh 兜底（最长 60s）…';
        abortCtrl = new AbortController();
        const fbTimeout = window.setTimeout(() => abortCtrl?.abort(), 60_000);
        const fbEntries = await fetchCrtSh(h, !onlyValid.value, abortCtrl.signal);
        groups.value = aggregateCrtSh(fbEntries);
        window.clearTimeout(fbTimeout);
        if (!groups.value.length) {
          error.value = `未在 CT 日志中找到 ${h} 的证书`;
        }
      } catch (e2) {
        const err2 = e2 as Error;
        error.value = err2.name === 'AbortError'
          ? '两个数据源都超时了，请稍后重试'
          : `查询失败：${err.message}；兜底也失败：${err2.message}`;
      }
    } else if (err.name === 'AbortError') {
      error.value = `certspotter 响应超时（${TIMEOUT_MS / 1000}s 未返回），请重试`;
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
    loadingHint.value = '';
    abortCtrl = null;
  }
}

// ============================================================
// 在线检测平台一键跳转
// ============================================================
const externalScanners = computed(() => {
  const h = normalizeHost(host.value) || 'example.com';
  return [
    {
      name: 'Qualys SSL Labs',
      desc: '业界标杆，A+~F 评级 / 协议 / 套件 / 漏洞全维度',
      url: `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(h)}&hideResults=on`,
    },
    {
      name: 'Mozilla Observatory',
      desc: 'Mozilla 出品，含 HTTP 响应头安全评分',
      url: `https://observatory.mozilla.org/analyze/${encodeURIComponent(h)}`,
    },
    {
      name: 'MySSL',
      desc: '国内站点，含中文报告与证书链可视化',
      url: `https://myssl.com/${encodeURIComponent(h)}`,
    },
  ];
});

// ============================================================
// 衍生展示
// ============================================================
function formatDate(ms: number): string {
  if (!ms || isNaN(ms)) return '—';
  return new Date(ms).toLocaleDateString() + ' ' + new Date(ms).toLocaleTimeString();
}

function daysLeft(notAfter: number): { text: string; cls: string } {
  if (!notAfter || isNaN(notAfter)) return { text: '—', cls: '' };
  const days = Math.floor((notAfter - Date.now()) / 86400000);
  if (days < 0) return { text: `已过期 ${-days} 天`, cls: 'text-muted-foreground line-through' };
  if (days < 15) return { text: `仅剩 ${days} 天`, cls: 'text-red-500' };
  if (days < 30) return { text: `仅剩 ${days} 天`, cls: 'text-amber-500' };
  return { text: `${days} 天后过期`, cls: 'text-emerald-500' };
}

const validGroups = computed(() => groups.value.filter((g) => g.notAfter > Date.now()));
const expiredGroups = computed(() => groups.value.filter((g) => g.notAfter <= Date.now()));
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 输入 -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        v-model="host"
        placeholder="example.com（或粘贴完整 URL）"
        class="flex-1 font-mono"
        @keydown.enter="query()"
      />
      <Button variant="primary" :disabled="loading" @click="query()">
        <ShieldCheck v-if="!loading" :size="14" />
        <Loader2 v-else :size="14" class="animate-spin" />
        {{ loading ? '查询中…' : '查询证书' }}
      </Button>
    </div>

    <!-- Loading 进度提示 -->
    <div v-if="loading" class="flex items-center gap-2 rounded-md border bg-card p-3 text-sm text-muted-foreground">
      <Loader2 :size="16" class="flex-none animate-spin text-primary" />
      <span>{{ loadingHint || '查询中…' }}</span>
    </div>

    <!-- 一键跳转检测平台 -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">在线检测（新窗口打开权威报告）</p>
      <div class="grid gap-2 sm:grid-cols-3">
        <a
          v-for="s in externalScanners"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex flex-col gap-1 rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ s.name }}</span>
            <ExternalLink :size="13" class="text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <span class="text-xs text-muted-foreground">{{ s.desc }}</span>
        </a>
      </div>
    </div>

    <!-- 错误 -->
    <div v-if="error" class="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <div class="flex items-start gap-2">
        <AlertCircle :size="16" class="mt-0.5 flex-none" />
        <span class="break-all">{{ error }}</span>
      </div>
      <div class="flex flex-wrap gap-2 pl-6">
        <Button variant="secondary" size="sm" @click="query()">
          <RefreshCw :size="12" />重试
        </Button>
        <a
          :href="`https://crt.sh/?q=${encodeURIComponent(lastQueried || host)}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:bg-secondary"
        >
          <ExternalLink :size="12" />在 crt.sh 网页端打开
        </a>
      </div>
    </div>

    <!-- 证书查询结果 -->
    <template v-if="lastQueried && !loading && !error">
      <!-- 概览统计 -->
      <div v-if="groups.length" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span class="text-muted-foreground">域名：<strong class="font-mono text-foreground">{{ lastQueried }}</strong></span>
        <span class="text-muted-foreground">共 <strong class="text-foreground">{{ groups.length }}</strong> 张证书记录</span>
        <span class="text-emerald-600 dark:text-emerald-400">{{ validGroups.length }} 张有效</span>
        <span class="text-muted-foreground">{{ expiredGroups.length }} 张已过期</span>
        <span class="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">来源：{{ groups[0].source }}</span>
        <Button variant="ghost" size="sm" @click="query()">
          <RefreshCw :size="12" />重查
        </Button>
      </div>

      <!-- 空结果 -->
      <div v-else class="rounded-md border border-dashed bg-card/40 py-12 text-center text-sm text-muted-foreground">
        未在 CT 日志中查询到 <span class="font-mono">{{ lastQueried }}</span> 的证书记录
      </div>

      <!-- 有效证书 -->
      <section v-if="validGroups.length" class="flex flex-col gap-2">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          有效证书（{{ validGroups.length }}）
        </h3>
        <div class="flex flex-col gap-2">
          <article
            v-for="g in validGroups.slice(0, 20)"
            :key="g.fingerprint"
            class="flex flex-col gap-2 rounded-lg border bg-card p-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <Building2 :size="14" class="flex-none text-muted-foreground" />
                <span class="text-sm font-medium">{{ g.issuer }}</span>
                <span v-if="g.revoked" class="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">已吊销</span>
              </div>
              <span :class="['text-xs font-medium', daysLeft(g.notAfter).cls]">{{ daysLeft(g.notAfter).text }}</span>
            </div>
            <div class="grid gap-1 text-xs sm:grid-cols-2">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Calendar :size="11" />
                <span>{{ formatDate(g.notBefore) }} → {{ formatDate(g.notAfter) }}</span>
              </div>
              <div class="text-muted-foreground">
                <span class="font-mono">{{ g.commonName }}</span>
                <span v-if="g.altNames.length > 1" class="ml-1">+ {{ g.altNames.length - 1 }} SAN</span>
              </div>
            </div>
            <details v-if="g.altNames.length > 1" open class="text-xs">
              <summary class="cursor-pointer text-muted-foreground hover:text-foreground">{{ g.altNames.length }} 个 SAN 域名</summary>
              <div class="mt-1 max-h-32 overflow-auto rounded border bg-background p-2 font-mono text-[11px]">
                <div v-for="n in g.altNames" :key="n">{{ n }}</div>
              </div>
            </details>
          </article>
        </div>
        <p v-if="validGroups.length > 20" class="text-xs text-muted-foreground">仅显示前 20 张，共 {{ validGroups.length }} 张有效证书</p>
      </section>

      <!-- 历史证书（折叠） -->
      <details v-if="expiredGroups.length" class="rounded-lg border bg-card/30">
        <summary class="cursor-pointer p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          历史已过期证书（{{ expiredGroups.length }}）
        </summary>
        <div class="flex flex-col gap-1 px-3 pb-3 text-xs">
          <div
            v-for="g in expiredGroups.slice(0, 30)"
            :key="g.fingerprint"
            class="flex items-center justify-between gap-2 border-t py-1.5"
          >
            <div class="flex min-w-0 items-center gap-2">
              <span class="truncate text-muted-foreground">{{ g.issuer }}</span>
              <span class="truncate font-mono">{{ g.commonName }}</span>
            </div>
            <span class="flex-none text-muted-foreground">{{ new Date(g.notAfter).toLocaleDateString() }}</span>
          </div>
          <p v-if="expiredGroups.length > 30" class="mt-2 text-muted-foreground">仅显示前 30 条，共 {{ expiredGroups.length }} 条历史记录</p>
        </div>
      </details>
    </template>

    <!-- 空状态 -->
    <div v-else-if="!lastQueried && !loading" class="rounded-md border border-dashed bg-card/40 py-12 text-center text-sm text-muted-foreground">
      输入域名后可：① 一键查看 SSL Labs 等权威报告；② 查询 CT 日志中的所有证书签发记录
    </div>

    <!-- 数据来源说明（次要信息放最下方） -->
    <p class="text-xs text-muted-foreground">
      数据来源：Certificate Transparency Log（主源 certspotter.com，兜底 crt.sh）；浏览器无法直接读取 TLS 证书与协议细节，故 SSL Labs / Mozilla Observatory / MySSL 等深度检测需跳转到对应站点。
    </p>
  </div>
</template>
