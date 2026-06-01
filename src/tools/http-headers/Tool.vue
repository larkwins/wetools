<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';

interface HeaderRow {
  name: string;
  type: 'request' | 'response' | 'both';
  category: 'general' | 'auth' | 'cache' | 'cors' | 'cookie' | 'security' | 'content' | 'condition';
  desc: string;
  example?: string;
}

const HEADERS: HeaderRow[] = [
  // general
  { name: 'Host', type: 'request', category: 'general', desc: '指定请求的服务器域名（含端口）。', example: 'Host: example.com:8080' },
  { name: 'User-Agent', type: 'request', category: 'general', desc: '客户端标识：浏览器/OS/版本。', example: 'Mozilla/5.0 (...)' },
  { name: 'Referer', type: 'request', category: 'general', desc: '当前请求的来源页面 URL。', example: 'https://google.com/' },
  { name: 'Accept', type: 'request', category: 'content', desc: '客户端可接受的响应内容类型。', example: 'Accept: text/html, application/json' },
  { name: 'Accept-Encoding', type: 'request', category: 'content', desc: '可接受的内容编码（压缩）。', example: 'gzip, br, deflate' },
  { name: 'Accept-Language', type: 'request', category: 'content', desc: '可接受的语言。', example: 'zh-CN, en;q=0.9' },
  { name: 'Connection', type: 'both', category: 'general', desc: '连接管理：keep-alive / close / Upgrade。', example: 'keep-alive' },
  { name: 'Date', type: 'response', category: 'general', desc: '服务器生成响应的时间。' },
  { name: 'Server', type: 'response', category: 'general', desc: '服务器软件标识。', example: 'nginx/1.25.0' },

  // auth
  { name: 'Authorization', type: 'request', category: 'auth', desc: '认证凭证：Basic / Bearer / Digest。', example: 'Bearer eyJhbGc...' },
  { name: 'WWW-Authenticate', type: 'response', category: 'auth', desc: '401 时挑战客户端进行认证。', example: 'Basic realm="api"' },
  { name: 'Proxy-Authorization', type: 'request', category: 'auth', desc: '代理服务器认证凭证。' },
  { name: 'Proxy-Authenticate', type: 'response', category: 'auth', desc: '407 代理认证挑战。' },

  // cache
  { name: 'Cache-Control', type: 'both', category: 'cache', desc: '缓存策略指令：max-age / no-cache / no-store / public / private。', example: 'public, max-age=31536000' },
  { name: 'ETag', type: 'response', category: 'cache', desc: '资源版本标识，配合 If-None-Match 做协商缓存。', example: '"33a64df5"' },
  { name: 'Last-Modified', type: 'response', category: 'cache', desc: '资源最后修改时间，配合 If-Modified-Since。' },
  { name: 'Expires', type: 'response', category: 'cache', desc: '资源过期时间（HTTP/1.0），优先级低于 Cache-Control。' },
  { name: 'Age', type: 'response', category: 'cache', desc: '资源在代理缓存中存在的秒数。' },
  { name: 'Vary', type: 'response', category: 'cache', desc: '指明哪些请求头影响缓存命中。', example: 'Accept-Encoding' },

  // condition
  { name: 'If-None-Match', type: 'request', category: 'condition', desc: '配合 ETag 做条件请求，匹配则返回 304。' },
  { name: 'If-Modified-Since', type: 'request', category: 'condition', desc: '资源未修改则返回 304。' },
  { name: 'If-Match', type: 'request', category: 'condition', desc: 'ETag 匹配才执行（用于乐观锁）。' },
  { name: 'If-Unmodified-Since', type: 'request', category: 'condition', desc: '资源未修改才执行。' },
  { name: 'Range', type: 'request', category: 'condition', desc: '范围请求（断点续传 / 视频流）。', example: 'Range: bytes=0-1023' },
  { name: 'Accept-Ranges', type: 'response', category: 'condition', desc: '声明服务器支持的范围单位。', example: 'bytes' },
  { name: 'Content-Range', type: 'response', category: 'condition', desc: '206 响应中返回的字节范围。', example: 'bytes 0-1023/2048' },

  // cors
  { name: 'Origin', type: 'request', category: 'cors', desc: '跨域请求的源。', example: 'https://app.example.com' },
  { name: 'Access-Control-Allow-Origin', type: 'response', category: 'cors', desc: '允许的跨域来源（* 或具体域名）。', example: '*' },
  { name: 'Access-Control-Allow-Methods', type: 'response', category: 'cors', desc: '预检请求允许的方法。', example: 'GET, POST, PUT, DELETE' },
  { name: 'Access-Control-Allow-Headers', type: 'response', category: 'cors', desc: '预检请求允许的自定义头。' },
  { name: 'Access-Control-Allow-Credentials', type: 'response', category: 'cors', desc: '是否允许携带 Cookie。', example: 'true' },
  { name: 'Access-Control-Expose-Headers', type: 'response', category: 'cors', desc: '允许 JS 读取的响应头白名单。' },
  { name: 'Access-Control-Max-Age', type: 'response', category: 'cors', desc: '预检结果缓存秒数。', example: '86400' },
  { name: 'Access-Control-Request-Method', type: 'request', category: 'cors', desc: '预检请求声明实际方法。' },
  { name: 'Access-Control-Request-Headers', type: 'request', category: 'cors', desc: '预检请求声明实际自定义头。' },

  // cookie
  { name: 'Cookie', type: 'request', category: 'cookie', desc: '客户端发送给服务器的 Cookie。' },
  { name: 'Set-Cookie', type: 'response', category: 'cookie', desc: '服务器设置 Cookie。', example: 'sid=abc; HttpOnly; Secure; SameSite=Lax' },

  // security
  { name: 'Strict-Transport-Security', type: 'response', category: 'security', desc: 'HSTS，强制使用 HTTPS。', example: 'max-age=63072000; includeSubDomains; preload' },
  { name: 'Content-Security-Policy', type: 'response', category: 'security', desc: 'CSP，限制资源加载来源。', example: "default-src 'self'" },
  { name: 'X-Content-Type-Options', type: 'response', category: 'security', desc: '禁止 MIME 嗅探。', example: 'nosniff' },
  { name: 'X-Frame-Options', type: 'response', category: 'security', desc: '是否允许被 iframe 嵌入。', example: 'DENY / SAMEORIGIN' },
  { name: 'X-XSS-Protection', type: 'response', category: 'security', desc: '旧版 XSS 过滤器开关（现代浏览器已弃用，推荐用 CSP）。' },
  { name: 'Referrer-Policy', type: 'response', category: 'security', desc: '控制 Referer 头的发送策略。', example: 'no-referrer-when-downgrade' },
  { name: 'Permissions-Policy', type: 'response', category: 'security', desc: '控制浏览器特性使用权限。', example: 'camera=(), microphone=()' },
  { name: 'Cross-Origin-Opener-Policy', type: 'response', category: 'security', desc: 'COOP，隔离跨源窗口。', example: 'same-origin' },
  { name: 'Cross-Origin-Embedder-Policy', type: 'response', category: 'security', desc: 'COEP，控制跨源资源加载。', example: 'require-corp' },
  { name: 'Cross-Origin-Resource-Policy', type: 'response', category: 'security', desc: 'CORP，限制资源被跨源加载。' },

  // content
  { name: 'Content-Type', type: 'both', category: 'content', desc: '实体的媒体类型与字符集。', example: 'application/json; charset=utf-8' },
  { name: 'Content-Length', type: 'both', category: 'content', desc: '实体大小（字节）。' },
  { name: 'Content-Encoding', type: 'both', category: 'content', desc: '实体的编码方式（压缩）。', example: 'gzip' },
  { name: 'Content-Language', type: 'both', category: 'content', desc: '实体的语言。' },
  { name: 'Content-Disposition', type: 'response', category: 'content', desc: '指示浏览器以附件下载还是内嵌显示。', example: 'attachment; filename="report.pdf"' },
  { name: 'Content-Location', type: 'response', category: 'content', desc: '资源的备用 URL。' },
  { name: 'Location', type: 'response', category: 'general', desc: '重定向的目标 URL（3xx / 201）。' },
  { name: 'Allow', type: 'response', category: 'general', desc: '资源支持的方法列表（405 响应）。', example: 'GET, HEAD, POST' },
  { name: 'Retry-After', type: 'response', category: 'general', desc: '503 / 429 时建议客户端等待秒数或时间。', example: '120' },
  { name: 'Upgrade', type: 'request', category: 'general', desc: '协议升级请求（如 WebSocket）。', example: 'websocket' },
];

