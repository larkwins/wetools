// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://wetools.cc',
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    vue({ appEntrypoint: '/src/app.ts' }),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    // 工具组件通过 import.meta.glob 懒加载，Vite 的依赖扫描可能漏掉这些工具内的
    // 第三方依赖，导致 dev 下出现 "Failed to fetch dynamically imported module"。
    // 这里把所有工具内使用的 npm 依赖显式加入 optimizeDeps.include，确保预构建。
    optimizeDeps: {
      include: [
        'js-md5',
        'js-yaml',
        'json-to-ts',
        'cron-parser',
        'cronstrue',
        'qrcode',
        'jsqr',
        'diff',
        'dompurify',
        'marked',
        'ua-parser-js',
        'browser-image-compression',
        'fuse.js',
        'opencc-js',
      ],
    },
  },
  build: {
    inlineStylesheets: 'always',
  },
});
