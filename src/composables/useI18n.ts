/**
 * useI18n - 组件中获取响应式字典 + 工具 meta 国际化辅助
 */
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { getDict, pickI18n, waitOpenCC, type Locale } from '@/lib/i18n';
import type { ToolMeta } from '@/lib/types';

export function useI18n() {
  const store = useLocaleStore();
  const { locale } = storeToRefs(store);
  const dict = computed(() => getDict(locale.value));

  // OpenCC 加载完成标志，触发繁体内容重渲染
  const openccReady = ref(0);
  onMounted(async () => {
    if (locale.value === 'zh-TW') {
      await waitOpenCC();
      openccReady.value++;
    }
  });

  function t(meta: ToolMeta) {
    // openccReady 作为依赖项，触发繁体内容更新
    void openccReady.value;
    return pickI18n(meta, locale.value);
  }

  return { locale, dict, t };
}

export type { Locale };
