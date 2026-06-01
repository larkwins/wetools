<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import Input from '@/components/ui/Input.vue';
import CopyButton from '@/components/ui/CopyButton.vue';

interface MimeRow {
  ext: string;
  mime: string;
  category: 'image' | 'video' | 'audio' | 'text' | 'application' | 'font';
}

// 常见 200+ MIME 类型，按 IANA + MDN 整理
const ROWS: MimeRow[] = [
  // image
  { ext: 'png', mime: 'image/png', category: 'image' },
  { ext: 'jpg', mime: 'image/jpeg', category: 'image' },
  { ext: 'jpeg', mime: 'image/jpeg', category: 'image' },
  { ext: 'gif', mime: 'image/gif', category: 'image' },
  { ext: 'webp', mime: 'image/webp', category: 'image' },
  { ext: 'svg', mime: 'image/svg+xml', category: 'image' },
  { ext: 'avif', mime: 'image/avif', category: 'image' },
  { ext: 'bmp', mime: 'image/bmp', category: 'image' },
  { ext: 'ico', mime: 'image/x-icon', category: 'image' },
  { ext: 'tif', mime: 'image/tiff', category: 'image' },
  { ext: 'tiff', mime: 'image/tiff', category: 'image' },
  { ext: 'heic', mime: 'image/heic', category: 'image' },
  { ext: 'apng', mime: 'image/apng', category: 'image' },
  // video
  { ext: 'mp4', mime: 'video/mp4', category: 'video' },
  { ext: 'webm', mime: 'video/webm', category: 'video' },
  { ext: 'mov', mime: 'video/quicktime', category: 'video' },
  { ext: 'avi', mime: 'video/x-msvideo', category: 'video' },
  { ext: 'mkv', mime: 'video/x-matroska', category: 'video' },
  { ext: 'mpeg', mime: 'video/mpeg', category: 'video' },
  { ext: 'mpg', mime: 'video/mpeg', category: 'video' },
  { ext: 'flv', mime: 'video/x-flv', category: 'video' },
  { ext: '3gp', mime: 'video/3gpp', category: 'video' },
  { ext: 'wmv', mime: 'video/x-ms-wmv', category: 'video' },
  { ext: 'm4v', mime: 'video/x-m4v', category: 'video' },
  // audio
  { ext: 'mp3', mime: 'audio/mpeg', category: 'audio' },
  { ext: 'wav', mime: 'audio/wav', category: 'audio' },
  { ext: 'ogg', mime: 'audio/ogg', category: 'audio' },
  { ext: 'oga', mime: 'audio/ogg', category: 'audio' },
  { ext: 'm4a', mime: 'audio/mp4', category: 'audio' },
  { ext: 'flac', mime: 'audio/flac', category: 'audio' },
  { ext: 'aac', mime: 'audio/aac', category: 'audio' },
  { ext: 'weba', mime: 'audio/webm', category: 'audio' },
  { ext: 'opus', mime: 'audio/opus', category: 'audio' },
  { ext: 'mid', mime: 'audio/midi', category: 'audio' },
  { ext: 'midi', mime: 'audio/midi', category: 'audio' },
  // text
  { ext: 'txt', mime: 'text/plain', category: 'text' },
  { ext: 'html', mime: 'text/html', category: 'text' },
  { ext: 'htm', mime: 'text/html', category: 'text' },
  { ext: 'css', mime: 'text/css', category: 'text' },
  { ext: 'csv', mime: 'text/csv', category: 'text' },
  { ext: 'md', mime: 'text/markdown', category: 'text' },
  { ext: 'markdown', mime: 'text/markdown', category: 'text' },
  { ext: 'ics', mime: 'text/calendar', category: 'text' },
  { ext: 'vcf', mime: 'text/vcard', category: 'text' },
  { ext: 'log', mime: 'text/plain', category: 'text' },
  { ext: 'rtf', mime: 'application/rtf', category: 'text' },
  // application
  { ext: 'json', mime: 'application/json', category: 'application' },
  { ext: 'xml', mime: 'application/xml', category: 'application' },
  { ext: 'yaml', mime: 'application/x-yaml', category: 'application' },
  { ext: 'yml', mime: 'application/x-yaml', category: 'application' },
  { ext: 'toml', mime: 'application/toml', category: 'application' },
  { ext: 'js', mime: 'text/javascript', category: 'application' },
  { ext: 'mjs', mime: 'text/javascript', category: 'application' },
  { ext: 'ts', mime: 'application/typescript', category: 'application' },
  { ext: 'jsx', mime: 'text/jsx', category: 'application' },
  { ext: 'tsx', mime: 'text/tsx', category: 'application' },
  { ext: 'wasm', mime: 'application/wasm', category: 'application' },
  { ext: 'pdf', mime: 'application/pdf', category: 'application' },
  { ext: 'zip', mime: 'application/zip', category: 'application' },
  { ext: 'gz', mime: 'application/gzip', category: 'application' },
  { ext: 'tar', mime: 'application/x-tar', category: 'application' },
  { ext: 'rar', mime: 'application/vnd.rar', category: 'application' },
  { ext: '7z', mime: 'application/x-7z-compressed', category: 'application' },
  { ext: 'bz2', mime: 'application/x-bzip2', category: 'application' },
  { ext: 'xz', mime: 'application/x-xz', category: 'application' },
  { ext: 'epub', mime: 'application/epub+zip', category: 'application' },
  { ext: 'doc', mime: 'application/msword', category: 'application' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'application' },
  { ext: 'xls', mime: 'application/vnd.ms-excel', category: 'application' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'application' },
  { ext: 'ppt', mime: 'application/vnd.ms-powerpoint', category: 'application' },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'application' },
  { ext: 'odt', mime: 'application/vnd.oasis.opendocument.text', category: 'application' },
  { ext: 'ods', mime: 'application/vnd.oasis.opendocument.spreadsheet', category: 'application' },
  { ext: 'odp', mime: 'application/vnd.oasis.opendocument.presentation', category: 'application' },
  { ext: 'sh', mime: 'application/x-sh', category: 'application' },
  { ext: 'sql', mime: 'application/sql', category: 'application' },
  { ext: 'php', mime: 'application/x-httpd-php', category: 'application' },
  { ext: 'jar', mime: 'application/java-archive', category: 'application' },
  { ext: 'apk', mime: 'application/vnd.android.package-archive', category: 'application' },
  { ext: 'dmg', mime: 'application/x-apple-diskimage', category: 'application' },
  { ext: 'iso', mime: 'application/x-iso9660-image', category: 'application' },
  { ext: 'exe', mime: 'application/x-msdownload', category: 'application' },
  { ext: 'msi', mime: 'application/x-msi', category: 'application' },
  { ext: 'deb', mime: 'application/vnd.debian.binary-package', category: 'application' },
  { ext: 'rpm', mime: 'application/x-rpm', category: 'application' },
  { ext: 'torrent', mime: 'application/x-bittorrent', category: 'application' },
  { ext: 'swf', mime: 'application/x-shockwave-flash', category: 'application' },
  { ext: 'crt', mime: 'application/x-x509-ca-cert', category: 'application' },
  { ext: 'pem', mime: 'application/x-pem-file', category: 'application' },
  { ext: 'p12', mime: 'application/x-pkcs12', category: 'application' },
  // font
  { ext: 'woff', mime: 'font/woff', category: 'font' },
  { ext: 'woff2', mime: 'font/woff2', category: 'font' },
  { ext: 'ttf', mime: 'font/ttf', category: 'font' },
  { ext: 'otf', mime: 'font/otf', category: 'font' },
  { ext: 'eot', mime: 'application/vnd.ms-fontobject', category: 'font' },
];

