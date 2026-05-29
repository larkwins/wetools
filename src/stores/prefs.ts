import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

/**
 * 收藏与最近使用 store
 * 使用 VueUse useStorage 自动持久化到 localStorage（跨标签同步）
 */

const FAV_KEY = 'wetools:favorites';
const RECENT_KEY = 'wetools:recents';
const RECENT_LIMIT = 12;

export const usePrefsStore = defineStore('prefs', () => {
  const favorites = useStorage<string[]>(FAV_KEY, []);
  const recents = useStorage<string[]>(RECENT_KEY, []);

  function isFavorite(id: string): boolean {
    return favorites.value.includes(id);
  }

  function toggleFavorite(id: string): void {
    if (isFavorite(id)) {
      favorites.value = favorites.value.filter((x) => x !== id);
    } else {
      favorites.value = [id, ...favorites.value];
    }
  }

  function pushRecent(id: string): void {
    const next = [id, ...recents.value.filter((x) => x !== id)].slice(0, RECENT_LIMIT);
    recents.value = next;
  }

  function clearRecents(): void {
    recents.value = [];
  }

  return {
    favorites,
    recents,
    isFavorite,
    toggleFavorite,
    pushRecent,
    clearRecents,
  };
});
