<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const cidr = ref('192.168.1.0/24');

interface SubnetInfo {
  ip: string;
  ipInt: number;
  prefix: number;
  maskInt: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hostCount: number;
  totalCount: number;
  binary: string;
  maskBinary: string;
  ipClass: string;
  isPrivate: boolean;
  cidrNotation: string;
}

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error('IP 格式无效');
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
function intToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
}
function intToBinary(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('.');
}
function ipClass(ip: number): string {
  const first = (ip >>> 24) & 0xff;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D (组播)';
  return 'E (保留)';
}
function isPrivate(ip: number): boolean {
  const first = (ip >>> 24) & 0xff;
  const second = (ip >>> 16) & 0xff;
  // 10.0.0.0/8
  if (first === 10) return true;
  // 172.16.0.0/12
  if (first === 172 && second >= 16 && second <= 31) return true;
  // 192.168.0.0/16
  if (first === 192 && second === 168) return true;
  // 127.0.0.0/8 loopback
  if (first === 127) return true;
  return false;
}

const info = computed<SubnetInfo | null>(() => {
  try {
    const m = cidr.value.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!m) throw new Error('请输入 CIDR 格式，如 192.168.1.0/24');
    const ip = m[1];
    const prefix = Number(m[2]);
    if (prefix < 0 || prefix > 32) throw new Error('前缀必须在 0-32 之间');
    const ipInt = ipToInt(ip);
    const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = ipInt & maskInt;
    const broadcast = (network | (~maskInt >>> 0)) >>> 0;
    const totalCount = 2 ** (32 - prefix);
    const hostCount = prefix >= 31 ? totalCount : Math.max(0, totalCount - 2);
    return {
      ip,
      ipInt,
      prefix,
      maskInt,
      mask: intToIp(maskInt),
      wildcard: intToIp(~maskInt >>> 0),
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      firstHost: prefix >= 31 ? intToIp(network) : intToIp(network + 1),
      lastHost: prefix >= 31 ? intToIp(broadcast) : intToIp(broadcast - 1),
      hostCount,
      totalCount,
      binary: intToBinary(ipInt),
      maskBinary: intToBinary(maskInt),
      ipClass: ipClass(ipInt),
      isPrivate: isPrivate(ipInt),
      cidrNotation: `${intToIp(network)}/${prefix}`,
    };
  } catch {
    return null;
  }
});

const error = computed(() => {
  if (!cidr.value.trim()) return '';
  return info.value ? '' : '无效 CIDR：请输入 IP/前缀 格式，如 192.168.1.0/24';
});

const presets = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '10.10.10.0/26', '0.0.0.0/0'];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="tool-section-title">CIDR</label>
      <Input v-model="cidr" placeholder="192.168.1.0/24" class="font-mono text-base" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button v-for="p in presets" :key="p" type="button"
        class="rounded-md border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
        @click="cidr = p"
      >{{ p }}</button>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <div v-if="info" class="grid gap-2 sm:grid-cols-2">
      <div v-for="row in [
        { l: '网络地址', v: info.network },
        { l: '广播地址', v: info.broadcast },
        { l: '子网掩码', v: info.mask },
        { l: '通配符掩码', v: info.wildcard },
        { l: '可用主机起', v: info.firstHost },
        { l: '可用主机止', v: info.lastHost },
        { l: '前缀长度', v: '/' + info.prefix },
        { l: '总地址数', v: info.totalCount.toLocaleString() },
        { l: '可用主机数', v: info.hostCount.toLocaleString() },
        { l: 'IP 类别', v: info.ipClass + (info.isPrivate ? '（私有）' : '（公网）') },
      ]" :key="row.l" class="flex items-center gap-3 rounded-lg border bg-card p-3">
        <span class="w-24 text-xs text-muted-foreground">{{ row.l }}</span>
        <code class="flex-1 font-mono text-sm text-foreground">{{ row.v }}</code>
        <CopyButton :text="String(row.v)" icon-only />
      </div>
    </div>

    <div v-if="info" class="flex flex-col gap-2">
      <label class="tool-section-title">二进制</label>
      <div class="grid grid-cols-1 gap-1 rounded-lg border bg-card p-3 font-mono text-xs">
        <div class="flex items-center gap-3"><span class="w-16 text-muted-foreground">IP</span><span class="flex-1">{{ info.binary }}</span></div>
        <div class="flex items-center gap-3"><span class="w-16 text-muted-foreground">Mask</span><span class="flex-1">{{ info.maskBinary }}</span></div>
      </div>
    </div>
  </div>
</template>
