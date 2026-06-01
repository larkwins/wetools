<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';

// 0-31 控制字符的简短助记符 + 含义
const CTRL: Record<number, { abbr: string; desc: string }> = {
  0: { abbr: 'NUL', desc: 'Null（空字符）' },
  1: { abbr: 'SOH', desc: 'Start of Heading' },
  2: { abbr: 'STX', desc: 'Start of Text' },
  3: { abbr: 'ETX', desc: 'End of Text（Ctrl+C 中断）' },
  4: { abbr: 'EOT', desc: 'End of Transmission' },
  5: { abbr: 'ENQ', desc: 'Enquiry' },
  6: { abbr: 'ACK', desc: 'Acknowledge' },
  7: { abbr: 'BEL', desc: 'Bell（响铃 \\a）' },
  8: { abbr: 'BS', desc: 'Backspace（退格 \\b）' },
  9: { abbr: 'HT', desc: 'Horizontal Tab（制表符 \\t）' },
  10: { abbr: 'LF', desc: 'Line Feed（换行 \\n）' },
  11: { abbr: 'VT', desc: 'Vertical Tab（\\v）' },
  12: { abbr: 'FF', desc: 'Form Feed（换页 \\f）' },
  13: { abbr: 'CR', desc: 'Carriage Return（回车 \\r）' },
  14: { abbr: 'SO', desc: 'Shift Out' },
  15: { abbr: 'SI', desc: 'Shift In' },
  16: { abbr: 'DLE', desc: 'Data Link Escape' },
  17: { abbr: 'DC1', desc: 'Device Control 1（XON）' },
  18: { abbr: 'DC2', desc: 'Device Control 2' },
  19: { abbr: 'DC3', desc: 'Device Control 3（XOFF）' },
  20: { abbr: 'DC4', desc: 'Device Control 4' },
  21: { abbr: 'NAK', desc: 'Negative Acknowledge' },
  22: { abbr: 'SYN', desc: 'Synchronous Idle' },
  23: { abbr: 'ETB', desc: 'End of Trans. Block' },
  24: { abbr: 'CAN', desc: 'Cancel' },
  25: { abbr: 'EM', desc: 'End of Medium' },
  26: { abbr: 'SUB', desc: 'Substitute（Ctrl+Z）' },
  27: { abbr: 'ESC', desc: 'Escape' },
  28: { abbr: 'FS', desc: 'File Separator' },
  29: { abbr: 'GS', desc: 'Group Separator' },
  30: { abbr: 'RS', desc: 'Record Separator' },
  31: { abbr: 'US', desc: 'Unit Separator' },
  127: { abbr: 'DEL', desc: 'Delete' },
};

interface Row {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  desc: string;
  isCtrl: boolean;
}

const rows: Row[] = Array.from({ length: 128 }, (_, dec) => {
  const ctrl = CTRL[dec];
  let char: string;
  let desc: string;
  if (ctrl) {
    char = ctrl.abbr;
    desc = ctrl.desc;
  } else if (dec === 32) {
    char = '(SP)';
    desc = 'Space（空格）';
  } else {
    char = String.fromCharCode(dec);
    desc = '可打印字符';
  }
  return {
    dec,
    hex: dec.toString(16).toUpperCase().padStart(2, '0'),
    oct: dec.toString(8).padStart(3, '0'),
    bin: dec.toString(2).padStart(7, '0'),
    char,
    desc,
    isCtrl: !!ctrl || dec === 32,
  };
});

const keyword = ref('');
const groupFilter = ref<'all' | 'ctrl' | 'print' | 'digit' | 'upper' | 'lower' | 'symbol'>('all');

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return rows.filter((r) => {
    // group
    if (groupFilter.value === 'ctrl' && !r.isCtrl) return false;
    if (groupFilter.value === 'print' && r.isCtrl) return false;
    if (groupFilter.value === 'digit' && !(r.dec >= 48 && r.dec <= 57)) return false;
    if (groupFilter.value === 'upper' && !(r.dec >= 65 && r.dec <= 90)) return false;
    if (groupFilter.value === 'lower' && !(r.dec >= 97 && r.dec <= 122)) return false;
    if (groupFilter.value === 'symbol') {
      const isSym = (r.dec >= 33 && r.dec <= 47) || (r.dec >= 58 && r.dec <= 64) || (r.dec >= 91 && r.dec <= 96) || (r.dec >= 123 && r.dec <= 126);
      if (!isSym) return false;
    }
    if (!kw) return true;
    return (
      String(r.dec).includes(kw) ||
      r.hex.toLowerCase().includes(kw) ||
      r.char.toLowerCase().includes(kw) ||
      r.desc.toLowerCase().includes(kw)
    );
  });
});

const groups: Array<{ k: typeof groupFilter.value; l: string }> = [
  { k: 'all', l: '全部' },
  { k: 'ctrl', l: '控制字符' },
  { k: 'print', l: '可打印' },
  { k: 'digit', l: '数字 0-9' },
  { k: 'upper', l: '大写 A-Z' },
  { k: 'lower', l: '小写 a-z' },
  { k: 'symbol', l: '符号' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" placeholder="搜索：10、0A、LF、A、Tab…" class="pl-9" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="g in groups"
        :key="g.k"
        type="button"
        :class="['rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          groupFilter === g.k ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground']"
        @click="groupFilter = g.k"
      >{{ g.l }}</button>
    </div>

    <div class="overflow-x-auto rounded-lg border bg-card">
      <table class="w-full text-sm">
        <thead class="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th class="px-3 py-2 text-left">Dec</th>
            <th class="px-3 py-2 text-left">Hex</th>
            <th class="px-3 py-2 text-left">Oct</th>
            <th class="px-3 py-2 text-left">Bin</th>
            <th class="px-3 py-2 text-left">Char</th>
            <th class="px-3 py-2 text-left">描述</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in filtered"
            :key="r.dec"
            class="border-t border-border/60 hover:bg-secondary/30"
          >
            <td class="px-3 py-1.5 font-mono">{{ r.dec }}</td>
            <td class="px-3 py-1.5 font-mono text-blue-600 dark:text-blue-400">0x{{ r.hex }}</td>
            <td class="px-3 py-1.5 font-mono text-muted-foreground">{{ r.oct }}</td>
            <td class="px-3 py-1.5 font-mono text-muted-foreground">{{ r.bin }}</td>
            <td class="px-3 py-1.5 font-mono font-semibold" :class="r.isCtrl ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'">{{ r.char }}</td>
            <td class="px-3 py-1.5 text-xs text-muted-foreground">{{ r.desc }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="px-3 py-8 text-center text-sm text-muted-foreground">
        没有匹配的字符
      </div>
    </div>
  </div>
</template>
