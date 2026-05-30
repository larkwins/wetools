/**
 * Self-unregistering Service Worker
 * ------------------------------------
 * PWA 已下线（详见 commit aff7c03）。此 SW 用于清理用户浏览器里
 * 之前 @vite-pwa/astro 注册的旧 Service Worker 与 workbox 缓存。
 *
 * 行为：
 *   1. install 时立即激活（skipWaiting）
 *   2. activate 时清空所有缓存 + 自我注销 + 强制所有打开的 client 重新导航
 *
 * TODO: 2026-09 之后（足够大多数用户访问过一次完成清理），可以一并
 * 删除本文件以及 workbox-e4022e15.js 占位文件。
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        /* ignore cache-cleanup failures */
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        /* ignore unregister failures */
      }
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.navigate(c.url));
    })()
  );
});
