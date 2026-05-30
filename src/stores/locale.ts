/**
 * Locale store - 全局语言状态
 * 支持 zh-CN / zh-TW / en，使用 Pinia + localStorage 持久化
 */
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { computed } from 'vue';

export type LocaleId = 'zh-CN' | 'zh-TW' | 'en';

const STORAGE_KEY = 'wetools:locale';

function detectLocale(): LocaleId {
  if (typeof navigator === 'undefined') return 'zh-CN';
  const lang = navigator.language || 'zh-CN';
  if (lang.startsWith('en')) return 'en';
  if (/zh-(TW|HK|MO)|zh-Hant/i.test(lang)) return 'zh-TW';
  return 'zh-CN';
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = useStorage<LocaleId>(STORAGE_KEY, detectLocale());

  // 简化后的"基础语言"：zh-CN / zh-TW 都属于中文，en 属于英文
  // 用于从 ToolMeta.i18n 中取数据（meta 只有 zh/en 两套）
  const baseLang = computed<'zh' | 'en'>(() => (locale.value === 'en' ? 'en' : 'zh'));

  function set(next: LocaleId) {
    locale.value = next;
    if (typeof document !== 'undefined') document.documentElement.lang = next;
  }

  return { locale, baseLang, set };
});
