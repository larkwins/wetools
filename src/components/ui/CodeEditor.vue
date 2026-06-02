<script setup lang="ts">
/**
 * CodeEditor —— 基于 CodeMirror 6 的通用代码编辑器
 *
 * 设计要点：
 *   - 核心（state/view/commands/language/theme）静态 import，CodeMirror 启动是同步的，
 *     onMounted 同一帧内即完成，不会有可感知的延迟，因此**不需要任何 placeholder/loading 占位**。
 *   - 各语言扩展按 prop dynamic import，不阻塞核心 ready。
 *   - 父组件通过 v-model 双向绑定字符串内容；外部 modelValue 变化（如 swap/mode 切换/computed 输出）
 *     会立即同步到 CodeMirror doc。
 *   - updateListener 仅在 transaction 来自用户事件时回写，杜绝循环写入。
 *
 * 使用：
 *   <CodeEditor v-model="code" lang="json" :rows="20" placeholder="…" />
 *   <CodeEditor :model-value="output" lang="go" readonly />
 */
import { ref, watch, onMounted, onBeforeUnmount, shallowRef, computed, nextTick } from 'vue';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder as placeholderExt } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle,
  foldGutter, foldKeymap, StreamLanguage,
} from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

type Lang =
  | 'json' | 'yaml' | 'toml' | 'xml' | 'html' | 'sql'
  | 'go' | 'typescript' | 'javascript'
  | 'proto' | 'shell' | 'properties' | 'text';

const props = withDefaults(defineProps<{
  modelValue: string;
  lang?: Lang;
  readonly?: boolean;
  rows?: number;
  placeholder?: string;
}>(), {
  lang: 'text',
  readonly: false,
  rows: 16,
  placeholder: '',
});

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const wrapper = ref<HTMLDivElement | null>(null);
const view = shallowRef<EditorView | null>(null);

/**
 * `mounted` 控制 SSR 占位 `<pre>` 的显示。
 * - SSR 阶段：mounted=false，<pre> 渲染默认内容，用户进入页面**首屏**就能读到
 * - 客户端 hydrate：mounted 仍为 false（与 SSR 保持一致避免 hydration mismatch）
 * - onMounted → CodeMirror 实例创建完成 → mounted=true → <pre> 消失
 */
const mounted = ref(false);

const themeCompartment = new Compartment();
const readonlyCompartment = new Compartment();
const langCompartment = new Compartment();

const isDark = ref(false);

/** 按需动态加载语言扩展（每个 case 一个独立 chunk，CodeMirror 已就绪后再注入高亮） */
async function loadLangExtension(lang: string): Promise<Extension> {
  switch (lang) {
    case 'json':       return (await import('@codemirror/lang-json')).json();
    case 'yaml':       return (await import('@codemirror/lang-yaml')).yaml();
    case 'xml':        return (await import('@codemirror/lang-xml')).xml();
    case 'html':       return (await import('@codemirror/lang-html')).html();
    case 'sql':        return (await import('@codemirror/lang-sql')).sql();
    case 'go':         return (await import('@codemirror/lang-go')).go();
    case 'typescript': return (await import('@codemirror/lang-javascript')).javascript({ typescript: true });
    case 'javascript': return (await import('@codemirror/lang-javascript')).javascript();
    case 'toml':       return StreamLanguage.define((await import('@codemirror/legacy-modes/mode/toml')).toml);
    case 'proto':      return StreamLanguage.define((await import('@codemirror/legacy-modes/mode/protobuf')).protobuf);
    case 'shell':      return StreamLanguage.define((await import('@codemirror/legacy-modes/mode/shell')).shell);
    case 'properties': return StreamLanguage.define((await import('@codemirror/legacy-modes/mode/properties')).properties);
    default: return [];
  }
}

