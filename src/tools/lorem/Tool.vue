<script setup lang="ts">
import { ref, computed } from 'vue';
import { RefreshCw } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const lang = ref<'lorem' | 'zh'>('lorem');
const unit = ref<'paragraph' | 'sentence' | 'word'>('paragraph');
const count = ref(3);
const startWithLorem = ref(true);
// 显式 seed：computed 依赖它，regen 通过 seed++ 触发重算，避免改 count 的 hacky 写法
const seed = ref(0);

const LOREM = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa officia deserunt mollit anim id est laborum'.split(/\s+/);

const ZH = '我们在这里讨论的是一种非常常见的占位文本它可以帮助设计师和开发者在没有真实内容的情况下评估排版与版式无须担心读者会陷入文字本身'.split('');

const seedRand = () => Math.random();

function pickWord() {
  return LOREM[Math.floor(seedRand() * LOREM.length)];
}
function pickZh() {
  return ZH[Math.floor(seedRand() * ZH.length)];
}

function sentenceLorem(first = false) {
  const len = 8 + Math.floor(seedRand() * 12);
  const arr: string[] = [];
  for (let i = 0; i < len; i++) arr.push(pickWord());
  let s = arr.join(' ');
  s = s.charAt(0).toUpperCase() + s.slice(1) + '.';
  if (first && startWithLorem.value) s = 'Lorem ipsum dolor sit amet, ' + s.charAt(0).toLowerCase() + s.slice(1);
  return s;
}
function paragraphLorem(first = false) {
  const sCount = 3 + Math.floor(seedRand() * 4);
  const arr: string[] = [];
  for (let i = 0; i < sCount; i++) arr.push(sentenceLorem(first && i === 0));
  return arr.join(' ');
}
function paragraphZh() {
  const len = 80 + Math.floor(seedRand() * 80);
  const arr: string[] = [];
  for (let i = 0; i < len; i++) arr.push(pickZh());
  let s = arr.join('');
  // 加点标点
  s = s.replace(/(.{12,18})/g, '$1，').replace(/，([^，]*)$/, '。$1');
  return s + '。';
}

const text = computed(() => {
  void seed.value; // 显式依赖：seed 变 → 重算
  const n = Math.max(1, Math.min(50, Number(count.value) || 1));
  const out: string[] = [];
  if (unit.value === 'word') {
    const len = n * 5;
    for (let i = 0; i < len; i++) out.push(lang.value === 'zh' ? pickZh() : pickWord());
    return lang.value === 'zh' ? out.join('') : out.join(' ');
  }
  if (unit.value === 'sentence') {
    for (let i = 0; i < n; i++) out.push(lang.value === 'zh' ? paragraphZh() : sentenceLorem(i === 0));
    return out.join(' ');
  }
  for (let i = 0; i < n; i++) out.push(lang.value === 'zh' ? paragraphZh() : paragraphLorem(i === 0));
  return out.join('\n\n');
});

function regen() {
  seed.value++;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="l in [{v:'lorem',l:'Lorem'},{v:'zh',l:'中文'}]" :key="l.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', lang === l.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="lang = l.v as 'lorem' | 'zh'"
        >{{ l.l }}</button>
      </div>
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="u in [{v:'paragraph',l:'段落'},{v:'sentence',l:'句子'},{v:'word',l:'单词'}]" :key="u.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', unit === u.v ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
          @click="unit = u.v as 'paragraph' | 'sentence' | 'word'"
        >{{ u.l }}</button>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] uppercase tracking-wider text-muted-foreground">数量</label>
        <Input v-model.number="count" type="number" class="w-24" />
      </div>
      <label v-if="lang === 'lorem' && unit !== 'word'" class="inline-flex cursor-pointer items-center gap-1.5 self-end pb-2 text-sm text-muted-foreground">
        <input v-model="startWithLorem" type="checkbox" class="accent-[hsl(var(--primary))]" />首段以 Lorem ipsum 起头
      </label>
      <Button variant="primary" size="sm" class="ml-auto" @click="regen">
        <RefreshCw :size="14" />重新生成
      </Button>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-xs text-muted-foreground">{{ text.length }} 字符 · {{ text.split(/\s+/).filter(Boolean).length }} 词</span>
      <CopyButton :text="text" />
    </div>
    <Textarea :model-value="text" :rows="14" readonly />
  </div>
</template>
