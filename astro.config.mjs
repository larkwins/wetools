// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import AstroPWA from '@vite-pwa/astro';

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
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      devOptions: { enabled: false },
      manifest: {
        name: 'WeTools — 程序员的浏览器工具箱',
        short_name: 'WeTools',
        description: '40+ 个开发者常用在线工具，全部在浏览器本地运行。',
        theme_color: '#10B981',
        background_color: '#0A0A0A',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff,woff2}'],
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // 工具页面：先走网络，离线时回退到缓存
            urlPattern: ({ url }) => url.pathname.startsWith('/tools/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wetools-pages',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // 第三方公开 API（IP 查询）
            urlPattern: /^https:\/\/(ipapi\.co|ipwho\.is)\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wetools-external',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
