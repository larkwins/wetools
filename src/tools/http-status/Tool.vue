<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';

interface StatusItem {
  code: number;
  name: string;
  desc: string;
  rfc?: string;
}

// 完整状态码列表（IANA / RFC 7231, 7232, 7233, 7235, 6585, 4918 等）
const STATUS: StatusItem[] = [
  // 1xx Informational
  { code: 100, name: 'Continue', desc: '服务器已收到请求头，客户端应继续发送请求体。', rfc: 'RFC 7231' },
  { code: 101, name: 'Switching Protocols', desc: '服务器同意通过 Upgrade 头切换协议（如 HTTP/2、WebSocket）。', rfc: 'RFC 7231' },
  { code: 102, name: 'Processing', desc: '服务器已收到并正在处理请求（WebDAV）。', rfc: 'RFC 2518' },
  { code: 103, name: 'Early Hints', desc: '在最终响应前提示客户端可以预加载资源。', rfc: 'RFC 8297' },

  // 2xx Success
  { code: 200, name: 'OK', desc: '请求成功，响应体包含请求资源。', rfc: 'RFC 7231' },
  { code: 201, name: 'Created', desc: '请求已成功并创建了新资源，通常用于 POST。', rfc: 'RFC 7231' },
  { code: 202, name: 'Accepted', desc: '请求已接受但尚未处理完成（异步处理）。', rfc: 'RFC 7231' },
  { code: 203, name: 'Non-Authoritative Information', desc: '响应内容来自第三方而非源服务器。', rfc: 'RFC 7231' },
  { code: 204, name: 'No Content', desc: '请求成功但无返回内容，常用于 DELETE / PUT。', rfc: 'RFC 7231' },
  { code: 205, name: 'Reset Content', desc: '请求成功，要求客户端重置视图。', rfc: 'RFC 7231' },
  { code: 206, name: 'Partial Content', desc: '范围请求成功（断点续传 / 视频流）。', rfc: 'RFC 7233' },
  { code: 207, name: 'Multi-Status', desc: '多个资源的复合状态（WebDAV）。', rfc: 'RFC 4918' },
  { code: 208, name: 'Already Reported', desc: '已在前面响应中报告过（WebDAV）。', rfc: 'RFC 5842' },
  { code: 226, name: 'IM Used', desc: '已应用一个或多个实例操作。', rfc: 'RFC 3229' },

  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', desc: '请求资源有多个表示形式，由客户端选择。', rfc: 'RFC 7231' },
  { code: 301, name: 'Moved Permanently', desc: '资源永久迁移到新 URL，后续应使用新地址。', rfc: 'RFC 7231' },
  { code: 302, name: 'Found', desc: '资源临时位于新 URL（保持原方法不一定）。', rfc: 'RFC 7231' },
  { code: 303, name: 'See Other', desc: '请用 GET 访问 Location 给出的另一 URL。', rfc: 'RFC 7231' },
  { code: 304, name: 'Not Modified', desc: '资源未修改，使用缓存即可（条件 GET）。', rfc: 'RFC 7232' },
  { code: 307, name: 'Temporary Redirect', desc: '临时重定向，必须使用与原始请求相同的方法。', rfc: 'RFC 7231' },
  { code: 308, name: 'Permanent Redirect', desc: '永久重定向，必须使用与原始请求相同的方法。', rfc: 'RFC 7538' },

  // 4xx Client Error
  { code: 400, name: 'Bad Request', desc: '请求格式错误，服务器无法理解。', rfc: 'RFC 7231' },
  { code: 401, name: 'Unauthorized', desc: '需要身份认证（缺少或无效凭证）。', rfc: 'RFC 7235' },
  { code: 402, name: 'Payment Required', desc: '保留，未来用于付费 API。', rfc: 'RFC 7231' },
  { code: 403, name: 'Forbidden', desc: '服务器理解请求但拒绝授权（无权限）。', rfc: 'RFC 7231' },
  { code: 404, name: 'Not Found', desc: '资源不存在或无权告知存在。', rfc: 'RFC 7231' },
  { code: 405, name: 'Method Not Allowed', desc: '资源不支持该请求方法。', rfc: 'RFC 7231' },
  { code: 406, name: 'Not Acceptable', desc: '服务器无法生成客户端 Accept 允许的内容。', rfc: 'RFC 7231' },
  { code: 407, name: 'Proxy Authentication Required', desc: '需要先通过代理认证。', rfc: 'RFC 7235' },
  { code: 408, name: 'Request Timeout', desc: '服务器等待客户端请求超时。', rfc: 'RFC 7231' },
  { code: 409, name: 'Conflict', desc: '请求与服务器当前状态冲突（并发更新）。', rfc: 'RFC 7231' },
  { code: 410, name: 'Gone', desc: '资源已永久删除且不会再回来。', rfc: 'RFC 7231' },
  { code: 411, name: 'Length Required', desc: '请求缺少 Content-Length 头。', rfc: 'RFC 7231' },
  { code: 412, name: 'Precondition Failed', desc: '请求头中的前置条件不满足。', rfc: 'RFC 7232' },
  { code: 413, name: 'Payload Too Large', desc: '请求体超过服务器允许大小。', rfc: 'RFC 7231' },
  { code: 414, name: 'URI Too Long', desc: '请求 URI 超过服务器允许长度。', rfc: 'RFC 7231' },
  { code: 415, name: 'Unsupported Media Type', desc: '请求体格式不被服务器支持。', rfc: 'RFC 7231' },
  { code: 416, name: 'Range Not Satisfiable', desc: 'Range 头指定的范围无法满足。', rfc: 'RFC 7233' },
  { code: 417, name: 'Expectation Failed', desc: '无法满足 Expect 请求头。', rfc: 'RFC 7231' },
  { code: 418, name: "I'm a teapot", desc: '愚人节彩蛋：我是一个茶壶，无法煮咖啡。', rfc: 'RFC 2324' },
  { code: 421, name: 'Misdirected Request', desc: '请求被路由到无法响应的服务器。', rfc: 'RFC 7540' },
  { code: 422, name: 'Unprocessable Entity', desc: '语义错误，无法处理（常用于表单校验失败）。', rfc: 'RFC 4918' },
  { code: 423, name: 'Locked', desc: '资源被锁定（WebDAV）。', rfc: 'RFC 4918' },
  { code: 424, name: 'Failed Dependency', desc: '由于前一请求失败，本请求失败（WebDAV）。', rfc: 'RFC 4918' },
  { code: 425, name: 'Too Early', desc: '服务器不愿处理可能被重放的请求。', rfc: 'RFC 8470' },
  { code: 426, name: 'Upgrade Required', desc: '客户端应升级到不同协议。', rfc: 'RFC 7231' },
  { code: 428, name: 'Precondition Required', desc: '要求请求带前置条件（避免丢失更新）。', rfc: 'RFC 6585' },
  { code: 429, name: 'Too Many Requests', desc: '触发限流，请稍后重试。', rfc: 'RFC 6585' },
  { code: 431, name: 'Request Header Fields Too Large', desc: '请求头过大。', rfc: 'RFC 6585' },
  { code: 451, name: 'Unavailable For Legal Reasons', desc: '因法律原因无法提供（致敬《华氏 451 度》）。', rfc: 'RFC 7725' },

  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', desc: '服务器内部错误，未捕获异常。', rfc: 'RFC 7231' },
  { code: 501, name: 'Not Implemented', desc: '服务器不支持当前请求方法。', rfc: 'RFC 7231' },
  { code: 502, name: 'Bad Gateway', desc: '作为网关或代理，从上游收到无效响应。', rfc: 'RFC 7231' },
  { code: 503, name: 'Service Unavailable', desc: '服务暂时不可用（过载或维护）。', rfc: 'RFC 7231' },
  { code: 504, name: 'Gateway Timeout', desc: '作为网关或代理，等待上游响应超时。', rfc: 'RFC 7231' },
  { code: 505, name: 'HTTP Version Not Supported', desc: '不支持的 HTTP 协议版本。', rfc: 'RFC 7231' },
  { code: 506, name: 'Variant Also Negotiates', desc: '内容协商配置错误。', rfc: 'RFC 2295' },
  { code: 507, name: 'Insufficient Storage', desc: '存储空间不足（WebDAV）。', rfc: 'RFC 4918' },
  { code: 508, name: 'Loop Detected', desc: '处理请求时检测到无限循环（WebDAV）。', rfc: 'RFC 5842' },
  { code: 510, name: 'Not Extended', desc: '请求需要进一步扩展。', rfc: 'RFC 2774' },
  { code: 511, name: 'Network Authentication Required', desc: '需要先通过网络认证（如 Wi-Fi 登录页）。', rfc: 'RFC 6585' },
];

