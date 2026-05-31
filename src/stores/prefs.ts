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

  // 监听由非 Vue 代码（如首页 inline script 中"收藏区取消按钮"）派发的事件，
  // 把最新 favorites 同步到 store —— 否则同一标签内 localStorage.setItem
  // 不会触发 storage 事件，分类卡里的 FavoriteButton 不会自动取消点亮。
  // 用 islandSync 标记避免每个 island 重复注册同名 listener。
  if (typeof window !== 'undefined') {
    const w = window as unknown as { __wetoolsPrefsListenerBound?: boolean };
    if (!w.__wetoolsPrefsListenerBound) {
      w.__wetoolsPrefsListenerBound = true;
      window.addEventListener('wetools:favoritesChanged', ((e: Event) => {
        const detail = (e as CustomEvent<{ favorites?: unknown }>).detail;
        const next = detail?.favorites;
        if (!Array.isArray(next)) return;
        const onlyStrings = next.filter((x): x is string => typeof x === 'string');
        // 仅当与当前不同才赋值，避免与 toggleFavorite 自派事件形成循环
        const cur = favorites.value;
        if (cur.length === onlyStrings.length && cur.every((v, i) => v === onlyStrings[i])) return;
        favorites.value = onlyStrings;
      }) as EventListener);
    }
  }

  function isFavorite(id: string): boolean {
    return favorites.value.includes(id);
  }

  function toggleFavorite(id: string): void {
    if (isFavorite(id)) {
      favorites.value = favorites.value.filter((x) => x !== id);
    } else {
      favorites.value = [id, ...favorites.value];
    }
    // 通知页面上其它需要响应收藏变化的 DOM（如首页的"我的收藏"静态区块）
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('wetools:favoritesChanged', { detail: { favorites: favorites.value.slice() } })
        );
      } catch {
        /* ignore */
      }
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
