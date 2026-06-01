<script setup lang="ts">
import { onMounted } from 'vue';
import { Link as LinkIcon, Check } from 'lucide-vue-next';
import { usePrefsStore } from '@/stores/prefs';
import { useCopy } from '@/composables/useCopy';
import { useI18n } from '@/composables/useI18n';
import FavoriteButton from '@/components/ui/FavoriteButton.vue';

const props = defineProps<{ toolId: string }>();

const prefs = usePrefsStore();
const { copied, copy } = useCopy();
const { dict } = useI18n();

async function copyLink() {
  await copy(window.location.href);
}

onMounted(() => {
  prefs.pushRecent(props.toolId);
});
</script>

<template>
  <div class="flex flex-none items-center gap-2">
    <FavoriteButton :tool-id="toolId" size="md" />
    <button
      type="button"
      :aria-label="copied ? dict.tool.copied : dict.tool.copyLink"
      :title="copied ? dict.tool.copied : dict.tool.copyLink"
      :class="[
        'inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-all active:scale-95',
        copied
          ? 'border-emerald-500/60 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5',
      ]"
      @click="copyLink"
    >
      <Transition
        enter-active-class="transition duration-150"
        enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-50"
        mode="out-in"
      >
        <Check v-if="copied" :size="16" :stroke-width="2.5" key="check" />
        <LinkIcon v-else :size="15" key="link" />
      </Transition>
    </button>
  </div>
</template>
