// Vue 应用入口（被 @astrojs/vue 的 appEntrypoint 调用）
// 用于注入全局插件，如 Pinia、vue-i18n 等
import type { App } from 'vue';
import { createPinia } from 'pinia';

export default (app: App) => {
  app.use(createPinia());
};
