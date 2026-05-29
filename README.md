# WeTools

> 程序员的浏览器工具箱 — 37+ 个本地运行的开发者工具，开源、免费、无追踪。

## 特性

- ⚡️ **零数据上传**：所有工具在浏览器本地完成（IP 查询例外，已显式标注）
- 🧩 **插件化架构**：新增一个工具 = 新建一个目录，零中心文件改动
- 🔍 **⌘K 命令面板**：Fuse.js 模糊搜索，键盘全程可达
- ⭐ **收藏 / 最近使用**：localStorage 持久化，跨标签同步
- 🌗 **明暗双主题**：默认跟随系统，可手动覆盖
- 📦 **PWA 离线**：app shell 预缓存 + 工具页运行时缓存
- 🌐 **中英双语 meta**：所有工具元信息自带 zh/en 文案
- 🎨 **统一图标**：lucide-vue-next，禁用 emoji 当 UI 图标

## 工具清单（按分类）

| 分类 | 工具 |
| --- | --- |
| 编码 | Base64 / URL / HTML 实体 / Hex 字符串 / Unicode 转义 |
| JSON 与数据 | JSON 格式化校验 / JSON↔YAML / JSON↔CSV / JSON→TypeScript |
| 加密哈希 | Hash (MD5/SHA-1/256/384/512) / AES-GCM/CBC / JWT 解析 |
| 时间日期 | Unix 时间戳 / Cron 解析 / 时区换算 |
| 生成器 | UUID & NanoID / 随机密码 / 随机数 / Lorem Ipsum / Mock 假数据 |
| 图像 | 二维码生成 / 二维码识别 / 图片压缩 / 图片↔Base64 |
| 文本 | 文本 Diff / Markdown 预览 / 大小写转换 / 文本工具集 / 正则测试器 |
| 网络 | IP 查询 / UA 解析 / cURL→代码 / URL 解析 |
| 开发速查 | 颜色转换 / CSS 单位 / 进制转换 / Tailwind 速查 |

## 技术栈

- **Astro 4** SSG + 岛屿架构（首页几乎零 JS）
- **Vue 3** + `<script setup lang="ts">`（仅在交互岛屿水合）
- **Tailwind CSS 3** + CSS 变量明暗双主题
- **Pinia + @vueuse/core** 收藏 / 最近 / 偏好持久化
- **Fuse.js** 命令面板模糊搜索
- **Lucide Icons** 统一图标系统
- **@vite-pwa/astro** PWA & Workbox 离线策略

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
npm run preview
npm run test     # vitest
```

## 添加一个新工具

每个工具是 `src/tools/<id>/` 下的自包含目录：

```
src/tools/my-tool/
├── index.ts     # 导出 ToolMeta（id / category / icon / i18n）
└── Tool.vue     # 工具 UI
```

模板：复制 `src/tools/_template/` 即可。

`ToolMeta` 契约：

```ts
import type { ToolMeta } from '@/lib/types';

export const meta: ToolMeta = {
  id: 'my-tool',                  // kebab-case，与目录名一致
  category: 'dev',                 // 9 大分类之一
  icon: 'Sparkles',                // lucide-vue-next 图标名（PascalCase）
  i18n: {
    zh: { title: '我的工具', description: '一句话描述' },
    en: { title: 'My Tool', description: 'A short description' },
  },
  keywords: ['关键词'],
  tags: ['new'],                   // 'new' | 'hot' | 'beta'
  privacy: 'local',                // 默认 'local'；'external' 表示调用外部 API
};
```

> 工具 UI 通过 `defineProps<{ meta: ToolMeta }>()` 接收元信息。
>
> 新增工具用到的 lucide 图标如果未在 `src/lib/icons.ts` 中注册，请补充一行映射，以便 tree-shake 友好。

完成后无需改动任何中心文件，registry 通过 `import.meta.glob` 自动收集，首页卡片、Sidebar、⌘K 命令面板、SEO、sitemap 全部自动生效。

## 目录结构

```
src/
├── lib/
│   ├── registry.ts        # 工具自动注册（核心）
│   ├── categories.ts      # 9 大分类元信息
│   ├── icons.ts           # 集中式图标注册表（tree-shake 友好）
│   ├── types.ts           # ToolMeta / CategoryMeta 契约
│   └── i18n.ts            # 站点级双语字典
├── layouts/
│   ├── BaseLayout.astro   # HTML 骨架 + 主题防闪烁脚本 + CommandPalette 挂载
│   └── ToolLayout.astro   # 工具页壳：左 Sidebar + 右内容 + 相关工具
├── components/
│   ├── ui/                # Button / Input / Textarea / CopyButton / PrivacyNotice / Empty
│   └── layout/            # SiteHeader / SiteFooter / Sidebar / ToolHeader / ToolMount
│                          # ThemeToggle / LangSwitch / SearchTrigger / CommandPalette
├── stores/
│   └── prefs.ts           # Pinia: 收藏 + 最近使用，VueUse useStorage 持久化
├── composables/
│   └── useCopy.ts         # 一键复制 + 复位反馈
├── pages/
│   ├── index.astro        # 首页：分类网格
│   ├── about.astro        # 关于 / 隐私
│   ├── 404.astro
│   ├── sitemap.xml.ts     # 自动生成 sitemap
│   └── tools/[tool].astro # 动态路由（getStaticPaths from registry）
└── tools/                 # 插件化工具目录
    ├── _template/         # 模板，registry 自动跳过
    ├── base64/
    ├── json-format/
    ├── hash/
    └── …                  # 共 37+ 个工具
```

## 体积预算

- 首页 JS（gzipped）：< 30KB
- 单工具页首屏 JS（gzipped）：< 80KB（重型库如 marked / qrcode / browser-image-compression 仅在进入对应工具时按需加载）

## 部署

产物为纯静态文件（dist/），可部署到任意静态托管：

### Cloudflare Pages（推荐）

```bash
# Build command
npm run build
# Output directory
dist
# Environment variables
NODE_VERSION=20
```

直接 `git push`，Cloudflare 自动构建。

### Vercel / Netlify

零配置：检测 Astro，输出目录 `dist`。

### Nginx 自托管

把 `dist/` 拷到服务器，配置 `try_files $uri $uri/ /404.html;`。

> 注意：部署后请把 `astro.config.mjs` 中的 `site` 改为实际域名，并确认 `manifest.webmanifest` 与 `sitemap.xml` 可访问。

## 隐私承诺

- 所有标注 **本地处理** 的工具，输入数据从不离开浏览器
- IP 查询调用 [ipapi.co](https://ipapi.co/) 公开接口，仅请求 IP 信息，无其他追踪
- 无后端、无埋点、无 Cookie 跟踪
- 收藏与最近使用仅写入 localStorage，不会同步到任何服务器

## License

MIT