type Group = '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'all';
const filter = ref<Group>('all');
const keyword = ref('');

const groupColors: Record<Group, { tab: string; badge: string; ring: string }> = {
  all: { tab: 'bg-primary text-primary-foreground', badge: 'bg-secondary text-foreground', ring: 'border-border' },
  '1xx': { tab: 'bg-sky-500 text-white', badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', ring: 'border-sky-500/30' },
  '2xx': { tab: 'bg-emerald-500 text-white', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-500/30' },
  '3xx': { tab: 'bg-amber-500 text-white', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', ring: 'border-amber-500/30' },
  '4xx': { tab: 'bg-orange-500 text-white', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', ring: 'border-orange-500/30' },
  '5xx': { tab: 'bg-rose-500 text-white', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', ring: 'border-rose-500/30' },
};

function groupOf(code: number): Group {
  if (code < 200) return '1xx';
  if (code < 300) return '2xx';
  if (code < 400) return '3xx';
  if (code < 500) return '4xx';
  return '5xx';
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return STATUS.filter((s) => {
    if (filter.value !== 'all' && groupOf(s.code) !== filter.value) return false;
    if (!kw) return true;
    return (
      String(s.code).includes(kw) ||
      s.name.toLowerCase().includes(kw) ||
      s.desc.toLowerCase().includes(kw)
    );
  });
});

const tabs: Array<{ k: Group; l: string; n: number }> = [
  { k: 'all', l: '全部', n: STATUS.length },
  { k: '1xx', l: '1xx 信息', n: STATUS.filter((s) => groupOf(s.code) === '1xx').length },
  { k: '2xx', l: '2xx 成功', n: STATUS.filter((s) => groupOf(s.code) === '2xx').length },
  { k: '3xx', l: '3xx 重定向', n: STATUS.filter((s) => groupOf(s.code) === '3xx').length },
  { k: '4xx', l: '4xx 客户端错误', n: STATUS.filter((s) => groupOf(s.code) === '4xx').length },
  { k: '5xx', l: '5xx 服务端错误', n: STATUS.filter((s) => groupOf(s.code) === '5xx').length },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div class="relative">
        <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="keyword" placeholder="搜索状态码 / 名称 / 描述…" class="pl-9" />
      </div>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="t in tabs"
        :key="t.k"
        type="button"
        :class="['inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          filter === t.k ? groupColors[t.k].tab : 'border bg-card text-muted-foreground hover:text-foreground']"
        @click="filter = t.k"
      >
        <span>{{ t.l }}</span>
        <span :class="['rounded-full px-1.5 text-[10px]',
          filter === t.k ? 'bg-white/20' : 'bg-secondary']">{{ t.n }}</span>
      </button>
    </div>

    <div v-if="filtered.length === 0" class="rounded-md border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
      没有匹配的状态码
    </div>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <div
        v-for="s in filtered"
        :key="s.code"
        :class="['rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm', groupColors[groupOf(s.code)].ring]"
      >
        <div class="flex items-center gap-2">
          <span :class="['inline-flex h-7 min-w-[3rem] items-center justify-center rounded-md font-mono text-sm font-semibold', groupColors[groupOf(s.code)].badge]">
            {{ s.code }}
          </span>
          <span class="text-sm font-medium text-foreground">{{ s.name }}</span>
          <span v-if="s.rfc" class="ml-auto font-mono text-[10px] text-muted-foreground">{{ s.rfc }}</span>
        </div>
        <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground">{{ s.desc }}</p>
      </div>
    </div>
  </div>
</template>
