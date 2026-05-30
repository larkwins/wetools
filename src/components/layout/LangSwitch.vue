<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Languages, Check } from 'lucide-vue-next';
import { useLocaleStore, type LocaleId } from '@/stores/locale';
import { getDict, waitOpenCC } from '@/lib/i18n';

const LOCALES: { id: LocaleId; native: string; short: string }[] = [
  { id: 'zh-CN', native: '简体中文', short: '中' },
  { id: 'zh-TW', native: '繁體中文', short: '繁' },
  { id: 'en', native: 'English', short: 'EN' },
];

const open = ref(false);
const store = useLocaleStore();
const { locale } = storeToRefs(store);
const current = computed(() => LOCALES.find((l) => l.id === locale.value) ?? LOCALES[0]);
const dict = computed(() => getDict(locale.value));

onMounted(() => {
  document.documentElement.lang = locale.value;
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-lang-switch]')) open.value = false;
  });
});

async function pick(e: MouseEvent, next: LocaleId) {
  open.value = false;
  // 主动 blur，避免点击后 :focus-visible 仍在该按钮上残留蓝色焦点环
  (e.currentTarget as HTMLElement | null)?.blur();
  if (next === locale.value) return;
  // 切到繁体时确保 OpenCC 已加载，避免首次切换看不到效果
  if (next === 'zh-TW') await waitOpenCC();
  store.set(next);
}
</script>

<template>
  <div class="relative" data-lang-switch>
    <button
      type="button"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      :aria-label="dict.lang.switch"
      :title="current.native"
      @click="open = !open"
    >
      <Languages :size="15" />
    </button>
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-show="open"
        class="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] origin-top-right rounded-lg border bg-popover p-1 shadow-lg"
      >
        <button
          v-for="opt in LOCALES"
          :key="opt.id"
          type="button"
          translate="no"
          data-no-i18n
          :lang="opt.id"
          :style="locale === opt.id
            ? { color: 'hsl(var(--primary))', fontWeight: 500 }
            : { color: 'hsl(var(--foreground))' }"
          :class="[
            'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] transition-colors hover:bg-secondary',
            // 菜单项不需要焦点环（hover 已表达），否则点击后蓝色 ring 残留像选中
            'focus-visible:!ring-0 focus-visible:!ring-offset-0',
          ]"
          @click="pick($event, opt.id)"
        >
          <!-- translate="no" + data-no-i18n 双重保险：
               1. translate="no" 告诉浏览器内置翻译/沉浸式翻译等扩展跳过这段文本（避免其把"English"染成蓝色提示）；
               2. data-no-i18n 告诉本站 GlobalI18n 翻译器跳过该子树；
               3. 颜色用 inline style 而非 class，绕过任何用户样式/扩展样式覆盖。 -->
          <span>{{ opt.native }}</span>
          <Check v-if="locale === opt.id" :size="13" />
        </button>
      </div>
    </Transition>
  </div>
</template>