type Cat = HeaderRow['category'] | 'all';
type Ty = HeaderRow['type'] | 'all-type';

const filterCat = ref<Cat>('all');
const filterType = ref<Ty>('all-type');
const keyword = ref('');

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return HEADERS.filter((h) => {
    if (filterCat.value !== 'all' && h.category !== filterCat.value) return false;
    if (filterType.value !== 'all-type' && h.type !== filterType.value && h.type !== 'both') return false;
    if (!kw) return true;
    return h.name.toLowerCase().includes(kw) || h.desc.toLowerCase().includes(kw);
  });
});

const cats: Array<{ k: Cat; l: string }> = [
  { k: 'all', l: '全部' },
  { k: 'general', l: '通用' },
  { k: 'content', l: '内容' },
  { k: 'auth', l: '认证' },
  { k: 'cache', l: '缓存' },
  { k: 'condition', l: '条件' },
  { k: 'cors', l: 'CORS' },
  { k: 'cookie', l: 'Cookie' },
  { k: 'security', l: '安全' },
];

const types: Array<{ k: Ty; l: string }> = [
  { k: 'all-type', l: '请求 + 响应' },
  { k: 'request', l: '仅请求' },
  { k: 'response', l: '仅响应' },
];

const typeBadge: Record<HeaderRow['type'], string> = {
  request: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  response: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  both: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};
