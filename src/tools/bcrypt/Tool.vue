<script setup lang="ts">
import { ref } from 'vue';
import { Lock, ShieldCheck, ShieldX, AlertCircle } from 'lucide-vue-next';
import bcrypt from 'bcryptjs';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

// 生成
const genPassword = ref('hunter2');
const rounds = ref(10);
const genHash = ref('');
const genBusy = ref(false);
const genError = ref('');
const genProgress = ref(0); // 0-100

// 校验
const verifyPassword = ref('hunter2');
const verifyHash = ref('');
const verifyResult = ref<null | boolean>(null);
const verifyBusy = ref(false);
const verifyError = ref('');

function generate() {
  genBusy.value = true;
  genError.value = '';
  genProgress.value = 0;
  const r = Math.max(4, Math.min(15, Number(rounds.value) || 10));
  // bcryptjs 的 hash(pw, rounds, cb, progressCb) 同时提供完成回调与进度回调（0-1）
  try {
    bcrypt.hash(
      genPassword.value,
      r,
      (err, hash) => {
        genBusy.value = false;
        if (err) {
          genError.value = (err as Error).message || String(err);
          return;
        }
        genHash.value = hash ?? '';
        genProgress.value = 100;
      },
      (p: number) => {
        genProgress.value = Math.round(p * 100);
      },
    );
  } catch (e) {
    genBusy.value = false;
    genError.value = (e as Error).message || String(e);
  }
}

async function verify() {
  verifyBusy.value = true;
  verifyError.value = '';
  verifyResult.value = null;
  try {
    verifyResult.value = await bcrypt.compare(verifyPassword.value, verifyHash.value.trim());
  } catch (e) {
    verifyError.value = (e as Error).message || String(e);
  } finally {
    verifyBusy.value = false;
  }
}

function useGenHash() {
  verifyHash.value = genHash.value;
  verifyPassword.value = genPassword.value;
  verifyResult.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <section class="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h3 class="text-sm font-semibold text-foreground">生成哈希</h3>
      <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">明文密码</label>
          <Input v-model="genPassword" placeholder="要哈希的密码" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">轮数 (4-15)</label>
          <Input v-model.number="rounds" type="number" min="4" max="15" class="!w-24" />
        </div>
        <div class="flex items-end">
          <Button variant="primary" :disabled="genBusy" @click="generate">
            <Lock :size="14" />{{ genBusy ? `计算中… ${genProgress}%` : '生成 hash' }}
          </Button>
        </div>
      </div>
      <div v-if="genBusy" class="h-1 overflow-hidden rounded-full bg-secondary">
        <div class="h-full bg-primary transition-[width] duration-100" :style="{ width: genProgress + '%' }"></div>
      </div>
      <div v-if="genHash" class="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
        <code class="flex-1 break-all font-mono text-xs">{{ genHash }}</code>
        <CopyButton :text="genHash" icon-only />
      </div>
      <button v-if="genHash" type="button" class="self-start text-xs text-primary hover:underline" @click="useGenHash">
        → 用这个 hash 去校验区测试
      </button>
      <p v-if="genError" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ genError }}
      </p>
    </section>

    <section class="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h3 class="text-sm font-semibold text-foreground">校验密码</h3>
      <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">明文密码</label>
          <Input v-model="verifyPassword" />
        </div>
        <div class="flex items-end">
          <Button variant="outline" :disabled="verifyBusy" @click="verify">
            {{ verifyBusy ? '校验中…' : '校验' }}
          </Button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bcrypt Hash</label>
        <Input v-model="verifyHash" placeholder="$2b$10$..." class="font-mono text-xs" />
      </div>
      <div v-if="verifyResult !== null" :class="['flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
        verifyResult ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-destructive/40 bg-destructive/10 text-destructive']">
        <ShieldCheck v-if="verifyResult" :size="16" />
        <ShieldX v-else :size="16" />
        {{ verifyResult ? '匹配：密码正确' : '不匹配：密码错误或 hash 无效' }}
      </div>
      <p v-if="verifyError" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />{{ verifyError }}
      </p>
    </section>

    <p class="text-xs text-muted-foreground">
      Bcrypt 用于密码哈希。轮数越高越安全也越慢（10 ≈ 100ms，12 ≈ 400ms）。生产建议 10-12 轮。
    </p>
  </div>
</template>
