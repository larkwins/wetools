<script setup lang="ts">
/**
 * GlobalI18n - 全局 DOM 文本/属性多语言翻译器
 *
 * 因为大部分页面是 Astro 静态 SSR（中文硬编码），此组件挂载到 body 后：
 *  - locale=zh-CN：保持原文
 *  - locale=zh-TW：用 OpenCC 把命中字典/可转换的中文转为繁体
 *  - locale=en  ：用 zhEnDict 把中文 UI 文案替换为英文（未命中保持中文）
 *
 * 同时扫描：
 *  - 全 body 的文本节点
 *  - 元素属性：placeholder / title / aria-label / alt
 *
 * MutationObserver 监听 DOM/属性变化，保证 Vue 动态新增节点也被翻译。
 */
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { toTraditional, waitOpenCC } from '@/lib/i18n';
import { translateZhToEn, waitZhEnReady } from '@/lib/zhEnDict';

const store = useLocaleStore();
const { locale } = storeToRefs(store);

// 记录原始文本/属性，保证切回 zh-CN 能复原
const originalsText = new WeakMap<Text, string>();
// 记录我们上次写入该文本节点的译文，用于侦测 Vue 是否重新渲染过该节点
const appliedText = new WeakMap<Text, string>();
const originalsAttr = new WeakMap<Element, Record<string, string>>();
let observer: MutationObserver | null = null;
let pending = false;

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'KBD']);
const I18N_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;

/**
 * 跳过 CodeMirror 编辑器子树。
 *
 * CodeMirror 把每行渲染成 <div class="cm-line">，内部 Text 节点会被复用：
 * 同一个 Text 对象的 nodeValue 会随 doc/语法高亮变化而被 CodeMirror 改写。
 *
 * 如果 GlobalI18n 把这些 Text 节点的"原始值"缓存到 WeakMap，
 * 之后 CodeMirror 改了它们 —— GlobalI18n observer 触发，会把 nodeValue
 * 强行改回缓存值；CodeMirror 的 contentEditable 监听器看到 DOM 突变，
 * 又把这次改动当成用户输入回写到 doc，最终内容指数式雪球。
 *
 * 因此 .cm-editor 整个子树必须从 i18n 扫描中排除。
 */
const SKIP_SELECTOR = '.cm-editor, [data-no-i18n]';

function hasCJK(s: string): boolean {
  return /[\u4e00-\u9fff]/.test(s);
}

function shouldSkip(node: Node): boolean {
  // 检查 closest('.cm-editor, [data-no-i18n]')：CodeMirror 子树和业务声明的跳过容器
  let probe: Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
  if (probe && probe.nodeType === Node.ELEMENT_NODE) {
    if ((probe as Element).closest(SKIP_SELECTOR)) return true;
  }
  // 兜底：祖先链查 SKIP_TAGS / data-no-i18n
  let cur: Node | null = node.nodeType === 1 ? node : node.parentNode;
  while (cur && cur !== document.body) {
    if (cur.nodeType === 1) {
      const el = cur as Element;
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.hasAttribute('data-no-i18n')) return true;
    }
    cur = cur.parentNode;
  }
  return false;
}

function transform(orig: string, loc: typeof locale.value): string {
  if (!orig) return orig;
  if (loc === 'zh-TW') return toTraditional(orig);
  if (loc === 'en') return translateZhToEn(orig);
  return orig;
}

function applyTextNodes(loc: typeof locale.value) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const t = node.nodeValue;
      if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const tn = n as Text;
    const current = tn.nodeValue ?? '';
    // 若当前值与我们上次写入的译文不同，说明 Vue 重新渲染了该节点 → 重新捕获原文，
    // 避免把 Vue 动态更新后的文本（如状态由"未连接"变为"已连接"）回写成旧缓存值。
    const last = appliedText.get(tn);
    if (last === undefined || current !== last) originalsText.set(tn, current);
    const orig = originalsText.get(tn) ?? current;

    if (!hasCJK(orig) && loc !== 'zh-TW') {
      if (tn.nodeValue !== orig) tn.nodeValue = orig;
      appliedText.set(tn, orig);
      continue;
    }
    const next = transform(orig, loc);
    if (tn.nodeValue !== next) tn.nodeValue = next;
    appliedText.set(tn, next);
  }
}

