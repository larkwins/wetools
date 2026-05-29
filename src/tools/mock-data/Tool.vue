<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const count = ref(10);
const fields = ref({
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  age: true,
  job: false,
  company: false,
  bio: false,
});

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

function gen(i: number): Record<string, unknown> {
  const isCn = Math.random() < 0.6;
  const name = isCn ? pick(FIRSTS) + pick(SECONDS) : `${pick(EN_FIRSTS)} ${pick(EN_LASTS)}`;
  const localPart = isCn ? `user${num(1000, 9999)}` : name.toLowerCase().replace(/\s+/g, '.');
  const obj: Record<string, unknown> = {};
  if (fields.value.id) obj.id = i + 1;
  if (fields.value.name) obj.name = name;
  if (fields.value.email) obj.email = `${localPart}@${pick(DOMAINS)}`;
  if (fields.value.phone) obj.phone = `1${pick([3, 5, 7, 8, 9])}${String(num(1, 9))}${String(num(10000000, 99999999))}`;
  if (fields.value.address) obj.address = `${pick(CITIES)}市${pick(STREETS)}${num(1, 999)}号`;
  if (fields.value.age) obj.age = num(18, 60);
  if (fields.value.job) obj.job = pick(JOBS);
  if (fields.value.company) obj.company = pick(COMPANIES);
  if (fields.value.bio) obj.bio = pick(BIOS);
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
      <section class="space-y-3 rounded-lg border bg-card p-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">数量</label>
          <Input v-model="count" type="number" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[11px] uppercase tracking-wider text-muted-foreground">字段</label>
          <div class="grid grid-cols-2 gap-1.5 text-sm">
            <label v-for="(_, k) in fields" :key="k" class="inline-flex cursor-pointer items-center gap-1.5">
              <input v-model="fields[k as keyof typeof fields]" type="checkbox" class="accent-[hsl(var(--primary))]" />
              <span>{{ k }}</span>
            </label>
          </div>
        </div>
        <Button variant="primary" class="w-full" @click="generate"><RefreshCw :size="14" />生成</Button>
      </section>

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
