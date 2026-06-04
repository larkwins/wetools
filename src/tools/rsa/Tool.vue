<script setup lang="ts">
import { ref } from 'vue';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type KeySize = 2048 | 3072 | 4096;
type Hash = 'SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512';

const keySize = ref<KeySize>(2048);
const hash = ref<Hash>('SHA-256');
const publicPem = ref('');
const privatePem = ref('');
const plaintext = ref('Hello, WeTools — RSA test message');
const ciphertext = ref('');
const decrypted = ref('');
const busy = ref(false);
const error = ref('');

function abToB64(ab: ArrayBuffer): string {
  const u8 = new Uint8Array(ab);
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}
function b64ToAb(b64: string): ArrayBuffer {
  const cleaned = b64.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(cleaned);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}
function wrapPem(label: string, b64: string): string {
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

async function generate() {
  busy.value = true;
  error.value = '';
  try {
    const kp = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: keySize.value, publicExponent: new Uint8Array([1, 0, 1]), hash: hash.value },
      true,
      ['encrypt', 'decrypt']
    );
    const spki = await crypto.subtle.exportKey('spki', kp.publicKey);
    const pkcs8 = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
    publicPem.value = wrapPem('PUBLIC KEY', abToB64(spki));
    privatePem.value = wrapPem('PRIVATE KEY', abToB64(pkcs8));
  } catch (e) {
    error.value = '密钥生成失败：' + ((e as Error).message || String(e));
  } finally {
    busy.value = false;
  }
}

async function encrypt() {
  busy.value = true;
  error.value = '';
  try {
    const keyBuf = b64ToAb(publicPem.value);
    const pubKey = await crypto.subtle.importKey('spki', keyBuf, { name: 'RSA-OAEP', hash: hash.value }, false, ['encrypt']);
    const enc = new TextEncoder().encode(plaintext.value);
    const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, enc);
    ciphertext.value = abToB64(ct);
  } catch (e) {
    error.value = '加密失败：' + ((e as Error).message || String(e));
  } finally {
    busy.value = false;
  }
}

async function decrypt() {
  busy.value = true;
  error.value = '';
  try {
    const keyBuf = b64ToAb(privatePem.value);
    const privKey = await crypto.subtle.importKey('pkcs8', keyBuf, { name: 'RSA-OAEP', hash: hash.value }, false, ['decrypt']);
    const ctBuf = b64ToAb(ciphertext.value);
    const pt = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privKey, ctBuf);
    decrypted.value = new TextDecoder().decode(pt);
  } catch (e) {
    error.value = '解密失败：' + ((e as Error).message || String(e));
  } finally {
    busy.value = false;
  }
}

const sizes: KeySize[] = [2048, 3072, 4096];
const hashes: Hash[] = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'];
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- 密钥生成 -->
    <section class="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="inline-flex rounded-md border bg-background p-0.5">
          <button
            v-for="s in sizes"
            :key="s"
            type="button"
            :class="['h-8 rounded-sm px-3 text-xs font-medium', keySize === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="keySize = s"
          >{{ s }} 位</button>
        </div>
        <div class="inline-flex rounded-md border bg-background p-0.5">
          <button
            v-for="h in hashes"
            :key="h"
            type="button"
            :class="['h-8 rounded-sm px-3 text-xs font-medium', hash === h ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="hash = h"
          >{{ h }}</button>
        </div>
        <Button variant="primary" :disabled="busy" @click="generate">
          <KeyRound :size="14" />生成密钥对
        </Button>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="tool-section-title">公钥 (SPKI / PEM)</label>
            <CopyButton :text="publicPem" icon-only />
          </div>
          <Textarea v-model="publicPem" mono :rows="9" placeholder="-----BEGIN PUBLIC KEY-----…" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="tool-section-title">私钥 (PKCS8 / PEM)</label>
            <CopyButton :text="privatePem" icon-only />
          </div>
          <Textarea v-model="privatePem" mono :rows="9" placeholder="-----BEGIN PRIVATE KEY-----…" />
        </div>
      </div>
    </section>

    <!-- 加密 / 解密 -->
    <section class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="primary" :disabled="busy" @click="encrypt">
          <Lock :size="14" />使用公钥加密
        </Button>
        <Button variant="outline" :disabled="busy" @click="decrypt">
          <Unlock :size="14" />使用私钥解密
        </Button>
      </div>

      <div class="grid gap-3 lg:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label class="tool-section-title">明文</label>
          <Textarea v-model="plaintext" mono :rows="8" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="tool-section-title">密文 (Base64)</label>
            <CopyButton :text="ciphertext" icon-only />
          </div>
          <Textarea v-model="ciphertext" mono :rows="8" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="tool-section-title">解密结果</label>
            <CopyButton :text="decrypted" icon-only />
          </div>
          <Textarea :model-value="decrypted" mono :rows="8" readonly />
        </div>
      </div>
      <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ error }}
      </p>
    </section>

    <p class="text-xs text-muted-foreground">
      使用 Web Crypto API RSA-OAEP。注意：RSA 加密长度受密钥长度限制（2048 位约 200 字节明文），适合加密小数据或对称密钥。
    </p>
  </div>
</template>