const lightTheme = EditorView.theme({
  '&': {
    color: 'hsl(var(--foreground))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: '13px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  '.cm-content': { caretColor: 'hsl(var(--primary))', padding: '8px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'hsl(var(--primary))' },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'hsl(var(--primary) / 0.18)',
  },
  '.cm-gutters': {
    backgroundColor: 'hsl(var(--muted) / 0.4)',
    color: 'hsl(var(--muted-foreground))',
    border: 'none',
    borderRight: '1px solid hsl(var(--border))',
  },
  '.cm-activeLineGutter': { backgroundColor: 'hsl(var(--primary) / 0.1)' },
  '.cm-activeLine': { backgroundColor: 'hsl(var(--primary) / 0.05)' },
  '.cm-foldGutter span': { color: 'hsl(var(--muted-foreground))' },
  '.cm-placeholder': { color: 'hsl(var(--muted-foreground) / 0.7)' },
}, { dark: false });

let darkObserver: MutationObserver | null = null;

function initEditor() {
  if (!wrapper.value || view.value) return;
  isDark.value = document.documentElement.classList.contains('dark');

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      lineNumbers(),
      foldGutter(),
      history(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
      EditorView.lineWrapping,
      placeholderExt(props.placeholder),
      langCompartment.of([]),
      themeCompartment.of(isDark.value ? oneDark : lightTheme),
      readonlyCompartment.of(EditorState.readOnly.of(props.readonly)),
      EditorView.updateListener.of((v) => {
        if (!v.docChanged || props.readonly) return;
        const userEvent = v.transactions.some((t) =>
          t.isUserEvent('input') ||
          t.isUserEvent('delete') ||
          t.isUserEvent('move') ||
          t.isUserEvent('paste') ||
          t.isUserEvent('undo') ||
          t.isUserEvent('redo')
        );
        if (!userEvent) return;
        const value = v.state.doc.toString();
        if (value !== props.modelValue) emit('update:modelValue', value);
      }),
    ],
  });

  view.value = new EditorView({ state, parent: wrapper.value });
  // EditorView 已挂载到 wrapper，触发 mounted=true 让 SSR <pre> 占位消失
  mounted.value = true;

  // 异步注入语言高亮
  if (props.lang && props.lang !== 'text') {
    loadLangExtension(props.lang).then((ext) => {
      view.value?.dispatch({ effects: langCompartment.reconfigure(ext) });
    }).catch((e) => console.warn('[CodeEditor] load lang failed:', props.lang, e));
  }

  // 主题跟随 .dark class
  darkObserver = new MutationObserver(() => {
    const next = document.documentElement.classList.contains('dark');
    if (next !== isDark.value) {
      isDark.value = next;
      view.value?.dispatch({ effects: themeCompartment.reconfigure(next ? oneDark : lightTheme) });
    }
  });
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

onMounted(async () => {
  // nextTick 确保 wrapper 在 DOM 中就绪（Astro island / async component 边界下更稳）
  await nextTick();
  initEditor();
});

onBeforeUnmount(() => {
  darkObserver?.disconnect();
  view.value?.destroy();
  view.value = null;
});

/** 外部 modelValue 变化（swap/reset/mode 切换/computed 输出）→ 同步进 doc */
watch(() => props.modelValue, (val) => {
  const v = view.value;
  if (!v) return;
  const current = v.state.doc.toString();
  if (val === current) return;
  v.dispatch({ changes: { from: 0, to: current.length, insert: val ?? '' } });
});

watch(() => props.readonly, (ro) => {
  view.value?.dispatch({ effects: readonlyCompartment.reconfigure(EditorState.readOnly.of(ro)) });
});

watch(() => props.lang, async (lang) => {
  if (!view.value) return;
  const ext = await loadLangExtension(lang);
  view.value.dispatch({ effects: langCompartment.reconfigure(ext) });
});

const minHeight = computed(() => `${props.rows * 19 + 16}px`);
</script>

<template>
  <!-- 外层 relative 容器：CodeMirror 挂载点 + SSR 占位 <pre> 共存于此
       hydrate 完成后 <pre> 用 v-show 隐藏，避免与 CodeMirror DOM 视觉重叠 -->
  <div
    class="relative overflow-hidden rounded-md border bg-card focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30"
    :style="{ minHeight }"
  >
    <!-- CodeMirror 挂载点（始终在 DOM 中）；minHeight 同样作用在 wrapper 上，
         避免 h-full 在只有 min-height 的父元素下塌成 0 -->
    <div ref="wrapper" class="h-full" :style="{ minHeight }" />

    <!-- SSR 占位：服务端渲染时把 modelValue 内容直接 HTML 化输出，
         首屏就能读到默认内容，不再"白屏 2 秒等 chunk"。
         - data-no-i18n：跳过 useToolI18n 扫描，避免 i18n 改动 textContent 引发抖动
         - pointer-events-none：不抢焦点，hydrate 中不影响交互
         - v-show 而非 v-if：保证 SSR/client 初次 render 一致，无 hydration mismatch -->
    <pre
      v-show="!mounted"
      data-no-i18n
      class="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words bg-card p-2 font-mono text-[13px] leading-[19px] text-foreground/80"
    >{{ modelValue || placeholder }}</pre>
  </div>
</template>

<style>
.cm-editor.cm-focused { outline: none !important; }
.cm-editor { height: 100%; }
.cm-scroller { overflow: auto; }
</style>
