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
  // 工具合并/改名后的旧链接重定向，保持收藏夹与外链兼容
  redirects: {
    '/qr-generate': '/qr-code',
    '/qr-decode': '/qr-code',
  },
  integrations: [
    vue({ appEntrypoint: '/src/app.ts' }),
    tailwind({ applyBaseStyles: false }),
    AstroPWA({
      // dev 也启用，方便本地（127.0.0.1 / localhost）验证 PWA
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        // dev 模式下生成简化 SW（不预缓存所有资源，只做基本注册）
        navigateFallback: '/',
      },
      // 生成位置：根目录 /sw.js
      filename: 'sw.js',
      // 注册脚本由集成自动注入到 <head>，无需手写
      injectRegister: 'inline',
      manifest: {
        name: 'WeTools — 程序员的浏览器工具箱',
        short_name: 'WeTools',
        description:
          '40+ 程序员常用在线工具：JSON、Base64、加密哈希、二维码、时间戳、正则、图片压缩…… 全部本地运行，不上传任何数据。',
        theme_color: '#10b981',
        background_color: '#F2F8F5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'zh-CN',
        categories: ['productivity', 'developer', 'utilities'],
        icons: [
          // 用现有 SVG 作为 any + maskable 图标，浏览器会自适应渲染
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // 预缓存所有构建输出（HTML / JS / CSS / 静态资源），让首屏离线可用
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,json}'],
        // 单文件预缓存上限放宽到 5MB（OpenCC 字典等较大）
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // SPA fallback：所有导航请求未命中时回到首页
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-/],
        // 运行时缓存策略
        runtimeCaching: [
          {
            // OpenCC CDN 资源（如果有）
            urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wetools-cdn',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // 同源 GET 兜底
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin && request.method === 'GET',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wetools-runtime',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
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
        'crypto-js',
        'sql-formatter',
        'bcryptjs',
        'figlet',
        '@iarna/toml',
        'otpauth',
        'xml-formatter',
        'mathjs',
        // CodeMirror 核心（CodeEditor 静态依赖）—— 显式预构建，避免 dev 模式
        // 浏览器对 26 个 @codemirror/* 与 @lezer/* 子包并发请求导致 1~2s 延迟
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/theme-one-dark',
        // 各语言扩展（CodeEditor 动态 import，按需加载）—— 同样预构建，避免
        // 首次切换/打开工具时的 200~500ms 即时下载
        '@codemirror/lang-json',
        '@codemirror/lang-yaml',
        '@codemirror/lang-xml',
        '@codemirror/lang-html',
        '@codemirror/lang-sql',
        '@codemirror/lang-go',
        '@codemirror/lang-javascript',
        '@codemirror/legacy-modes/mode/toml',
        '@codemirror/legacy-modes/mode/protobuf',
        '@codemirror/legacy-modes/mode/shell',
        '@codemirror/legacy-modes/mode/properties',
      ],
    },
  },
  build: {
    inlineStylesheets: 'always',
  },
});
