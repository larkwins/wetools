<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

/**
 * 字段定义。每个字段：
 *   key: 内部字段标识（用于生成对应假数据）
 *   enabled: 是否输出
 *   alias: 自定义输出 key（空则使用 key 原始值）
 */
type FieldKey = 'id' | 'name' | 'email' | 'phone' | 'age' | 'job' | 'company' | 'bio' | 'address' | 'country' | 'province' | 'city';
interface FieldDef {
  key: FieldKey;
  enabled: boolean;
  alias: string;
}

const fields = reactive<FieldDef[]>([
  { key: 'id',       enabled: true,  alias: '' },
  { key: 'name',     enabled: true,  alias: '' },
  { key: 'email',    enabled: true,  alias: '' },
  { key: 'phone',    enabled: true,  alias: '' },
  { key: 'age',      enabled: true,  alias: '' },
  { key: 'address',  enabled: true,  alias: '' },
  { key: 'country',  enabled: false, alias: '' },
  { key: 'province', enabled: false, alias: '' },
  { key: 'city',     enabled: false, alias: '' },
  { key: 'job',      enabled: false, alias: '' },
  { key: 'company',  enabled: false, alias: '' },
  { key: 'bio',      enabled: false, alias: '' },
]);

const count = ref(10);
const capitalize = ref(false);

function toPascal(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

watch(capitalize, (val) => {
  for (const f of fields) {
    if (val) {
      if (!f.alias) f.alias = toPascal(f.key);
    } else {
      if (f.alias === toPascal(f.key)) f.alias = '';
    }
  }
});

const FIRSTS = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴'];
const SECONDS = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
const EN_FIRSTS = ['Alice', 'Bob', 'Cathy', 'Daniel', 'Eve', 'Frank', 'Grace', 'Henry'];
const EN_LASTS = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Taylor'];
const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'wetools.cc'];
const COUNTRIES = ['中国'];
const PROVINCES = ['北京市', '上海市', '广东省', '浙江省', '四川省', '湖北省', '江苏省'];
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
    case 'id':       return i + 1;
    case 'name':     return ctx.name;
    case 'email':    return `${ctx.localPart}@${pick(DOMAINS)}`;
    case 'phone':    return `1${pick([3, 5, 7, 8, 9])}${String(num(1, 9))}${String(num(10000000, 99999999))}`;
    case 'age':      return num(18, 60);
    case 'job':      return pick(JOBS);
    case 'company':  return pick(COMPANIES);
    case 'bio':      return pick(BIOS);
    case 'address':  return `${pick(STREETS)}${num(1, 999)}号`;
    case 'country':  return pick(COUNTRIES);
    case 'province': return pick(PROVINCES);
    case 'city':     return pick(CITIES);
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
    let outKey = f.alias.trim() || f.key;
    if (capitalize.value) outKey = toPascal(outKey);
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
    <div class="grid items-stretch gap-4 lg:grid-cols-[1fr_2fr]">
      <!-- 左侧：配置（高度由内容决定，不被 grid 拉伸） -->
      <section class="flex flex-col gap-3 self-start rounded-lg border bg-card p-4">
        <!-- 数量 -->
        <div class="flex flex-col gap-1.5">
          <label class="tool-section-title">数量</label>
          <Input v-model="count" type="number" />
        </div>

        <!-- 字段配置：表头 + 字段行同处一个 grid，保证列严格对齐 -->
        <div class="grid grid-cols-[auto_1fr_2fr] items-center gap-x-3 gap-y-2">
          <!-- 表头 -->
          <span class="tool-section-title"></span>
          <span class="tool-section-title">字段</span>
          <div class="flex items-center justify-between gap-2">
            <span class="tool-section-title">输出</span>
            <label class="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-normal normal-case tracking-normal text-muted-foreground">
              <input v-model="capitalize" type="checkbox" class="size-3.5 accent-[hsl(var(--primary))]" />
              首字母大写
            </label>
          </div>

          <!-- 字段行（用 template v-for 让子元素直接成为父 grid 子项，从而共享列宽） -->
          <template v-for="f in fields" :key="f.key">
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
              :placeholder="capitalize ? toPascal(f.key) : f.key"
              :disabled="!f.enabled"
              class="h-8 font-mono text-sm"
            />
          </template>
        </div>

        <Button variant="primary" class="mt-1 w-full" @click="generate">
          <RefreshCw :size="14" />生成
        </Button>
      </section>

      <!-- 右侧：结果（绝对定位铺满 grid 行，行高由左侧决定） -->
      <section class="relative">
        <div class="absolute inset-0 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground">{{ items.length }} 条记录</span>
            <CopyButton :text="text" />
          </div>
          <div class="flex-1 min-h-0 overflow-hidden rounded-md border">
            <CodeEditor :model-value="text" lang="json" readonly :rows="1" class="h-full" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
