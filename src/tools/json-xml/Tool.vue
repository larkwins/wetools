<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeftRight, AlertCircle } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CodeEditor from '@/components/ui/LiteCodeEditor.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

type Mode = 'j2x' | 'x2j';
const mode = ref<Mode>('j2x');
const root = ref('root');
const indent = ref<2 | 4>(2);

const input = ref(JSON.stringify({
  user: { id: 1, name: 'Alice', emails: ['a@a.com', 'b@b.com'] },
  active: true,
}, null, 2));

const error = ref<string | null>(null);

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

function elementToObject(el: Element): unknown {
  const children = Array.from(el.children);
  if (children.length === 0) return el.textContent ?? '';
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

const output = computed(() => {
  error.value = null;
  if (!input.value.trim()) return '';
  try {
    if (mode.value === 'j2x') {
      const parsed = JSON.parse(input.value);
      const body = toXml(parsed, root.value || 'root', 0, indent.value);
      return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
    } else {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input.value, 'application/xml');
      const errNode = doc.querySelector('parsererror');
      if (errNode) throw new Error(errNode.textContent ?? 'XML 解析失败');
      const rootEl = doc.documentElement;
      if (!rootEl) throw new Error('XML 没有根元素');
      const result = { [rootEl.tagName]: elementToObject(rootEl) };
      return JSON.stringify(result, null, indent.value);
    }
  } catch (e) {
    error.value = (e as Error).message;
    return '';
  }
});

function swap() {
  mode.value = mode.value === 'j2x' ? 'x2j' : 'j2x';
  if (output.value) input.value = output.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button
          v-for="m in [{ v: 'j2x', l: 'JSON → XML' }, { v: 'x2j', l: 'XML → JSON' }]"
          :key="m.v"
          type="button"
          :class="['h-8 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div v-if="mode === 'j2x'" class="inline-flex items-center gap-1.5">
          <span>根元素</span>
          <Input v-model="root" placeholder="root" class="h-8 w-32" />
        </div>
        <div class="inline-flex items-center gap-1.5">
          <span>缩进</span>
          <div class="inline-flex rounded-md border bg-card p-0.5">
            <button
              v-for="n in [2, 4]"
              :key="n"
              type="button"
              :class="['h-7 rounded-sm px-2 font-mono text-xs', indent === n ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
              @click="indent = n as 2 | 4"
            >{{ n }}</button>
          </div>
        </div>
        <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">
            {{ mode === 'j2x' ? 'JSON' : 'XML' }} 输入
          </label>
          <CopyButton :text="input" icon-only />
        </div>
        <CodeEditor
          v-model="input"
          :lang="mode === 'j2x' ? 'json' : 'xml'"
          :rows="20"
          :placeholder="mode === 'j2x' ? '粘贴 JSON…' : '粘贴 XML…'"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="tool-section-title">
            {{ mode === 'j2x' ? 'XML' : 'JSON' }} 输出
          </label>
          <CopyButton :text="output" icon-only />
        </div>
        <CodeEditor
          :model-value="output"
          :lang="mode === 'j2x' ? 'xml' : 'json'"
          :rows="20"
          readonly
        />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
