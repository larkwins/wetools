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
  },
  build: {
    inlineStylesheets: 'always',
  },
});
