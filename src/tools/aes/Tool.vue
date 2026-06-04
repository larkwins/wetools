<script setup lang="ts">
import { ref } from 'vue';
import { Lock, Unlock, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'AES-GCM' | 'AES-CBC';

const mode = ref<Mode>('AES-GCM');
const password = ref('correct horse battery staple');
const input = ref('Hello, WeTools — AES test message');
const output = ref('');
const error = ref<string | null>(null);
const busy = ref(false);

function b64encode(buf: Uint8Array) {
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s);
}
function b64decode(b64: string) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function deriveKey(pw: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pw),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: mode.value, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt() {
  error.value = null;
  busy.value = true;
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(mode.value === 'AES-GCM' ? 12 : 16));
    const key = await deriveKey(password.value, salt);
    const ct = new Uint8Array(
      await crypto.subtle.encrypt({ name: mode.value, iv }, key, new TextEncoder().encode(input.value))
    );
    // 打包：[salt(16)][iv(12/16)][ct]
    const packed = new Uint8Array(salt.length + iv.length + ct.length);
    packed.set(salt, 0);
    packed.set(iv, salt.length);
    packed.set(ct, salt.length + iv.length);
    output.value = b64encode(packed);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}

async function decrypt() {
  error.value = null;
  busy.value = true;
  try {
    const packed = b64decode(input.value.trim());
    const ivLen = mode.value === 'AES-GCM' ? 12 : 16;
    const salt = packed.slice(0, 16);
    const iv = packed.slice(16, 16 + ivLen);
    const ct = packed.slice(16 + ivLen);
    const key = await deriveKey(password.value, salt);
    const pt = await crypto.subtle.decrypt({ name: mode.value, iv }, key, ct);
    output.value = new TextDecoder().decode(pt);
  } catch (e) {
    error.value = '解密失败：密钥或数据有误';
  } finally {
    busy.value = false;
  }
}

function swap() {
  input.value = output.value || input.value;
  output.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[auto_1fr]">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in [{v:'AES-GCM',l:'AES-GCM'},{v:'AES-CBC',l:'AES-CBC'}]" :key="m.v" type="button"
          :class="['h-9 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>
      <Input v-model="password" placeholder="口令（PBKDF2 派生 256 位密钥，10 万次迭代）" />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button variant="primary" :disabled="busy" @click="encrypt">
        <Lock :size="14" />加密
      </Button>
      <Button variant="outline" :disabled="busy" @click="decrypt">
        <Unlock :size="14" />解密
      </Button>
      <Button variant="ghost" @click="swap">交换输入/输出</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="14" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" mono :rows="14" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle :size="12" />{{ error }}</p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      格式：<code class="font-mono">Base64( salt[16] || iv[{{ mode === 'AES-GCM' ? 12 : 16 }}] || ciphertext )</code>。
      使用 PBKDF2-SHA256 派生 256 位密钥，10 万次迭代。
    </p>
  </div>
</template>