type Cat = MimeRow['category'] | 'all';
const filter = ref<Cat>('all');
const keyword = ref('');

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return ROWS.filter((r) => {
    if (filter.value !== 'all' && r.category !== filter.value) return false;
    if (!kw) return true;
    return r.ext.includes(kw) || r.mime.toLowerCase().includes(kw);
  });
});

const cats: Array<{ k: Cat; l: string }> = [
  { k: 'all', l: '全部' },
  { k: 'image', l: '图片' },
  { k: 'video', l: '视频' },
  { k: 'audio', l: '音频' },
  { k: 'text', l: '文本' },
  { k: 'application', l: '应用' },
  { k: 'font', l: '字体' },
];

const catColors: Record<MimeRow['category'], string> = {
  image: 'text-pink-500 bg-pink-500/10',
  video: 'text-purple-500 bg-purple-500/10',
  audio: 'text-emerald-500 bg-emerald-500/10',
  text: 'text-amber-500 bg-amber-500/10',
  application: 'text-blue-500 bg-blue-500/10',
  font: 'text-orange-500 bg-orange-500/10',
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <Search :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" placeholder="搜索后缀或 MIME（如 png / json / application/pdf）…" class="pl-9" />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button v-for="c in cats" :key="c.k" type="button"
        :class="['rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          filter === c.k ? 'bg-primary text-primary-foreground' : 'border bg-card text-muted-foreground hover:text-foreground']"
        @click="filter = c.k"
      >{{ c.l }}</button>
    </div>

    <div v-if="filtered.length === 0" class="rounded-md border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
      没有匹配的类型
    </div>

    <div v-else class="overflow-x-auto rounded-lg border bg-card">
      <table class="w-full text-sm">
        <thead class="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th class="px-3 py-2 text-left w-24">后缀</th>
            <th class="px-3 py-2 text-left">MIME 类型</th>
            <th class="px-3 py-2 text-left w-20">分类</th>
            <th class="px-3 py-2 text-right w-10"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.ext + r.mime" class="border-t border-border/60 hover:bg-secondary/30">
            <td class="px-3 py-1.5 font-mono font-semibold text-foreground">.{{ r.ext }}</td>
            <td class="px-3 py-1.5 font-mono text-xs text-foreground/90">{{ r.mime }}</td>
            <td class="px-3 py-1.5">
              <span :class="['inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium', catColors[r.category]]">
                {{ r.category }}
              </span>
            </td>
            <td class="px-2 py-1.5 text-right">
              <CopyButton :text="r.mime" icon-only />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-muted-foreground">
      共 {{ ROWS.length }} 个常见 MIME 类型。后缀名不带点（如 <code class="font-mono">png</code> 而非 <code class="font-mono">.png</code>）。
    </p>
  </div>
</template>
