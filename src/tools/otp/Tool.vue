<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { RefreshCw, AlertCircle, Copy } from 'lucide-vue-next';
import * as OTPAuth from 'otpauth';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const secret = ref('JBSWY3DPEHPK3PXP'); // 示例 secret
const issuer = ref('WeTools');
const account = ref('demo@wetools.cc');
const digits = ref<6 | 8>(6);
const period = ref(30);
const algorithm = ref<'SHA1' | 'SHA256' | 'SHA512'>('SHA1');

const current = ref('');
const next = ref('');
const remaining = ref(30);
const error = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

function compute() {
  error.value = '';
  try {
    const totp = new OTPAuth.TOTP({
      issuer: issuer.value,
      label: account.value,
      algorithm: algorithm.value,
      digits: digits.value,
      period: period.value,
      secret: OTPAuth.Secret.fromBase32(secret.value.replace(/\s+/g, '').toUpperCase()),
    });
    current.value = totp.generate();
    next.value = totp.generate({ timestamp: Date.now() + period.value * 1000 });
    const now = Math.floor(Date.now() / 1000);
    remaining.value = period.value - (now % period.value);
  } catch (e) {
    current.value = '';
    next.value = '';
    error.value = '密钥无效（必须是 Base32）：' + ((e as Error).message || String(e));
  }
}

function start() {
  compute();
  if (timer) clearInterval(timer);
  timer = setInterval(compute, 1000);
}

onMounted(start);
onBeforeUnmount(() => { if (timer) clearInterval(timer); });

watch([secret, issuer, account, digits, period, algorithm], compute);

const otpAuthUri = computed(() => {
  if (!secret.value) return '';
  try {
    const totp = new OTPAuth.TOTP({
      issuer: issuer.value,
      label: account.value,
      algorithm: algorithm.value,
      digits: digits.value,
      period: period.value,
      secret: OTPAuth.Secret.fromBase32(secret.value.replace(/\s+/g, '').toUpperCase()),
    });
    return totp.toString();
  } catch {
    return '';
  }
});

function genSecret() {
  secret.value = new OTPAuth.Secret({ size: 20 }).base32;
}

const progress = computed(() => (remaining.value / period.value) * 100);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">Secret（Base32）</label>
        <Input v-model="secret" class="font-mono uppercase" />
      </div>
      <div class="flex items-end">
        <button type="button" class="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-3 text-xs text-muted-foreground hover:text-primary" @click="genSecret">
          <RefreshCw :size="12" />随机生成
        </button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">Issuer</label>
        <Input v-model="issuer" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">Account</label>
        <Input v-model="account" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">位数</label>
        <select v-model.number="digits" class="h-9 rounded-md border bg-background px-3 text-sm">
          <option :value="6">6 位</option>
          <option :value="8">8 位</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="tool-section-title">周期 (秒)</label>
        <select v-model.number="period" class="h-9 rounded-md border bg-background px-3 text-sm">
          <option :value="30">30</option>
          <option :value="60">60</option>
        </select>
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">当前验证码</p>
        <div class="mt-1 flex items-center gap-2">
          <code class="flex-1 font-mono text-3xl font-bold tracking-widest text-primary">{{ current || '— — — — — —' }}</code>
          <CopyButton :text="current" icon-only />
        </div>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div class="h-full bg-primary transition-all duration-1000 ease-linear" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="mt-1 text-right text-[10px] text-muted-foreground">{{ remaining }} 秒后刷新</p>
      </div>
      <div class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">下一个验证码</p>
        <div class="mt-1 flex items-center gap-2">
          <code class="flex-1 font-mono text-3xl font-bold tracking-widest text-muted-foreground">{{ next || '— — — — — —' }}</code>
        </div>
      </div>
    </div>

    <div v-if="otpAuthUri" class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="tool-section-title">otpauth:// URI（导入到 Authenticator）</label>
        <CopyButton :text="otpAuthUri" icon-only />
      </div>
      <pre class="overflow-auto rounded-md border bg-card p-3 font-mono text-xs"><code>{{ otpAuthUri }}</code></pre>
    </div>

    <p class="text-xs text-muted-foreground">
      基于 RFC 6238 (TOTP)。和 Google Authenticator / 1Password / Authy 等兼容。Secret 必须是 Base32 字符（A-Z, 2-7）。
    </p>
  </div>
</template>
