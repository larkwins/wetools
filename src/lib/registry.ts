import type { ToolCategory, ToolMeta } from './types';
import { categories } from './categories';

/**
 * 工具插件化 Registry
 *
 * 每个工具的 `src/tools/<id>/index.ts` 必须导出名为 `meta` 的 ToolMeta 对象。
 * 这里通过 Vite 的 `import.meta.glob({ eager: true })` 在构建期同步收集，
 * 让首页 / Sidebar / 命令面板 / 动态路由 都能以同一份数据源驱动。
 *
 * 增加一个工具的步骤：
 *   1. 复制 src/tools/_template 为 src/tools/<your-id>/
 *   2. 修改 index.ts 中的 meta（id 必须与目录同名）
 *   3. 在 Tool.vue 中实现具体工具
 *   不需要修改任何中心文件。
 */

// 使用通配排除 _template，下划线开头视为模板目录
const modules = import.meta.glob<{ meta: ToolMeta }>('/src/tools/*/index.ts', {
  eager: true,
});

function loadTools(): ToolMeta[] {
  const list: ToolMeta[] = [];
  const seen = new Set<string>();
  for (const [path, mod] of Object.entries(modules)) {
    // 跳过 _template
    if (path.includes('/_template/')) continue;
    const meta = mod.meta;
    if (!meta || typeof meta !== 'object') {
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.warn(`[registry] ${path} 缺少 meta export`);
      continue;
    }
    if (seen.has(meta.id)) {
      throw new Error(`[registry] 工具 id 冲突：${meta.id}（${path}）`);
    }
    // 校验目录名与 id 一致
    const expected = path.replace(/^\/src\/tools\/([^/]+)\/index\.ts$/, '$1');
    if (expected && expected !== meta.id) {
      throw new Error(
        `[registry] 工具目录与 id 不一致：目录 "${expected}" vs meta.id "${meta.id}"`
      );
    }
    seen.add(meta.id);
    list.push(meta);
  }
  return list;
}

export const allTools: ToolMeta[] = loadTools();

export function toolById(id: string): ToolMeta | undefined {
  return allTools.find((t) => t.id === id);
}

export function toolsByCategory(category: ToolCategory): ToolMeta[] {
  return allTools.filter((t) => t.category === category);
}

/** 按分类聚合并排序，用于首页 / Sidebar 渲染
 *
 * 注意：空分类（tools.length === 0）也会保留并渲染 ——
 * 用于让"检测"等正在筹备的分类先以"开发中"占位的方式出现，
 * 让用户知道未来会有什么。具体空状态 UI 由调用方自行处理。
 */
export function groupedByCategory(): Array<{
  category: (typeof categories)[number];
  tools: ToolMeta[];
}> {
  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      category,
      tools: toolsByCategory(category.id).sort((a, b) =>
        a.id.localeCompare(b.id)
      ),
    }));
}

/**
 * 基于 keywords 的语义相似度得分：
 * 两个工具的 keywords 中任意一个相同词即计 1 分，
 * 命中词越多分越高。keywords 应为名词/实词，由各工具 index.ts 维护。
 */
function similarityScore(a: ToolMeta, b: ToolMeta): number {
  const kwA = new Set((a.keywords ?? []).map((k) => k.toLowerCase()));
  const kwB = new Set((b.keywords ?? []).map((k) => k.toLowerCase()));
  let score = 0;
  for (const kw of kwA) {
    if (kwB.has(kw)) score += 1;
  }
  return score;
}

/** 基于 keywords 语义相似度推荐相关工具（用于工具页底部"相关推荐"） */
export function relatedTools(meta: ToolMeta, limit = 4): ToolMeta[] {
  const candidates = allTools.filter((t) => t.id !== meta.id);
  return candidates
    .map((t) => ({ tool: t, score: similarityScore(meta, t) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5)
    .slice(0, limit)
    .map(({ tool }) => tool);
}
