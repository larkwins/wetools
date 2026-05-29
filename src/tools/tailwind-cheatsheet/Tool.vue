<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

interface Item { cls: string; css: string; group: string }

const data: Item[] = [
  // Layout
  { group: '布局', cls: 'flex', css: 'display: flex' },
  { group: '布局', cls: 'inline-flex', css: 'display: inline-flex' },
  { group: '布局', cls: 'grid', css: 'display: grid' },
  { group: '布局', cls: 'hidden', css: 'display: none' },
  { group: '布局', cls: 'block', css: 'display: block' },
  { group: '布局', cls: 'inline', css: 'display: inline' },
  // Flexbox
  { group: 'Flex', cls: 'flex-col', css: 'flex-direction: column' },
  { group: 'Flex', cls: 'items-center', css: 'align-items: center' },
  { group: 'Flex', cls: 'justify-center', css: 'justify-content: center' },
  { group: 'Flex', cls: 'justify-between', css: 'justify-content: space-between' },
  { group: 'Flex', cls: 'gap-2', css: 'gap: 0.5rem' },
  { group: 'Flex', cls: 'gap-4', css: 'gap: 1rem' },
  { group: 'Flex', cls: 'flex-1', css: 'flex: 1 1 0%' },
  // Spacing
  { group: '间距', cls: 'p-4', css: 'padding: 1rem' },
  { group: '间距', cls: 'px-3 py-2', css: 'padding: 0.5rem 0.75rem' },
  { group: '间距', cls: 'm-auto', css: 'margin: auto' },
  { group: '间距', cls: 'space-y-2', css: '> * + * { margin-top: 0.5rem }' },
  // Sizing
  { group: '尺寸', cls: 'w-full', css: 'width: 100%' },
  { group: '尺寸', cls: 'h-9', css: 'height: 2.25rem' },
  { group: '尺寸', cls: 'min-h-screen', css: 'min-height: 100vh' },
  { group: '尺寸', cls: 'max-w-3xl', css: 'max-width: 48rem' },
  // Typography
  { group: '排版', cls: 'text-sm', css: 'font-size: 0.875rem' },
  { group: '排版', cls: 'text-base', css: 'font-size: 1rem' },
  { group: '排版', cls: 'font-semibold', css: 'font-weight: 600' },
  { group: '排版', cls: 'tracking-tight', css: 'letter-spacing: -0.025em' },
  { group: '排版', cls: 'text-center', css: 'text-align: center' },
  { group: '排版', cls: 'truncate', css: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap' },
  { group: '排版', cls: 'line-clamp-2', css: '-webkit-line-clamp: 2 (clamp 2 lines)' },
  // Colors
  { group: '颜色', cls: 'text-primary', css: 'color: hsl(var(--primary))' },
  { group: '颜色', cls: 'text-muted-foreground', css: 'color: hsl(var(--muted-foreground))' },
  { group: '颜色', cls: 'bg-card', css: 'background-color: hsl(var(--card))' },
  { group: '颜色', cls: 'bg-primary/10', css: 'background-color: hsl(var(--primary) / 0.1)' },
  // Border
  { group: '边框', cls: 'border', css: 'border-width: 1px' },
  { group: '边框', cls: 'rounded-md', css: 'border-radius: 8px' },
  { group: '边框', cls: 'rounded-lg', css: 'border-radius: 12px' },
  { group: '边框', cls: 'ring-2 ring-ring', css: '环形阴影' },
  // Effects
  { group: '效果', cls: 'shadow-soft', css: '柔和阴影' },
  { group: '效果', cls: 'backdrop-blur-md', css: 'backdrop-filter: blur(12px)' },
  { group: '效果', cls: 'opacity-50', css: 'opacity: 0.5' },
  // Transitions
  { group: '动画', cls: 'transition-colors', css: 'transition-property: background, border, color' },
  { group: '动画', cls: 'duration-150', css: 'transition-duration: 150ms' },
  { group: '动画', cls: 'animate-fade-in', css: '渐显动画 200ms' },
  // Position
  { group: '定位', cls: 'absolute', css: 'position: absolute' },
  { group: '定位', cls: 'sticky top-0', css: 'position: sticky; top: 0' },
  { group: '定位', cls: 'inset-0', css: 'top/right/bottom/left: 0' },
  { group: '定位', cls: 'z-40', css: 'z-index: 40' },
  // Responsive
  { group: '响应式', cls: 'sm:flex md:hidden', css: 'sm 显示，md 隐藏' },
  { group: '响应式', cls: 'lg:grid-cols-3', css: 'lg 屏幕 grid 3 列' },
  // Hover/Focus
  { group: '状态', cls: 'hover:bg-primary/10', css: 'hover 时背景' },
  { group: '状态', cls: 'focus-visible:ring-2', css: '键盘聚焦环' },
  { group: '状态', cls: 'group-hover:text-primary', css: '父级 hover 时变色（父级须 group）' },
  { group: '状态', cls: 'dark:bg-zinc-900', css: '暗色模式背景' },
];

const q = ref('');
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase();
  if (!k) return data;
  return data.filter((d) => d.cls.toLowerCase().includes(k) || d.css.toLowerCase().includes(k) || d.group.includes(k));
});

const grouped = computed(() => {
  const map = new Map<string, Item[]>();
  for (const it of filtered.value) {
    if (!map.has(it.group)) map.set(it.group, []);
    map.get(it.group)!.push(it);
  }
  return Array.from(map.entries());
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative max-w-md">
      <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="q" placeholder="搜索类名 / CSS / 分组…" class="pl-9 font-mono" />
    </div>

    <div v-if="filtered.length === 0" class="rounded-md border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
      没有匹配的 utility
    </div>

    <div v-for="[g, items] in grouped" :key="g" class="space-y-2">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ g }}</h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <div v-for="i in items" :key="i.cls" class="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
          <code class="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{{ i.cls }}</code>
          <span class="flex-1 truncate font-mono text-xs text-muted-foreground">{{ i.css }}</span>
          <CopyButton :text="i.cls" icon-only />
        </div>
      </div>
    </div>
  </div>
</template>
