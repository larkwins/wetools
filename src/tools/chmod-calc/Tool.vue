<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Role = 'owner' | 'group' | 'other';
type Perm = 'r' | 'w' | 'x';

const perms = ref<Record<Role, Record<Perm, boolean>>>({
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  other: { r: true, w: false, x: true },
});

function val(role: Role): number {
  const p = perms.value[role];
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
}

const octal = computed(() => `${val('owner')}${val('group')}${val('other')}`);

const symbolic = computed(() => {
  const s = (r: Role) => `${perms.value[r].r ? 'r' : '-'}${perms.value[r].w ? 'w' : '-'}${perms.value[r].x ? 'x' : '-'}`;
  return `${s('owner')}${s('group')}${s('other')}`;
});

const lsLine = computed(() => `-${symbolic.value}`);
const chmodCmd = computed(() => `chmod ${octal.value} file`);

// 从数字反向解析
const inputOctal = ref('755');
watch(inputOctal, (v) => {
  if (!/^[0-7]{3}$/.test(v)) return;
  const roles: Role[] = ['owner', 'group', 'other'];
  for (let i = 0; i < 3; i++) {
    const n = parseInt(v[i], 8);
    perms.value[roles[i]] = { r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) };
  }
});

// 反向：勾选变化时同步 input
watch(octal, (v) => {
  inputOctal.value = v;
}, { immediate: true });

const presets: Array<{ v: string; label: string; desc: string }> = [
  { v: '755', label: '755', desc: '可执行文件 / 公共目录（rwxr-xr-x）' },
  { v: '644', label: '644', desc: '普通文件（rw-r--r--）' },
  { v: '600', label: '600', desc: '私密文件（rw-------）' },
  { v: '700', label: '700', desc: '私密目录（rwx------）' },
  { v: '777', label: '777', desc: '完全开放（不推荐）' },
  { v: '400', label: '400', desc: '只读（r--------）' },
];

const roles: Array<{ k: Role; l: string }> = [
  { k: 'owner', l: '所有者 (u)' },
  { k: 'group', l: '所属组 (g)' },
  { k: 'other', l: '其他人 (o)' },
];

const permLabels: Record<Perm, { l: string; n: number }> = {
  r: { l: '读 read', n: 4 },
  w: { l: '写 write', n: 2 },
  x: { l: '执行 execute', n: 1 },
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <div v-for="r in roles" :key="r.k" class="rounded-lg border bg-card p-3">
        <p class="mb-2 text-sm font-semibold text-foreground">{{ r.l }}</p>
        <div class="space-y-1.5">
          <label v-for="(p, key) in permLabels" :key="key" class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="perms[r.k][key as Perm]" type="checkbox" class="h-4 w-4 accent-[hsl(var(--primary))]" />
            <span class="flex-1">{{ p.l }}</span>
            <span class="font-mono text-xs text-muted-foreground/70">+{{ p.n }}</span>
          </label>
        </div>
        <p class="mt-2 text-center font-mono text-lg font-semibold text-primary">{{ val(r.k) }}</p>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
        <span class="text-xs text-muted-foreground">数字</span>
        <Input v-model="inputOctal" class="flex-1 font-mono text-lg !border-0 !bg-transparent" maxlength="3" />
        <CopyButton :text="octal" icon-only />
      </div>
      <div class="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
        <span class="text-xs text-muted-foreground">符号</span>
        <span class="flex-1 font-mono text-base text-foreground">{{ symbolic }}</span>
        <CopyButton :text="symbolic" icon-only />
      </div>
      <div class="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
        <span class="text-xs text-muted-foreground">ls -l</span>
        <span class="flex-1 font-mono text-base text-foreground">{{ lsLine }}</span>
        <CopyButton :text="lsLine" icon-only />
      </div>
    </div>

    <div class="flex items-center gap-2 rounded-md border bg-secondary/40 px-3 py-2">
      <code class="flex-1 font-mono text-sm">$ {{ chmodCmd }}</code>
      <CopyButton :text="chmodCmd" icon-only />
    </div>

    <div class="flex flex-col gap-2">
      <label class="tool-section-title">常用预设</label>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="p in presets" :key="p.v" type="button"
          class="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          @click="inputOctal = p.v"
        >
          <span class="font-mono font-semibold text-foreground">{{ p.label }}</span>
          <span class="text-muted-foreground">— {{ p.desc }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
