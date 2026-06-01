<script setup lang="ts">
/**
 * CodeEditor —— 基于 CodeMirror 6 的通用代码编辑器
 *
 * 体积控制策略（关键）：
 *   - 核心 chunk（state/view/commands/language/theme）静态 import：所有用 CodeEditor
 *     的工具共享，gzip ~80KB
 *   - 各语言扩展（lang-json / lang-sql / legacy-modes ……）按需 dynamic import：
 *     每个工具页只加载它实际用到的 1~2 个语言 chunk（每个 gzip 5~20KB）
 *   - 结果：单工具页从「~150KB gzip 单块」降到「~80KB 核心 + ~10KB 语言」≈ 90KB
 *
 * 启动体验：
 *   - 核心 + 语言并行加载；CodeMirror ready 之前先渲染原生 textarea 占位（同 v-model）
 *   - 用户立即可见、可输入；ready 后无缝替换为带行号/语法高亮的版本
 *
 * 用法：
 *   <CodeEditor v-model="code" lang="json" :rows="20" placeholder="…" />
 *   <CodeEditor :model-value="output" lang="go" readonly />
 */
import { ref, watch, onMounted, onBeforeUnmount, shallowRef, computed } from 'vue';
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

const themeCompartment = new Compartment();
const readonlyCompartment = new Compartment();
const langCompartment = new Compartment();

// 跟随站点主题（深/浅）
const isDark = ref(false);
function detectDark() {
  isDark.value = document.documentElement.classList.contains('dark');
}

/**
 * 语言扩展按需动态加载。每个 case 是独立的 dynamic import，
 * 触发 Vite/Rollup 把每种语言拆成单独的 chunk，按需下载、按需缓存。
 *
 * `text` 与未识别 lang 直接返回 []（无高亮），不发起任何请求。
 */
async function loadLangExtension(lang: string): Promise<Extension> {
  switch (lang) {
    case 'json': {
      const { json } = await import('@codemirror/lang-json');
      return json();
    }
    case 'yaml': {
      const { yaml } = await import('@codemirror/lang-yaml');
      return yaml();
    }
    case 'xml': {
      const { xml } = await import('@codemirror/lang-xml');
      return xml();
    }
    case 'html': {
      const { html } = await import('@codemirror/lang-html');
      return html();
    }
    case 'sql': {
      const { sql } = await import('@codemirror/lang-sql');
      return sql();
    }
    case 'go': {
      const { go } = await import('@codemirror/lang-go');
      return go();
    }
    case 'typescript': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ typescript: true });
    }
    case 'javascript': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript();
    }
    case 'toml': {
      const { toml } = await import('@codemirror/legacy-modes/mode/toml');
      return StreamLanguage.define(toml);
    }
    case 'proto': {
      const { protobuf } = await import('@codemirror/legacy-modes/mode/protobuf');
      return StreamLanguage.define(protobuf);
    }
    case 'shell': {
      const { shell } = await import('@codemirror/legacy-modes/mode/shell');
      return StreamLanguage.define(shell);
    }
    case 'properties': {
      const { properties } = await import('@codemirror/legacy-modes/mode/properties');
      return StreamLanguage.define(properties);
    }
    default:
      return [];
  }
}

// 自定义浅色主题，融合 wetools 主题色
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

function buildExtensions(initialLang: Extension): Extension[] {
  return [
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
    langCompartment.of(initialLang),
    themeCompartment.of(isDark.value ? oneDark : lightTheme),
    readonlyCompartment.of(EditorState.readOnly.of(props.readonly)),
    EditorView.updateListener.of((v) => {
      if (v.docChanged && !props.readonly) {
        const value = v.state.doc.toString();
        if (value !== props.modelValue) emit('update:modelValue', value);
      }
    }),
  ];
}

let darkObserver: MutationObserver | null = null;
// CodeMirror 实例就绪标记 —— ready 之前显示原生 textarea 占位，避免大 chunk 加载期间空白
const ready = ref(false);

onMounted(async () => {
  if (!wrapper.value) return;
  detectDark();

  // 核心立即建实例（无语言高亮），语言扩展并行加载，到了再 reconfigure。
  // 这样核心可用就 ready，不必等语言 chunk —— 体感最快。
  view.value = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: buildExtensions([]),
    }),
    parent: wrapper.value,
  });
  ready.value = true;

  // 并行加载语言扩展
  if (props.lang && props.lang !== 'text') {
    loadLangExtension(props.lang).then((ext) => {
      view.value?.dispatch({ effects: langCompartment.reconfigure(ext) });
    }).catch((err) => {
      // 语言加载失败不影响编辑器使用，仅打日志
      console.warn('[CodeEditor] 语言扩展加载失败：', props.lang, err);
    });
  }

  // 监听站点深/浅色切换
  darkObserver = new MutationObserver(() => {
    const next = document.documentElement.classList.contains('dark');
    if (next !== isDark.value) {
      isDark.value = next;
      view.value?.dispatch({
        effects: themeCompartment.reconfigure(next ? oneDark : lightTheme),
      });
    }
  });
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onBeforeUnmount(() => {
  darkObserver?.disconnect();
  view.value?.destroy();
});

// 外部 modelValue 变化时同步到编辑器（如切换 mode 后 output 重算）
watch(() => props.modelValue, (val) => {
  const v = view.value;
  if (!v) return;
  const current = v.state.doc.toString();
  if (val !== current) {
    v.dispatch({
      changes: { from: 0, to: current.length, insert: val ?? '' },
    });
  }
});

// readonly 切换
watch(() => props.readonly, (ro) => {
  view.value?.dispatch({
    effects: readonlyCompartment.reconfigure(EditorState.readOnly.of(ro)),
  });
});

// 语言切换（如 json-csv 在 j2c / c2j 间切换 lang）
watch(() => props.lang, async (lang) => {
  if (!view.value) return;
  const ext = await loadLangExtension(lang);
  view.value.dispatch({ effects: langCompartment.reconfigure(ext) });
});

// 用 min-height 控制行数（rows × 行高约 19px）
const minHeight = computed(() => `${props.rows * 19 + 16}px`);
</script>

<template>
  <div
    class="relative overflow-hidden rounded-md border bg-card focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30"
    :style="{ minHeight }"
  >
    <!-- CodeMirror 挂载点 -->
    <div ref="wrapper" class="h-full" />

    <!-- Fallback：CodeMirror chunk 加载/初始化期间显示的只读 textarea 占位。
         - absolute 铺满容器，不撑高布局（避免 minHeight 叠加）
         - readonly + pointer-events-none + tabindex=-1：纯展示，永远不会触发
           input 事件，杜绝与 CodeMirror 的双源写入冲突
         - 用 v-if，ready 后整个节点从 DOM 移除，确保不会与 CodeMirror 视觉叠加 -->
    <textarea
      v-if="!ready"
      :value="modelValue"
      :placeholder="placeholder"
      readonly
      tabindex="-1"
      class="pointer-events-none absolute inset-0 block h-full w-full resize-none rounded-md bg-card p-2 font-mono text-[13px] leading-[19px] text-foreground outline-none"
    />
  </div>
</template>

<style>
/* CodeMirror 默认 outline 与圆角不搭，强制去掉（focus 反馈用外层 ring） */
.cm-editor.cm-focused { outline: none !important; }
.cm-editor { height: 100%; }
.cm-scroller { overflow: auto; }
</style>
