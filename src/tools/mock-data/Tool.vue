<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

/**
 * 字段定义。每个字段：
 *   key: 内部字段标识（用于生成对应假数据）
 *   enabled: 是否输出
 *   alias: 自定义输出 key（空则使用 key 原始值）
 */
type FieldKey = 'id' | 'name' | 'email' | 'phone' | 'address' | 'age' | 'job' | 'company' | 'bio';
interface FieldDef {
  key: FieldKey;
  enabled: boolean;
  alias: string;
}

const fields = reactive<FieldDef[]>([
  { key: 'id',      enabled: true,  alias: '' },
  { key: 'name',    enabled: true,  alias: '' },
  { key: 'email',   enabled: true,  alias: '' },
  { key: 'phone',   enabled: true,  alias: '' },
  { key: 'address', enabled: true,  alias: '' },
  { key: 'age',     enabled: true,  alias: '' },
  { key: 'job',     enabled: false, alias: '' },
  { key: 'company', enabled: false, alias: '' },
  { key: 'bio',     enabled: false, alias: '' },
]);

const count = ref(10);

const FIRSTS = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴'];
const SECONDS = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
const EN_FIRSTS = ['Alice', 'Bob', 'Cathy', 'Daniel', 'Eve', 'Frank', 'Grace', 'Henry'];
const EN_LASTS = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Taylor'];
const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'wetools.cc'];
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'];
const STREETS = ['中山路', '人民路', '解放路', '建国路', '科华路', '高新大道'];
const JOBS = ['前端工程师', '后端工程师', '产品经理', '设计师', 'SRE', '架构师'];
const COMPANIES = ['Tencent', 'Alibaba', 'ByteDance', 'Meituan', 'Xiaomi'];
const BIOS = ['热爱开源', '终身学习者', '咖啡因驱动', '十年码龄', '业余跑者'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function num(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/** 根据 fieldKey 生成单条值 */
function genValue(key: FieldKey, i: number, ctx: { name: string; localPart: string }): unknown {
  switch (key) {
    case 'id':      return i + 1;
    case 'name':    return ctx.name;
    case 'email':   return `${ctx.localPart}@${pick(DOMAINS)}`;
    case 'phone':   return `1${pick([3, 5, 7, 8, 9])}${String(num(1, 9))}${String(num(10000000, 99999999))}`;
    case 'address': return `${pick(CITIES)}市${pick(STREETS)}${num(1, 999)}号`;
    case 'age':     return num(18, 60);
    case 'job':     return pick(JOBS);
    case 'company': return pick(COMPANIES);
    case 'bio':     return pick(BIOS);
  }
}

function gen(i: number): Record<string, unknown> {
  const isCn = Math.random() < 0.6;
  const name = isCn ? pick(FIRSTS) + pick(SECONDS) : `${pick(EN_FIRSTS)} ${pick(EN_LASTS)}`;
  const localPart = isCn ? `user${num(1000, 9999)}` : name.toLowerCase().replace(/\s+/g, '.');
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    if (!f.enabled) continue;
    // 输出 key 优先使用 alias（去空白），否则用原始 key
    const outKey = f.alias.trim() || f.key;
    obj[outKey] = genValue(f.key, i, { name, localPart });
  }
  return obj;
}

const items = ref<Record<string, unknown>[]>([]);

function generate() {
  const n = Math.max(1, Math.min(500, Number(count.value) || 1));
  items.value = Array.from({ length: n }, (_, i) => gen(i));
}

generate();

const text = computed(() => JSON.stringify(items.value, null, 2));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <!-- 左侧：配置 -->
      <section class="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <!-- 数量 -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">数量</label>
          <Input v-model="count" type="number" />
        </div>

        <!-- 字段配置：每行一个字段 = 勾选 + 字段名 + 输出 key 自定义 -->
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-[auto_1fr_2fr] items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span class="w-4"></span>
            <span>字段</span>
            <span>输出 key（留空使用原字段名）</span>
          </div>
          <div
            v-for="f in fields"
            :key="f.key"
            class="grid grid-cols-[auto_1fr_2fr] items-center gap-2"
          >
            <input
              v-model="f.enabled"
              type="checkbox"
              class="size-4 accent-[hsl(var(--primary))]"
              :aria-label="`启用字段 ${f.key}`"
            />
            <span class="font-mono text-sm" :class="f.enabled ? 'text-foreground' : 'text-muted-foreground/60'">
              {{ f.key }}
            </span>
            <Input
              v-model="f.alias"
              :placeholder="f.key"
              :disabled="!f.enabled"
              class="h-8 font-mono text-sm"
            />
          </div>
        </div>

        <Button variant="primary" class="mt-1 w-full" @click="generate">
          <RefreshCw :size="14" />生成
        </Button>
      </section>

      <!-- 右侧：结果 -->
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">{{ items.length }} 条记录</span>
          <CopyButton :text="text" />
        </div>
        <Textarea :model-value="text" mono :rows="22" readonly />
      </section>
    </div>
  </div>
</template>
