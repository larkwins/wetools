<script setup lang="ts">
import { ref } from 'vue';
import { Lock, Unlock, AlertCircle } from 'lucide-vue-next';
// crypto-js 提供 DES / 3DES（WebCrypto 不支持）。仅按需 import 子模块以减小体积。
import CryptoJS from 'crypto-js';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Algo = 'DES' | '3DES';
type Mode = 'CBC' | 'ECB';
type OutFormat = 'base64' | 'hex';

const algo = ref<Algo>('DES');
const mode = ref<Mode>('CBC');
const outFormat = ref<OutFormat>('base64');
const key = ref('12345678');
const iv = ref('12345678');
const input = ref('Hello, WeTools — DES test message');
const output = ref('');
const error = ref('');
const busy = ref(false);

function getCipher() {
  return algo.value === 'DES' ? CryptoJS.DES : CryptoJS.TripleDES;
}
function getModeObj() {
  return mode.value === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB;
}

function encrypt() {
  busy.value = true;
  error.value = '';
  try {
    const cipher = getCipher();
    const cfg: CryptoJS.lib.CipherOption = {
      mode: getModeObj(),
      padding: CryptoJS.pad.Pkcs7,
    };
    if (mode.value === 'CBC') {
      cfg.iv = CryptoJS.enc.Utf8.parse(iv.value);
    }
    const enc = cipher.encrypt(
      CryptoJS.enc.Utf8.parse(input.value),
      CryptoJS.enc.Utf8.parse(key.value),
      cfg
    );
    output.value = outFormat.value === 'base64'
      ? enc.toString()
      : enc.ciphertext.toString(CryptoJS.enc.Hex);
  } catch (e) {
    error.value = '加密失败：' + ((e as Error).message || String(e));
  } finally {
    busy.value = false;
  }
}

function decrypt() {
  busy.value = true;
  error.value = '';
  try {
    const cipher = getCipher();
    const cfg: CryptoJS.lib.CipherOption = {
      mode: getModeObj(),
      padding: CryptoJS.pad.Pkcs7,
    };
    if (mode.value === 'CBC') {
      cfg.iv = CryptoJS.enc.Utf8.parse(iv.value);
    }
    // 把输入按选定格式转回 CipherParams
    let cipherParams: CryptoJS.lib.CipherParams;
    if (outFormat.value === 'base64') {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(input.value.trim()),
      });
    } else {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(input.value.trim()),
      });
    }
    const dec = cipher.decrypt(cipherParams, CryptoJS.enc.Utf8.parse(key.value), cfg);
    const plain = dec.toString(CryptoJS.enc.Utf8);
    if (!plain) throw new Error('密钥或密文错误');
    output.value = plain;
  } catch (e) {
    error.value = '解密失败：' + ((e as Error).message || String(e));
  } finally {
    busy.value = false;
  }
}

function swap() {
  input.value = output.value || input.value;
  output.value = '';
}

const algos: Algo[] = ['DES', '3DES'];
const modes: Mode[] = ['CBC', 'ECB'];
const fmts: OutFormat[] = ['base64', 'hex'];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[auto_auto_auto]">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="a in algos" :key="a" type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium', algo === a ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="algo = a"
        >{{ a }}</button>
      </div>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in modes" :key="m" type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium', mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m"
        >{{ m }}</button>
      </div>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="f in fmts" :key="f" type="button"
          :class="['h-9 rounded-sm px-3 text-xs font-medium uppercase', outFormat === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="outFormat = f"
        >{{ f }}</button>
      </div>
    </div>

    <div class="grid gap-3" :class="mode === 'CBC' ? 'sm:grid-cols-2' : ''">
      <div class="flex flex-col gap-2">
          <label class="tool-section-title">
            密钥（DES 需 8 字节，3DES 需 16 或 24 字节）
          </label>
        <Input v-model="key" placeholder="UTF-8 字节" />
      </div>
      <div v-if="mode === 'CBC'" class="flex flex-col gap-2">
          <label class="tool-section-title">
            IV（CBC 模式必填，8 字节）
          </label>
        <Input v-model="iv" placeholder="UTF-8 字节" />
      </div>
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

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="12" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" mono :rows="12" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      DES / 3DES 已被 NIST 标记为遗留算法（不再推荐用于新系统）。本工具仅用于兼容老接口调试，强加密请使用 AES。
    </p>
  </div>
</template>