const typeLabel: Record<HeaderRow['type'], string> = {
  request: '请求',
  response: '响应',
  both: '通用',
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" placeholder="搜索头名称或说明…" class="pl-9" />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="flex flex-wrap gap-1.5">
        <button v-for="c in cats" :key="c.k" type="button"
          :class="['rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            filterCat === c.k ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground']"
          @click="filterCat = c.k"
        >{{ c.l }}</button>
      </div>
      <div class="ml-auto inline-flex rounded-md border bg-card p-0.5">
        <button v-for="t in types" :key="t.k" type="button"
          :class="['h-7 rounded-sm px-2.5 text-[11px] font-medium', filterType === t.k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="filterType = t.k"
        >{{ t.l }}</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="rounded-md border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
      没有匹配的请求头
    </div>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <div v-for="h in filtered" :key="h.name" class="flex flex-col gap-1.5 rounded-lg border bg-card p-3">
        <div class="flex items-center gap-2">
          <code class="font-mono text-sm font-semibold text-foreground">{{ h.name }}</code>
          <span :class="['rounded px-1.5 py-0.5 text-[10px] font-medium', typeBadge[h.type]]">{{ typeLabel[h.type] }}</span>
        </div>
        <p class="text-xs leading-relaxed text-muted-foreground">{{ h.desc }}</p>
        <pre v-if="h.example" class="overflow-x-auto rounded bg-secondary/50 px-2 py-1 font-mono text-[11px] text-foreground/90"><code>{{ h.example }}</code></pre>
      </div>
    </div>
  </div>
</template>
