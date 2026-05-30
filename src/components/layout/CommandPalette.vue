<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Search, Star, Clock, ArrowRight, X, CornerDownLeft } from 'lucide-vue-next';
import Fuse from 'fuse.js';
import type { ToolMeta, CategoryMeta } from '@/lib/types';
import { usePrefsStore } from '@/stores/prefs';
import { getIcon } from '@/lib/icons';

const props = defineProps<{
  allTools: ToolMeta[];
  categories: CategoryMeta[];
}>();

// 所有可见文案以中文为源，由 GlobalI18n 在客户端按当前 locale 翻译为 zh-TW / en，
// 避免每个 Astro client island 各自创建 Pinia 实例导致的 SSR/CSR locale 不一致。
const prefs = usePrefsStore();
const { favorites, recents } = storeToRefs(prefs);

const open = ref(false);
const query = ref('');
const activeIdx = ref(0);
const ico = getIcon;

const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLUListElement | null>(null);

// 工具按 id 反查
const byId = (id: string) => props.allTools.find((t) => t.id === id);

const fuse = computed(
  () =>
    new Fuse(props.allTools, {
      keys: [
        { name: 'i18n.zh.title', weight: 2 },
        { name: 'i18n.en.title', weight: 2 },
        { name: 'i18n.zh.description', weight: 1 },
        { name: 'i18n.en.description', weight: 1 },
        { name: 'keywords', weight: 1.5 },
        { name: 'id', weight: 0.5 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: false,
    })
);

interface Group {
  id: 'fav' | 'recent' | 'search' | string;
  title: string;
  icon?: string;
  tools: ToolMeta[];
}

const groups = computed<Group[]>(() => {
  const q = query.value.trim();
  if (q) {
    const found = fuse.value.search(q).map((r) => r.item).slice(0, 24);
    return [{ id: 'search', title: '搜索结果', tools: found }];
  }
  const arr: Group[] = [];
  const favs = favorites.value.map(byId).filter((x): x is ToolMeta => Boolean(x));
  if (favs.length) arr.push({ id: 'fav', title: '收藏', icon: 'Star', tools: favs.slice(0, 8) });
  const recs = recents.value.map(byId).filter((x): x is ToolMeta => Boolean(x));
  if (recs.length) arr.push({ id: 'recent', title: '最近使用', icon: 'Clock', tools: recs.slice(0, 6) });
  // 分类（取 zh 标题；GlobalI18n 会按 locale 翻译）
  const sorted = [...props.categories].sort((a, b) => a.order - b.order);
  for (const c of sorted) {
    const tools = props.allTools.filter((t) => t.category === c.id);
    if (tools.length) arr.push({ id: c.id, title: c.i18n.zh.title, icon: c.icon, tools });
  }
  return arr;
});

// 平铺，便于 ↑↓ 导航
const flat = computed(() => {
  const list: { tool: ToolMeta; group: string }[] = [];
  for (const g of groups.value) for (const t of g.tools) list.push({ tool: t, group: g.title });
  return list;
});

// 渲染用：把分组标题和工具按顺序混合，每个 tool 携带它在 flat 中的索引
type HeaderItem = { kind: 'header'; title: string; icon?: string };
type ToolItem = { kind: 'tool'; tool: ToolMeta; idx: number };
const flatWithHeaders = computed<(HeaderItem | ToolItem)[]>(() => {
  const out: (HeaderItem | ToolItem)[] = [];
  let i = 0;
  for (const g of groups.value) {
    out.push({ kind: 'header', title: g.title, icon: g.icon });
    for (const t of g.tools) {
      out.push({ kind: 'tool', tool: t, idx: i });
      i++;
    }
  }
  return out;
});

watch(query, () => {
  activeIdx.value = 0;
});

watch(open, async (v) => {
  if (v) {
    activeIdx.value = 0;
    await nextTick();
    inputRef.value?.focus();
  } else {
    query.value = '';
  }
});

function show() {
  open.value = true;
}
function hide() {
  open.value = false;
}

function go(t: ToolMeta) {
  prefs.pushRecent(t.id);
  window.location.href = `/${t.id}`;
}

function onKey(e: KeyboardEvent) {
  if (!open.value) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      show();
    }
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    hide();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIdx.value = Math.min(flat.value.length - 1, activeIdx.value + 1);
    scrollActive();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIdx.value = Math.max(0, activeIdx.value - 1);
    scrollActive();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const item = flat.value[activeIdx.value];
    if (item) go(item.tool);
  }
}

function scrollActive() {
  nextTick(() => {
    const el = listRef.value?.querySelector(`[data-idx="${activeIdx.value}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  });
}

function indexOf(tool: ToolMeta) {
  return flat.value.findIndex((x) => x.tool.id === tool.id);
}

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
  window.addEventListener('keydown', onKey);
  window.addEventListener('wetools:openPalette', show as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('wetools:openPalette', show as EventListener);
});
</script>

<template>
  <Teleport to="body" :disabled="!mounted">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-background/40 backdrop-blur-sm"
        @click.self="hide"
      >
        <div
          class="mx-auto mt-[12vh] flex max-h-[70vh] w-[min(680px,calc(100%-2rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl animate-pop-in"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-center gap-3 border-b px-4">
            <Search :size="16" class="flex-none text-muted-foreground" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="h-12 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
              placeholder="搜索工具…"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="hidden sm:inline-flex h-5 items-center rounded border bg-secondary/60 px-1.5 font-mono text-[10px] text-muted-foreground">esc</kbd>
            <button
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="关闭"
              @click="hide"
            >
              <X :size="14" />
            </button>
          </div>

          <ul ref="listRef" class="flex-1 overflow-y-auto p-2">
            <li v-if="flat.length === 0" class="px-3 py-8 text-center text-sm text-muted-foreground">
              没有匹配的工具
            </li>
            <template v-for="(item, idx) in flatWithHeaders" :key="`${item.kind}-${idx}`">
              <li
                v-if="item.kind === 'header'"
                class="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:mt-0"
              >
                <component v-if="item.icon" :is="ico(item.icon)" :size="11" />
                {{ item.title }}
              </li>
              <li
                v-else
                :data-idx="item.idx"
                :class="[
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  item.idx === activeIdx ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary',
                ]"
                @mouseenter="activeIdx = item.idx"
                @click="go(item.tool)"
              >
                <component :is="ico(item.tool.icon)" :size="16" class="flex-none opacity-80" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">{{ item.tool.i18n.zh.title }}</p>
                  <p class="truncate text-xs text-muted-foreground">{{ item.tool.i18n.zh.description }}</p>
                </div>
                <ArrowRight v-if="item.idx === activeIdx" :size="14" class="flex-none text-primary" />
              </li>
            </template>
          </ul>

          <div class="flex items-center gap-3 border-t bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
            <span class="inline-flex items-center gap-1.5">
              <kbd class="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
              <span>选择</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <kbd class="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]"><CornerDownLeft :size="10" class="inline" /></kbd>
              <span>打开</span>
            </span>
            <!-- 数量统计：把数字单独包 <span>，前后中文短语在字典里可整段命中 -->
            <span class="ml-auto">
              <span>共匹配</span> {{ flat.length }} <span>个工具</span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
