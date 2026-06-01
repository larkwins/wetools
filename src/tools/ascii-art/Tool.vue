<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import figlet from 'figlet';
import Textarea from '@/components/ui/Textarea.vue';
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

// figlet 字体 CDN。备用：jsdelivr 失败时回退 unpkg。
// 注意：必须 pin 一个明确版本号，避免请求 latest 重定向时 CORS 异常。
const FONT_CDN_PRIMARY = 'https://cdn.jsdelivr.net/npm/figlet@1.11.0/fonts';
const FONT_CDN_FALLBACK = 'https://unpkg.com/figlet@1.11.0/fonts';

// 缓存已加载字体（parseFont 已注册到 figlet 内部，这里仅做幂等标记）
const loadedFonts = new Set<string>();

async function fetchFont(name: string): Promise<string> {
  const path = `/${encodeURIComponent(name)}.flf`;
  // 先试主 CDN
  try {
    const res = await fetch(FONT_CDN_PRIMARY + path);
    if (res.ok) return await res.text();
  } catch {/* fallthrough */}
  // 回退备用 CDN
  const res2 = await fetch(FONT_CDN_FALLBACK + path);
  if (!res2.ok) throw new Error(`字体加载失败 (HTTP ${res2.status})：${name}`);
  return await res2.text();
}

async function ensureFont(name: string): Promise<void> {
  if (loadedFonts.has(name)) return;
  const data = await fetchFont(name);
  // figlet.parseFont 是公开 API（v1.11+），把 .flf 文本注册到内部字体表
  (figlet as unknown as { parseFont: (n: string, d: string) => unknown }).parseFont(name, data);
  loadedFonts.add(name);
}

async function render() {
  const t = text.value;
  if (!t) { result.value = ''; error.value = ''; return; }
  busy.value = true;
  error.value = '';
  try {
    await ensureFont(font.value);
    // textSync 在字体已注册后可同步渲染。
    // figlet 单次调用对换行符的处理是"折行"而不是"分别渲染"，
    // 因此手动按 \n 拆分输入逐行渲染、再用空行分隔拼回，效果和多行书写一致。
    const textSync = (figlet as unknown as {
      textSync: (txt: string, opts: { font: string }) => string;
    }).textSync;
    const lines = t.split(/\r?\n/);
    const rendered = lines.map((line) => textSync(line || ' ', { font: font.value }));
    result.value = rendered.join('\n');
  } catch (e) {
    const msg = (e as Error)?.message || String(e);
    error.value = msg;
    result.value = '';
    // 帮助排查：把详细错误打到 console，方便用户截图反馈
    // eslint-disable-next-line no-console
    console.error('[ascii-art] render failed:', e);
  } finally {
    busy.value = false;
  }
}

onMounted(render);
watch([text, font], render);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">文本（支持多行）</label>
        <Textarea v-model="text" placeholder="输入英文字符…（Enter 换行，每行独立渲染）" :rows="3" class="font-mono" />
      </div>
      <div class="flex flex-col gap-1 sm:w-44">
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
