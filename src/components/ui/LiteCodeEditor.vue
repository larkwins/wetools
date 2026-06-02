<script setup lang="ts">
/**
 * LiteCodeEditor —— 极轻量代码编辑器（CodeMirror 替代）
 *
 * 设计：
 *   - 编辑层：原生 `<textarea>`，浏览器免费提供光标 / IME / 复制粘贴 / 撤销
 *   - 显示层：`<pre>` 渲染 Prism 高亮 HTML，绝对定位垫在 textarea 下方
 *   - 文字 transparent：用户看到的是 pre 的高亮文本，但插入符 / 选区由 textarea 提供
 *   - 行号：根据 modelValue 行数动态生成
 *
 * 体积：Prism 核心 ~2KB gz + 单语言 1-3KB gz；单工具页总 < 10KB
 */
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import Prism from 'prismjs';

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

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const preRef = ref<HTMLPreElement | null>(null);

/** 应用语言名 → Prism 语言名 */
const PRISM_LANG_MAP: Record<Lang, string> = {
  json: 'json',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  html: 'markup',
  sql: 'sql',
  go: 'go',
  typescript: 'typescript',
  javascript: 'javascript',
  proto: 'protobuf',
  shell: 'bash',
  properties: 'properties',
  text: 'text',
};

const langReady = ref(false);

async function loadPrismLang(prismLang: string): Promise<void> {
  if (prismLang === 'text' || prismLang === 'markup' || Prism.languages[prismLang]) return;
  try {
    switch (prismLang) {
      case 'json':       await import('prismjs/components/prism-json'); break;
      case 'yaml':       await import('prismjs/components/prism-yaml'); break;
      case 'toml':       await import('prismjs/components/prism-toml'); break;
      case 'sql':        await import('prismjs/components/prism-sql'); break;
      case 'go':         await import('prismjs/components/prism-go'); break;
      case 'typescript': await import('prismjs/components/prism-typescript'); break;
      case 'javascript': /* 内置 */ break;
      case 'protobuf':   await import('prismjs/components/prism-protobuf'); break;
      case 'bash':       await import('prismjs/components/prism-bash'); break;
      case 'properties': await import('prismjs/components/prism-properties'); break;
      case 'xml':        /* markup 内置 */ break;
    }
  } catch (e) {
    console.warn('[LiteCodeEditor] failed to load Prism lang:', prismLang, e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 高亮 HTML。末尾追加一个空格再加 \n，确保最后一行（即便是空行）
 * 在 <pre> 中有可见高度，与 textarea 对齐（textarea 末尾换行也会留出空行）
 */
const highlighted = computed(() => {
  void langReady.value;
  const code = props.modelValue ?? '';
  const prismLang = PRISM_LANG_MAP[props.lang];
  const grammar = Prism.languages[prismLang];
  const html = grammar && prismLang !== 'text'
    ? Prism.highlight(code, grammar, prismLang)
    : escapeHtml(code);
  // 末尾补一个空格 + \n：避免最后一行没高度 / 行号与内容错位
  return html + ' \n';
});

/**
 * 行号数。textarea 中 N 个 \n → N+1 行（最后一行可能是空）。
 * 跟 textarea 视觉行数一致。
 */
const lineCount = computed(() => {
  const v = props.modelValue ?? '';
  // 计算 \n 数量 + 1
  let n = 1;
  for (let i = 0; i < v.length; i++) if (v.charCodeAt(i) === 10) n++;
  return n;
});

const minHeight = computed(() => `${props.rows * 19 + 16}px`);

function syncScroll() {
  const ta = textareaRef.value;
  const pre = preRef.value;
  if (!ta || !pre) return;
  pre.scrollTop = ta.scrollTop;
  pre.scrollLeft = ta.scrollLeft;
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
}

function onKeydown(e: KeyboardEvent) {
  if (props.readonly) return;
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const ta = e.target as HTMLTextAreaElement;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const indent = '  ';
  const next = ta.value.slice(0, start) + indent + ta.value.slice(end);
  emit('update:modelValue', next);
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + indent.length;
  });
}

onMounted(async () => {
  await loadPrismLang(PRISM_LANG_MAP[props.lang]);
  langReady.value = true;
});

watch(() => props.lang, async (lang) => {
  langReady.value = false;
  await loadPrismLang(PRISM_LANG_MAP[lang]);
  langReady.value = true;
});
</script>

<template>
  <div
    class="lite-editor relative flex overflow-hidden rounded-md border bg-card focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30"
    :style="{ minHeight }"
  >
    <!-- Gutter：行号 -->
    <div
      class="lite-gutter flex-none select-none overflow-hidden bg-muted/40 py-2 pl-2 pr-3 text-right"
    >
      <div v-for="n in lineCount" :key="n" class="lite-gutter-row">{{ n }}</div>
    </div>

    <!-- 内容区：pre（高亮显示）+ textarea（透明文字接收输入），二者重叠 -->
    <div class="relative flex-1">
      <!-- 高亮渲染层 -->
      <pre
        ref="preRef"
        aria-hidden="true"
        data-no-i18n
        class="lite-display absolute inset-0 m-0 overflow-hidden p-2 text-foreground"
        v-html="highlighted"
      />

      <!-- 输入层：原生 textarea，文字 transparent -->
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        data-gramm="false"
        class="lite-input absolute inset-0 m-0 block h-full w-full resize-none overflow-auto p-2 caret-primary outline-none"
        @input="onInput"
        @scroll="syncScroll"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<style scoped>
/* Gutter 行号 */
.lite-gutter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 19px;
  color: hsl(var(--muted-foreground) / 0.6);
}
.lite-gutter-row { line-height: 19px; }

