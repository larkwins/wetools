import type { ToolMeta } from '@/lib/types';

/**
 * 工具模板：复制本目录为 src/tools/<your-id>/，然后修改本文件即可注册新工具。
 *
 * 约定：
 *  1) 目录名必须等于 meta.id，且为 kebab-case
 *  2) 同一目录下需存在 Tool.vue 作为 UI 入口
 *  3) icon 使用 lucide-vue-next 的 PascalCase 图标名
 *  4) i18n.zh / en 必填，其余可选
 *
 * 该模板不会被 registry 收集（registry 主动跳过 _template 目录）
 */
export const meta: ToolMeta = {
  id: '_template',
  category: 'common',
  icon: 'Sparkles',
  i18n: {
    zh: { title: '工具模板', description: '复制此目录即可新增一个工具。' },
    en: { title: 'Tool Template', description: 'Copy this folder to scaffold a new tool.' },
  },
  keywords: ['template', '模板'],
  privacy: 'local',
};
