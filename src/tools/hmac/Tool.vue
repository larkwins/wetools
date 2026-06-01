<script setup lang="ts">
import { ref, watch } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type OutFormat = 'hex' | 'base64';

const algo = ref<Algo>('SHA-256');
const outFormat = ref<OutFormat>('hex');
const key = ref('my-secret-key');
const message = ref('Hello, WeTools');
const result = ref('');
const error = ref('');

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function buf2b64(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}

async function compute() {
  error.value = '';
  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(key.value),
      { name: 'HMAC', hash: algo.value },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message.value));
    result.value = outFormat.value === 'hex' ? buf2hex(sig) : buf2b64(sig);
  } catch (e) {
    error.value = (e as Error).message || String(e);
    result.value = '';
  }
}

watch([algo, outFormat, key, message], compute, { immediate: true });

const algos: Algo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr]">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="a in algos"
          :key="a"
          type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium', algo === a ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="algo = a"
        >HMAC-{{ a.replace('-', '') }}</button>
      </div>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="f in (['hex', 'base64'] as OutFormat[])"
          :key="f"
          type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium uppercase', outFormat === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="outFormat = f"
        >{{ f }}</button>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">密钥</label>
      <Input v-model="key" placeholder="输入 HMAC 密钥…" />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">消息</label>
      <Textarea v-model="message" mono :rows="6" placeholder="输入要签名的消息…" />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">HMAC 输出</label>
        <CopyButton :text="result" icon-only />
      </div>
      <div class="rounded-md border bg-card px-3 py-2 font-mono text-xs break-all min-h-[2.5rem]">{{ result || '—' }}</div>
      <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ error }}
      </p>
    </div>

    <p class="text-xs text-muted-foreground">
      使用 Web Crypto API 计算，密钥与消息均按 UTF-8 编码，全部在浏览器本地完成。
    </p>
  </div>
</template>
