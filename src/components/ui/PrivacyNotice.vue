<script setup lang="ts">
import { ShieldCheck, Globe2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    mode?: 'local' | 'external';
    /** 自定义说明文本，覆盖默认 */
    text?: string;
  }>(),
  { mode: 'local' }
);

const isExternal = props.mode === 'external';
const text =
  props.text ??
  (isExternal
    ? '本工具会调用第三方公开接口（如 ipapi.co），请求中仅包含查询所需信息，不会上传你的其他数据。'
    : '本工具的所有计算都在你的浏览器本地完成，不会上传任何数据到服务器。');
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3 rounded-lg border p-4 text-sm',
      isExternal
        ? 'border-warning/30 bg-warning/5 text-foreground'
        : 'border-primary/20 bg-primary/5 text-foreground',
    ]"
  >
    <component
      :is="isExternal ? Globe2 : ShieldCheck"
      :size="18"
      :class="['mt-0.5 flex-none', isExternal ? 'text-warning' : 'text-primary']"
    />
    <div class="flex-1">
      <p class="font-medium">
        {{ isExternal ? '调用外部 API' : '隐私保护' }}
      </p>
      <p class="mt-1 text-muted-foreground">{{ text }}</p>
    </div>
  </div>
</template>
