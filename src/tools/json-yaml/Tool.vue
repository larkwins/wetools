<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeftRight, AlertCircle } from 'lucide-vue-next';
import Textarea from '@/components/ui/Textarea.vue';
import Button from '@/components/ui/Button.vue';
import CopyButton from '@/components/ui/CopyButton.vue';
import yaml from 'js-yaml';

type Mode = 'j2y' | 'y2j';
const mode = ref<Mode>('j2y');
const indent = ref<2 | 4>(2);
const input = ref(`{
  "name": "WeTools",
  "tags": ["json", "yaml"],
  "config": { "private": true, "scope": ["dev"] }
}`);
const error = ref<string | null>(null);

const output = computed(() => {
  error.value = null;
  if (!input.value.trim()) return '';
  try {
    if (mode.value === 'j2y') {
      const obj = JSON.parse(input.value);
      return yaml.dump(obj, { indent: indent.value, lineWidth: 120 });
    } else {
      const obj = yaml.load(input.value);
      return JSON.stringify(obj, null, indent.value);
    }
  } catch (e) {
    error.value = (e as Error).message;
    return '';
  }
});

function swap() {
  mode.value = mode.value === 'j2y' ? 'y2j' : 'j2y';
  if (output.value) input.value = output.value;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-md border bg-card p-0.5">
        <button v-for="m in [{v:'j2y',l:'JSON → YAML'},{v:'y2j',l:'YAML → JSON'}]" :key="m.v" type="button"
          :class="['h-8 rounded-sm px-3 text-sm', mode === m.v ? 'bg-primary text-primary-foreground shadow-soft-sm' : 'text-muted-foreground hover:text-foreground']"
          @click="mode = m.v as Mode"
        >{{ m.l }}</button>
      </div>
      <div class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>缩进</span>
        <div class="inline-flex rounded-md border bg-card p-0.5">
          <button v-for="n in [2,4]" :key="n" type="button"
            :class="['h-7 rounded-sm px-2 font-mono text-xs', indent === n ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            @click="indent = n as 2 | 4"
          >{{ n }}</button>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="swap"><ArrowLeftRight :size="14" />交换</Button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ mode === 'j2y' ? 'JSON' : 'YAML' }} 输入</label>
          <CopyButton :text="input" icon-only />
        </div>
        <Textarea v-model="input" mono :rows="20" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ mode === 'j2y' ? 'YAML' : 'JSON' }} 输出</label>
          <CopyButton :text="output" icon-only />
        </div>
        <Textarea :model-value="output" mono :rows="20" readonly />
        <p v-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle :size="12" />{{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