function applyAttrs(loc: typeof locale.value) {
  for (const attr of I18N_ATTRS) {
    const list = document.body.querySelectorAll<HTMLElement>(`[${attr}]`);
    list.forEach((el) => {
      if (shouldSkip(el) && !(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      let cache = originalsAttr.get(el);
      if (!cache) {
        cache = {};
        originalsAttr.set(el, cache);
      }
      const current = el.getAttribute(attr) ?? '';
      const orig = cache[attr] ?? current;
      if (!(attr in cache)) cache[attr] = orig;

      // zh-CN：不改写属性值，仅同步缓存
      if (loc === 'zh-CN') {
        if (cache[attr] !== current) cache[attr] = current;
        return;
      }

      if (!hasCJK(orig) && loc !== 'zh-TW') {
        if (el.getAttribute(attr) !== orig) el.setAttribute(attr, orig);
        return;
      }
      const next = transform(orig, loc);
      if (el.getAttribute(attr) !== next) el.setAttribute(attr, next);
    });
  }
}

/**
 * 同步翻译 <head> 内的 document.title 与若干 SEO meta，
 * 因 GlobalI18n 只扫描 body，这些位置需单独处理。
 *
 * 记录每个目标的原始值（zh-CN），保证切回 zh-CN 时能还原。
 */
const originalDocTitle = { value: '' as string, captured: false };
const originalMeta = new Map<HTMLMetaElement, string>();

function applyHeadMeta(loc: typeof locale.value) {
  // <title>
  if (!originalDocTitle.captured) {
    originalDocTitle.value = document.title;
    originalDocTitle.captured = true;
  }
  const titleOrig = originalDocTitle.value;
  if (titleOrig) {
    document.title = hasCJK(titleOrig) || loc === 'zh-TW' ? transform(titleOrig, loc) : titleOrig;
  }

  // <meta name="description"> 以及 og:* / twitter:* 描述/标题
  const metas = document.head.querySelectorAll<HTMLMetaElement>(
    'meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]'
  );
  metas.forEach((m) => {
    const orig = originalMeta.get(m) ?? m.getAttribute('content') ?? '';
    if (!originalMeta.has(m)) originalMeta.set(m, orig);
    if (!orig) return;
    if (!hasCJK(orig) && loc !== 'zh-TW') {
      if (m.getAttribute('content') !== orig) m.setAttribute('content', orig);
      return;
    }
    const next = transform(orig, loc);
    if (m.getAttribute('content') !== next) m.setAttribute('content', next);
  });

  // <html lang>
  document.documentElement.lang = loc;
}

async function refresh() {
  if (locale.value === 'zh-TW') await waitOpenCC();
  if (locale.value === 'en') await waitZhEnReady();
  applyTextNodes(locale.value);
  applyAttrs(locale.value);
  applyHeadMeta(locale.value);
}

function setupObserver() {
  observer?.disconnect();
  observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    Promise.resolve().then(() => {
      pending = false;
      applyTextNodes(locale.value);
      applyAttrs(locale.value);
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [...I18N_ATTRS],
  });
}

/** 解锁 BaseLayout 中的语言遮罩（仅对 en/zh-TW 有效；zh-CN 没有遮罩，调用也是 no-op） */
function revealBody() {
  const fn = (window as unknown as { __wetoolsRevealBody?: () => void }).__wetoolsRevealBody;
  if (typeof fn === 'function') {
    try { fn(); } catch { /* ignore */ }
  }
}

onMounted(async () => {
  try {
    await refresh();
  } finally {
    // 不论翻译成功与否，必须解锁 body，避免页面一直空白
    revealBody();
  }
  setupObserver();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

watch(locale, async () => {
  await refresh();
});
</script>

<template>
  <!-- 无 UI 输出，纯逻辑组件 -->
</template>
