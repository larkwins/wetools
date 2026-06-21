/**
 * useToolI18n - 工具页内容自动多语言适配
 *
 * 策略：
 *  - zh-CN：保持原文
 *  - zh-TW：通过 OpenCC 把工具页 DOM 内所有中文文本转为繁体
 *  - en  ：使用 zhEnDict 字典把中文 UI 文案替换为英文（未命中字典的中文保持原样）
 *
 * 同时扫描：
 *  - 所有文本节点（textContent）
 *  - 常见属性：placeholder / title / aria-label / alt（中文也要适配）
 *
 * 与全站 GlobalI18n 行为一致，但作用域限定在 [data-tool-content] 容器内，
 * 用于覆盖 GlobalI18n 之外的、由 Vue 动态渲染的工具子树（Vue hydrate 后渲染的节点
 * 不在 Astro SSR 输出里，GlobalI18n 的首次扫描可能错过，这里补一道）。
 */
import { watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { toTraditional, waitOpenCC } from '@/lib/i18n';
import { translateZhToEn, waitZhEnReady } from '@/lib/zhEnDict';

interface Options {
  /** 要转换的容器 selector，默认整个工具内容区 */
  container?: string;
}

/** 需要扫描翻译的属性名 */
const I18N_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;

/**
 * 跳过翻译的子树 selector。
 * - `.cm-editor`：CodeMirror 编辑器 —— 内部 DOM 高频变更（输入/滚动/光标），
 *   且行内全是用户代码，绝不能翻译；如不跳过，observer 会被打爆导致页面卡死
 * - `[data-no-i18n]`：业务侧主动声明跳过的容器
 */
const SKIP_SELECTOR = '.cm-editor, [data-no-i18n]';

/** 判断节点是否在跳过翻译的子树内 */
function isInSkipped(node: Node): boolean {
  let el: Node | null = node;
  // 文本节点没有 closest，用父元素
  if (el.nodeType === Node.TEXT_NODE) el = el.parentElement;
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  return !!(el as Element).closest(SKIP_SELECTOR);
}

export function useToolI18n(opts: Options = {}) {
  const store = useLocaleStore();
  const { locale } = storeToRefs(store);

  // 记录文本节点原始值
  const originalsText = new WeakMap<Text, string>();
  // 记录元素属性原始值：element -> { attrName -> origValue }
  const originalsAttr = new WeakMap<Element, Record<string, string>>();
  let observer: MutationObserver | null = null;
  let pending = false;

  function getRoot(): HTMLElement | null {
    return document.querySelector<HTMLElement>(opts.container ?? '[data-tool-content]');
  }

  /** 把原文按当前 locale 转换为显示文本 */
  function transform(orig: string, loc: typeof locale.value): string {
    if (!orig) return orig;
    if (loc === 'zh-TW') return toTraditional(orig);
    if (loc === 'en') return translateZhToEn(orig);
    return orig; // zh-CN
  }

  /** 是否包含中文字符（避免无谓处理纯英文/数字节点） */
  function hasCJK(s: string): boolean {
    return /[\u4e00-\u9fff]/.test(s);
  }

  function applyTextNodes(root: HTMLElement, loc: typeof locale.value) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const t = node.nodeValue;
        if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
        // 跳过 CodeMirror 等高频变更子树
        if (isInSkipped(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const tn = n as Text;
      const orig = originalsText.get(tn) ?? tn.nodeValue ?? '';
      if (!originalsText.has(tn)) originalsText.set(tn, orig);
      if (!hasCJK(orig) && loc !== 'zh-TW') {
        // 纯非中文 + 非繁体场景，不需要变更
        if (tn.nodeValue !== orig) tn.nodeValue = orig;
        continue;
      }
      const next = transform(orig, loc);
      if (tn.nodeValue !== next) tn.nodeValue = next;
    }
  }

  function applyAttrs(root: HTMLElement, loc: typeof locale.value) {
    // 遍历包含目标属性的元素
    for (const attr of I18N_ATTRS) {
      const list = root.querySelectorAll<HTMLElement>(`[${attr}]`);
      list.forEach((el) => {
        // 跳过 CodeMirror 等子树
        if (isInSkipped(el)) return;
        let cache = originalsAttr.get(el);
        if (!cache) {
          cache = {};
          originalsAttr.set(el, cache);
        }
        const orig = cache[attr] ?? el.getAttribute(attr) ?? '';
        if (!(attr in cache)) cache[attr] = orig;
        if (!hasCJK(orig) && loc !== 'zh-TW') {
          if (el.getAttribute(attr) !== orig) el.setAttribute(attr, orig);
          return;
        }
        const next = transform(orig, loc);
        if (el.getAttribute(attr) !== next) el.setAttribute(attr, next);
      });
    }
  }

  async function refresh() {
    await nextTick();
    const root = getRoot();
    if (!root) return;
    if (locale.value === 'zh-TW') await waitOpenCC();
    if (locale.value === 'en') await waitZhEnReady();
    // 执行翻译期间暂停 observer，防止 nodeValue 修改触发 mutation → 无限循环
    observer?.disconnect();
    applyTextNodes(root, locale.value);
    applyAttrs(root, locale.value);
    // 翻译完成后重新接入 observer（监听后续 Vue 动态渲染的新节点）
    setupObserver(root);
  }

  function setupObserver(root: HTMLElement) {
    observer?.disconnect();
    observer = new MutationObserver((mutations) => {
      const hasRelevant = mutations.some((m) => !isInSkipped(m.target));
      if (!hasRelevant) return;
      if (pending) return;
      pending = true;
      Promise.resolve().then(() => {
        pending = false;
        // 暂停 observer，防止翻译写入触发新的 mutation 循环
        observer?.disconnect();
        applyTextNodes(root, locale.value);
        applyAttrs(root, locale.value);
        setupObserver(root);
      });
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: true,
      attributeFilter: [...I18N_ATTRS],
    });
  }

  onMounted(async () => {
    await refresh();
    const root = getRoot();
    if (root) setupObserver(root);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  // 切换语言时重新应用
  watch(locale, async () => {
    await refresh();
  });
}
