<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/CodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const root = ref('root');
const indent = ref(2);
const jsonText = ref(JSON.stringify({
  user: { id: 1, name: 'Alice', emails: ['a@a.com', 'b@b.com'] },
  active: true,
}, null, 2));
const xmlText = ref('');
const error = ref('');

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isValidName(n: string): boolean {
  return /^[A-Za-z_][\w.-]*$/.test(n);
}

function toXml(obj: unknown, tag: string, depth: number, ind: number): string {
  const pad = ' '.repeat(depth * ind);
  if (obj === null || obj === undefined) return `${pad}<${tag} />`;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `${pad}<${tag}>${escapeXml(String(obj))}</${tag}>`;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}<${tag} />`;
    // 每个元素用 <tag>item</tag>，外层包一层数组容器
    return obj.map((it) => toXml(it, tag, depth, ind)).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${pad}<${tag} />`;
    const inner = entries
      .map(([k, v]) => {
        const safeKey = isValidName(k) ? k : `_${k.replace(/[^A-Za-z0-9_]/g, '_')}`;
        return toXml(v, safeKey, depth + 1, ind);
      })
      .join('\n');
    return `${pad}<${tag}>\n${inner}\n${pad}</${tag}>`;
  }
  return `${pad}<${tag}>${escapeXml(String(obj))}</${tag}>`;
}

function jsonToXml() {
  error.value = '';
  try {
    const parsed = JSON.parse(jsonText.value);
    const ind = Math.max(0, Math.min(8, Number(indent.value) || 2));
    const body = toXml(parsed, root.value || 'root', 0, ind);
    xmlText.value = `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
  } catch (e) {
    error.value = 'JSON 解析失败：' + ((e as Error).message || String(e));
  }
}

// XML → JSON：把同名子元素合并为数组，叶子作字符串
function elementToObject(el: Element): unknown {
  const children = Array.from(el.children);
  if (children.length === 0) {
    return el.textContent ?? '';
  }
  const grouped: Record<string, unknown[]> = {};
  for (const c of children) {
    const v = elementToObject(c);
    if (!grouped[c.tagName]) grouped[c.tagName] = [];
    grouped[c.tagName].push(v);
  }
  const obj: Record<string, unknown> = {};
  for (const k in grouped) {
    obj[k] = grouped[k].length === 1 ? grouped[k][0] : grouped[k];
  }
  return obj;
}

function xmlToJson() {
  error.value = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText.value, 'application/xml');
    const errNode = doc.querySelector('parsererror');
    if (errNode) throw new Error(errNode.textContent ?? 'XML 解析失败');
    const rootEl = doc.documentElement;
    if (!rootEl) throw new Error('XML 没有根元素');
    const ind = Math.max(0, Math.min(8, Number(indent.value) || 2));
    const result = { [rootEl.tagName]: elementToObject(rootEl) };
    jsonText.value = JSON.stringify(result, null, ind);
  } catch (e) {
    error.value = 'XML 解析失败：' + ((e as Error).message || String(e));
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">根元素名（JSON → XML）</label>
        <Input v-model="root" placeholder="root" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">缩进</label>
        <Input v-model.number="indent" type="number" class="w-20" />
      </div>
      <div class="flex items-end gap-2">
        <Button variant="primary" @click="jsonToXml"><ArrowRight :size="14" />JSON → XML</Button>
        <Button variant="outline" @click="xmlToJson"><ArrowLeft :size="14" />XML → JSON</Button>
      </div>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">JSON</label>
          <CopyButton :text="jsonText" icon-only />
        </div>
        <CodeEditor v-model="jsonText" lang="json" :rows="18" placeholder="粘贴 JSON…" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">XML</label>
          <CopyButton :text="xmlText" icon-only />
        </div>
        <CodeEditor v-model="xmlText" lang="xml" :rows="18" placeholder="粘贴 XML…" />
      </div>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>
  </div>
</template>
