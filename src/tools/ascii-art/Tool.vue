<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import figlet from 'figlet';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

const text = ref('WeTools');
const font = ref<string>('Standard');
const result = ref('');
const error = ref('');
const busy = ref(false);

// 仅引入几个常用字体，避免引入全部 figlet 字体（~5MB）
const FONTS = [
  'Standard', 'Big', 'Slant', 'Small', 'Mini', 'Banner', 'Block',
  'Bubble', 'Digital', 'Doom', 'Ghost', 'Graffiti', 'Shadow',
  'Speed', 'Star Wars', '3-D', '3D-ASCII', 'ANSI Shadow',
] as const;

const loadedFonts = new Set<string>();

async function loadFont(name: string): Promise<void> {
  if (loadedFonts.has(name)) return;
  // figlet 浏览器版默认 fontPath 是 'fonts/'，需配置或预加载
  // 简单方案：从 jsdelivr 加载
  const url = `https://cdn.jsdelivr.net/npm/figlet@1.7.0/fonts/${encodeURIComponent(name)}.flf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`字体加载失败：${name}`);
  const data = await res.text();
  // @ts-expect-error figlet 浏览器 API
  figlet.parseFont(name, data);
  loadedFonts.add(name);
}

function render() {
  if (!text.value) { result.value = ''; return; }
  busy.value = true;
  error.value = '';
  loadFont(font.value)
    .then(() => {
      figlet.text(text.value, { font: font.value as figlet.Fonts }, (err, data) => {
        if (err) {
          error.value = err.message || String(err);
          result.value = '';
        } else {
          result.value = data ?? '';
        }
        busy.value = false;
      });
    })
    .catch((e) => {
      error.value = (e as Error).message || String(e);
      busy.value = false;
    });
}

onMounted(render);
watch([text, font], render);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">文本</label>
        <Input v-model="text" placeholder="输入英文字符…" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">字体</label>
        <select v-model="font" class="h-9 rounded-md border bg-background px-3 text-sm">
          <option v-for="f in FONTS" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          字符画 {{ busy ? '· 渲染中…' : '' }}
        </label>
        <CopyButton :text="result" icon-only />
      </div>
      <pre class="overflow-auto rounded-lg border bg-card p-4 font-mono text-[11px] leading-tight"><code>{{ result || '请输入文本' }}</code></pre>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />{{ error }}
    </p>

    <p class="text-xs text-muted-foreground">
      基于 figlet。字体按需从 CDN 加载，首次使用某字体需联网（之后会缓存）。仅支持英文字符。
    </p>
  </div>
</template>