/*
 * pre 与 textarea 必须使用**完全相同**的字体 / 字号 / 行高 / padding / box-sizing /
 * tab-size / white-space，否则两者视觉位置错位（textarea 光标错位、pre 内容偏移）。
 */
.lite-display,
.lite-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 19px;
  white-space: pre;
  word-spacing: 0;
  letter-spacing: 0;
  tab-size: 2;
  -moz-tab-size: 2;
  border: 0;
  box-sizing: border-box;
}

.lite-input {
  background: transparent;
  color: transparent;
}
.lite-input::placeholder {
  color: hsl(var(--muted-foreground) / 0.7);
}
.lite-input::selection {
  background: hsl(var(--primary) / 0.25);
}
</style>

<style>
/* Prism 主题（浅色） */
.lite-editor .token.comment,
.lite-editor .token.prolog,
.lite-editor .token.doctype,
.lite-editor .token.cdata { color: hsl(var(--muted-foreground)); font-style: italic; }
.lite-editor .token.punctuation { color: hsl(var(--foreground) / 0.7); }
.lite-editor .token.property,
.lite-editor .token.tag,
.lite-editor .token.boolean,
.lite-editor .token.number,
.lite-editor .token.constant,
.lite-editor .token.symbol,
.lite-editor .token.deleted { color: #d73a49; }
.lite-editor .token.selector,
.lite-editor .token.attr-name,
.lite-editor .token.string,
.lite-editor .token.char,
.lite-editor .token.builtin,
.lite-editor .token.inserted { color: #22863a; }
.lite-editor .token.operator,
.lite-editor .token.entity,
.lite-editor .token.url { color: hsl(var(--foreground) / 0.85); }
.lite-editor .token.atrule,
.lite-editor .token.attr-value,
.lite-editor .token.keyword { color: #d73a49; font-weight: 500; }
.lite-editor .token.function,
.lite-editor .token.class-name { color: #6f42c1; }
.lite-editor .token.regex,
.lite-editor .token.important,
.lite-editor .token.variable { color: #e36209; }
/* Prism 子 token 必须保持 inline，避免任何换行 */
.lite-editor .token { display: inline; }

/* 暗色 */
.dark .lite-editor .token.property,
.dark .lite-editor .token.tag,
.dark .lite-editor .token.boolean,
.dark .lite-editor .token.number,
.dark .lite-editor .token.constant,
.dark .lite-editor .token.symbol,
.dark .lite-editor .token.deleted { color: #ff7b72; }
.dark .lite-editor .token.selector,
.dark .lite-editor .token.attr-name,
.dark .lite-editor .token.string,
.dark .lite-editor .token.char,
.dark .lite-editor .token.builtin,
.dark .lite-editor .token.inserted { color: #7ee787; }
.dark .lite-editor .token.atrule,
.dark .lite-editor .token.attr-value,
.dark .lite-editor .token.keyword { color: #ff7b72; }
.dark .lite-editor .token.function,
.dark .lite-editor .token.class-name { color: #d2a8ff; }
.dark .lite-editor .token.regex,
.dark .lite-editor .token.important,
.dark .lite-editor .token.variable { color: #ffa657; }
</style>
