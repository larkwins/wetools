import { ref } from 'vue';

/**
 * 通用复制 composable
 * 提供 copy(text) 与 1.5s 自动复位的 `copied` 标志，配合 Lucide Check / Copy 切换
 */
export function useCopy(timeout = 1500) {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copied.value = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied.value = false;
      }, timeout);
      return true;
    } catch (e) {
      if (import.meta.env.DEV) console.error('[useCopy] failed', e);
      return false;
    }
  }

  return { copied, copy };
}
