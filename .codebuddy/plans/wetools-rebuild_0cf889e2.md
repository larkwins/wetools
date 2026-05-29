---
name: wetools-rebuild
overview: 基于 Astro + Vue 岛屿架构，从零搭建一个插件化、可扩展、支持 PWA / i18n / ⌘K / 收藏 的现代程序员工具站点 wetools.cc，用于替代原有静态老站。
design:
  architecture:
    component: shadcn
  styleKeywords:
    - 极客现代风
    - 内容优先
    - 克制留白
    - 单色品牌强调
    - 等宽代码美学
    - 明暗双主题
    - 键盘友好
    - 微动效
  fontSystem:
    fontFamily: "Inter, PingFang SC, system-ui; mono: JetBrains Mono, Fira Code, ui-monospace"
    heading:
      size: 36px
      weight: 700
    subheading:
      size: 20px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#10B981"
      - "#059669"
      - "#34D399"
    background:
      - "#FFFFFF"
      - "#FAFAFA"
      - "#0A0A0A"
      - "#111113"
      - "#18181B"
    text:
      - "#0A0A0A"
      - "#52525B"
      - "#FAFAFA"
      - "#A1A1AA"
    functional:
      - "#10B981"
      - "#F59E0B"
      - "#EF4444"
      - "#3B82F6"
      - "#E4E4E7"
      - "#27272A"
todos:
  - id: scaffold
    content: 使用 [skill:vue] 与 [mcp:context7] 初始化 Astro 4 + Vue + Tailwind + TS 工程，配置 ESLint/Prettier/Vitest、shadcn-vue 基础控件、Lucide、CSS 变量明暗主题与 BaseLayout 防闪烁脚本
    status: completed
  - id: registry-and-shell
    content: 实现工具插件化 registry（import.meta.glob + ToolMeta 契约）、ToolLayout 壳、Sidebar、SiteHeader/Footer、动态路由 pages/tools/[tool].astro，并搭建 _template 工具模板与 1 个 demo 工具打通端到端
    status: completed
    dependencies:
      - scaffold
  - id: batch-tools-1
    content: 使用 [subagent:code-explorer] 批量实现编码/JSON/时间/生成器/文本/开发 6 大类工具（Base64、URL、HTML、Hex、Unicode、JSON 全家桶、JSON→TS、时间戳、Cron、时区、UUID、密码、随机、Lorem、Mock、Diff、Markdown、大小写、文本工具、正则、颜色、CSS 单位、进制、Tailwind 速查）
    status: completed
    dependencies:
      - registry-and-shell
  - id: batch-tools-2
    content: 实现加密/图像/网络类重型工具：MD5/SHA/HMAC/AES/RSA/JWT、QR 生成与识别、图片压缩/格式互转/Base64、取色器、SVG 优化、IP 查询（含隐私说明）、UA 解析、cURL 转码、URL 解析；按需 dynamic import 控制 chunk 体积
    status: completed
    dependencies:
      - registry-and-shell
  - id: palette-and-prefs
    content: 实现 ⌘K 命令面板（fuse.js + 最近 + 收藏分组 + 键盘导航）、收藏/最近使用 Pinia store + VueUse 持久化、主题三态切换与 PrivacyNotice 全站接入
    status: completed
    dependencies:
      - batch-tools-1
      - batch-tools-2
  - id: i18n-and-pwa
    content: 接入 astro-i18n 双语路由 + vue-i18n 岛屿内文案、为所有工具 meta 补齐 zh/en 文案；配置 @vite-pwa/astro（manifest、precache app shell、runtime cache 工具页与 ipapi）
    status: completed
    dependencies:
      - palette-and-prefs
  - id: seo-tests-deploy
    content: 接入 @astrojs/sitemap、SeoHead（title/description/og/canonical/hreflang）、robots.txt；用 [skill:vue] 风格补 registry 完整性单测与核心工具单测；产出 README 与 Cloudflare Pages 部署指引
    status: completed
    dependencies:
      - i18n-and-pwa
---

## Product Overview

重构老站 wetools.cc，打造一个面向程序员的现代化在线工具合集站点。整站纯静态部署，所有工具在浏览器本地运行（IP 查询除外），无需登录、不上传数据。设计上采用插件化架构，单工具单路由，新增工具仅需新增目录，便于无限扩展。

## Core Features

- **工具集合（9 大类、40+ 工具）**
- 编码转换：Base64 / URL / HTML 实体 / Hex / Unicode
- JSON 与数据：格式化、校验、对比，JSON ↔ YAML / XML / CSV，JSON → TS Interface
- 加密哈希：MD5、SHA-1/256/512、HMAC、AES、RSA（生成/加解密）、JWT 解析
- 时间日期：Unix 时间戳互转、Cron 解析、时区换算
- 生成器：UUID / NanoID、随机密码、随机数据、Lorem Ipsum、Mock 数据
- 图像：二维码生成与识别、图片压缩、格式互转（PNG/JPG/WebP/AVIF）、图片转 Base64、取色器、SVG 优化
- 文本：Diff 对比、Markdown 预览、大小写转换、去重排序、字数统计、正则测试
- 网络：IP 查询、UA 解析、cURL 转代码、URL 解析
- 开发：颜色转换、CSS 单位换算、进制转换、Tailwind 速查
- **首页**：分类网格 + 卡片，支持搜索过滤、收藏徽标、热门/新增标签
- **全局命令面板（⌘K / Ctrl+K）**：模糊搜索工具、最近使用、收藏快速访问
- **收藏与最近使用**：localStorage 持久化，工具页右上角一键收藏
- **明暗双主题**：默认跟随系统，可手动切换并持久化
- **中英双语 i18n**：界面与工具元信息双语，URL 前缀切换
- **PWA 离线可用**：App Shell 预缓存 + 工具按需缓存，可"添加到主屏幕"
- **隐私可信**：每个工具页明示"数据仅在浏览器本地处理"，IP 查询单独标注外部 API
- **响应式布局**：桌面优先，平板/手机自适应

## Tech Stack

- **核心框架**：Astro 4+（SSG，零 JS by default，岛屿架构）
- **UI 岛屿**：Vue 3 + `<script setup>` + TypeScript（与用户既有 gopaste 习惯一致）
- **样式**：Tailwind CSS 3 + CSS Variables（用于 light/dark token）
- **基础组件**：shadcn-vue（按需引入 Dialog/Command/Popover/DropdownMenu/Tabs/Toast 等无样式可定制 primitive）
- **图标**：lucide-vue-next（统一图标系统，禁用 emoji 作 UI 图标，沿用 gopaste 规范）
- **状态/存储**：Pinia + `@vueuse/core`（useStorage 封装 localStorage，自动跨标签同步）
- **国际化**：astro-i18n（路由层）+ vue-i18n（岛屿内）
- **PWA**：`@vite-pwa/astro`（自动注入 manifest + Workbox 策略）
- **SEO**：`@astrojs/sitemap` + `@astrojs/rss` + 自定义 `<SeoHead />` 组件
- **关键工具实现库**（仅在用到该工具的岛屿内动态 import，避免首屏负担）：
- QR：`qrcode` + `jsqr`
- JSON 处理：`json5` / 原生 JSON / `json-source-map`（错误定位）
- YAML：`js-yaml`；XML：`fast-xml-parser`；CSV：`papaparse`
- JSON→TS：`json-to-ts`
- Hash/HMAC：Web Crypto API（原生）+ `js-md5`（Web Crypto 不支持 MD5）
- AES/RSA：Web Crypto API（SubtleCrypto）
- JWT：`jose` 或纯解码（无验证场景）
- Cron：`cronstrue` + `cron-parser`
- 图片压缩：`browser-image-compression`（基于 Canvas/WebWorker）
- SVG 优化：`svgo`（浏览器构建）
- Diff：`diff` + `diff2html`
- Markdown：`markdown-it` + `highlight.js`
- 正则：原生 RegExp + 高亮
- cURL 解析：`curlconverter`
- UA 解析：`ua-parser-js`
- UUID：原生 `crypto.randomUUID()` + `nanoid`
- 颜色：`colord`
- IP 查询：`https://ipapi.co/json/`（免费、HTTPS、CORS 友好；备用 ipwho.is）
- **构建/质量**：Vite（Astro 内置）、ESLint + Prettier、TypeScript strict、Vitest（核心工具函数单测）

## Implementation Approach

**核心策略：插件化注册式工具架构 + Astro 岛屿**

- 每个工具是 `src/tools/<tool-id>/` 下的一个自包含目录，导出标准化 meta（id、分类、双语标题/描述、关键词、Lucide 图标、tags）。
- 中心 registry 通过 `import.meta.glob('/src/tools/*/index.ts', { eager: true })` 在构建期自动收集所有工具，统一驱动：首页卡片、分类侧栏、⌘K 搜索源、SEO 元信息、sitemap、面包屑、相关工具推荐、i18n key 校验。
- Astro 在 `src/pages/tools/[tool].astro` 通过 `getStaticPaths()` 从 registry 生成全部静态路由；工具具体 UI 是 Vue 岛屿，使用 `client:visible` 或 `client:idle` 按需水合，**首页与非交互区零 JS**。
- 重型库（如 svgo/markdown-it/diff2html）放在工具岛屿内 `await import()`，被 Vite 代码分割成独立 chunk，仅在用户进入对应工具时下载。

**为什么是这个方案**

- 工具站对 SEO / 首屏极敏感，Astro SSG + 岛屿是当前最优解：HTML 直出、JS 按需。
- 选 Vue 岛屿而非 React，与你现有项目（gopaste）技术栈一致，降低维护成本。
- 插件化让"加新工具"成本下降到几乎零：新建目录 + 写 meta + 写组件即可，无需触碰路由、首页、搜索、i18n、sitemap 等任何中心文件。
- localStorage + Pinia + VueUse 满足收藏/最近/主题/语言所有诉求，且天然跨标签同步。

**性能与可靠性**

- 首页：纯 HTML + Tailwind，<5KB JS（仅主题切换、收藏徽标、⌘K 触发器）。
- 路由级 chunk：每个工具独立 chunk，tree-shaking 后大多 < 30KB gzipped；二维码 / Markdown / SVGO 等 60–150KB 也仅在使用时加载。
- 客户端密集型操作（图片压缩、Hash 大文件）使用 Web Worker（`browser-image-compression` 已内置）防止主线程卡顿。
- IP 查询设置 5s 超时 + 失败兜底文案，并明示外部依赖。
- PWA 策略：App Shell（首页 + 壳 + 公共 chunk）走 `precache`；工具页与外部 API 走 `NetworkFirst`，离线下回落到已缓存版本。

**避免技术债**

- 沿用 Lucide 图标统一规范（gopaste rule 已落地）。
- 公共 UI 控件（Card / Input / Button / Tabs / CopyButton / FileDropZone / CodeArea）在 `src/components/ui` 集中实现，所有工具复用，避免每个工具重写样式。
- 工具内部禁止直接读写 localStorage / 直接接触路由，统一通过 `useFavorites()`、`useRecents()`、`useToolMeta()` 等 composables，便于后续替换底层。

## Implementation Notes

- **图标**：所有 UI 图标必须使用 lucide-vue-next，禁止 emoji。沿用 gopaste rule。常用映射：Search、Star、StarOff、Clock（最近）、Command（⌘K）、Sun/Moon/MonitorCog（主题）、Languages（语言）、Copy、Check、Download、Upload、Trash2、Settings、X。
- **隐私文案**：每个工具页底部统一渲染 `<PrivacyNotice />`：默认"所有计算在你的浏览器本地完成，不会上传任何数据"；IP 查询页显式覆盖为"使用 ipapi.co 公开接口，仅发送你的 IP，无其他追踪"。
- **可访问性**：⌘K 命令面板用 shadcn-vue Dialog + 焦点陷阱；所有 IconButton 必须有 `aria-label`；色彩 token 通过 WCAG AA 校验。
- **安全**：Markdown 预览启用 sanitize（markdown-it + DOMPurify）；JWT 解析仅 decode，不在前端处理私钥签发；CSP meta 收紧 default-src self + connect-src ipapi.co。
- **日志**：仅在 dev 环境通过 `import.meta.env.DEV` 打 console；生产构建剥离。错误统一通过 toast 提示，不上报后端（无后端）。
- **构建产物体积红线**：首页 JS 总量 ≤ 30KB（gzipped），单工具页首屏 JS ≤ 80KB（gzipped），超出需 review。

## Architecture Design

```mermaid
flowchart TD
    A[用户浏览器] -->|静态 HTML| B[Astro Pages]
    B --> C[首页 index.astro]
    B --> D[工具页 tools/[id].astro]
    B --> E[About / 404]

    C -.静态生成.-> F[Tool Registry]
    D -.静态生成.-> F
    F -.eager glob.-> G[src/tools/*/index.ts]

    D -->|client:visible| H[Vue 岛屿 Tool.vue]
    H --> I[shadcn-vue + Tailwind]
    H --> J[Composables: useFavorites/useRecents/useI18n]
    H --> K[动态 import 工具库]

    L[全局岛屿: CommandPalette client:idle] --> F
    L --> J
    M[ThemeToggle / LangSwitch client:load] --> J

    J --> N[(localStorage via VueUse)]
    K -.IP 查询.-> O[ipapi.co]

    P[Service Worker via vite-pwa] -.precache.-> B
    P -.runtime cache.-> O
```

**模块划分**

- **registry 层**：`src/lib/registry.ts` 聚合所有工具 meta，导出 `allTools / toolById / toolsByCategory / searchTools`。
- **页面层**：Astro 页面只负责 SSG + 壳 + 注入岛屿，不写业务逻辑。
- **岛屿层**：Vue 组件，每个工具独立，与 registry 解耦。
- **公共 UI 层**：`src/components/ui` 复用控件；`src/components/layout` 站点壳（Header / Sidebar / Footer / CommandPalette / SeoHead）。
- **基础设施层**：composables（收藏/最近/i18n/主题/复制）、stores（Pinia 收藏与最近）、utils（格式化、校验、文件读写）。

## Directory Structure

工作区当前为空，从零初始化。完整结构如下：

```
wetools/
├── astro.config.mjs                       # [NEW] Astro 配置：integrations(vue, sitemap, tailwind, pwa, i18n)、site URL、build 选项
├── tailwind.config.cjs                    # [NEW] Tailwind 配置：darkMode='class'、引入 CSS 变量色板、shadcn-vue preset
├── tsconfig.json                          # [NEW] TS strict + 路径别名 @/* → src/*
├── package.json                           # [NEW] 依赖清单（见 Tech Stack）
├── .eslintrc.cjs / .prettierrc            # [NEW] 代码风格统一
├── .env.example                           # [NEW] 列出可选环境变量（如 IP API endpoint 覆盖）
├── public/
│   ├── favicon.svg                        # [NEW] 站点图标
│   ├── og.png                             # [NEW] Open Graph 默认分享图
│   ├── robots.txt                         # [NEW] 允许全部抓取，引用 sitemap.xml
│   └── pwa-icons/                         # [NEW] 192/512/maskable PWA 图标
├── src/
│   ├── env.d.ts                           # [NEW] Astro / Vite 类型声明
│   ├── styles/
│   │   ├── globals.css                    # [NEW] Tailwind base/components/utilities + CSS 变量(light/dark token)
│   │   └── tokens.css                     # [NEW] 设计令牌：颜色、字体、间距、圆角、阴影
│   ├── lib/
│   │   ├── registry.ts                    # [NEW] 核心：用 import.meta.glob 收集所有 src/tools/*/index.ts，导出查询 API
│   │   ├── search.ts                      # [NEW] 基于 fuse.js 的工具模糊搜索（命令面板与首页共用）
│   │   ├── seo.ts                         # [NEW] 生成每个工具页的 title/description/og 元信息
│   │   └── i18n.ts                        # [NEW] 双语字典加载、当前语言探测、t() 工具函数
│   ├── locales/
│   │   ├── zh.json                        # [NEW] 中文文案（站点级 + 通用文案；工具自带 i18n 在 meta 中）
│   │   └── en.json                        # [NEW] 英文文案
│   ├── stores/
│   │   ├── favorites.ts                   # [NEW] Pinia store：收藏列表，VueUse useStorage 持久化
│   │   ├── recents.ts                     # [NEW] Pinia store：最近使用（最多 12 条，按时间倒序）
│   │   └── settings.ts                    # [NEW] 主题（system/light/dark）、语言、UI 偏好
│   ├── composables/
│   │   ├── useTheme.ts                    # [NEW] 读写 settings.theme，监听系统 prefers-color-scheme
│   │   ├── useLocale.ts                   # [NEW] 读写当前语言，路由跳转携带 /en 或 /zh 前缀
│   │   ├── useFavorites.ts                # [NEW] 操作收藏（toggle/has/list）
│   │   ├── useRecents.ts                  # [NEW] 记录访问（push/list/clear）
│   │   ├── useCopy.ts                     # [NEW] 一键复制 + toast 反馈
│   │   └── useFile.ts                     # [NEW] 拖拽/上传/下载封装
│   ├── components/
│   │   ├── ui/                            # [NEW] shadcn-vue 复制过来的基础控件 + 自研控件
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Textarea.vue
│   │   │   ├── Tabs.vue
│   │   │   ├── Card.vue
│   │   │   ├── Toast.vue
│   │   │   ├── Dialog.vue
│   │   │   ├── DropdownMenu.vue
│   │   │   ├── Select.vue
│   │   │   ├── Switch.vue
│   │   │   ├── CodeArea.vue                # [NEW] 自研：等宽 + 行号 + 复制按钮 + 错误高亮
│   │   │   ├── CopyButton.vue              # [NEW] 通用复制按钮（Lucide Copy/Check）
│   │   │   ├── FileDropZone.vue            # [NEW] 拖拽 + 点选文件，支持多文件
│   │   │   ├── PrivacyNotice.vue           # [NEW] 隐私说明（默认本地处理；可 override）
│   │   │   └── Empty.vue                   # [NEW] 空状态（Lucide ClipboardList）
│   │   └── layout/
│   │       ├── SiteHeader.vue              # [NEW] Logo + 搜索触发器(⌘K) + ThemeToggle + LangSwitch + GitHub link
│   │       ├── SiteFooter.vue              # [NEW] 备案/版权/隐私/反馈
│   │       ├── Sidebar.vue                 # [NEW] 桌面端分类导航（折叠分组 + 收藏置顶）
│   │       ├── CommandPalette.vue          # [NEW] ⌘K 全局命令面板：fuse.js + 最近 + 收藏分组
│   │       ├── ThemeToggle.vue             # [NEW] Sun/Moon/MonitorCog 三态切换
│   │       ├── LangSwitch.vue              # [NEW] zh/en 切换
│   │       ├── ToolHeader.vue              # [NEW] 工具页标题 + 简介 + 收藏按钮 + 隐私 badge
│   │       └── SeoHead.astro               # [NEW] 注入 title/description/og/canonical/alternate hreflang
│   ├── layouts/
│   │   ├── BaseLayout.astro                # [NEW] HTML 骨架：注入主题预脚本(防闪烁)、SeoHead、Header、Footer
│   │   └── ToolLayout.astro                # [NEW] 工具页壳：左 Sidebar + 右内容 + ToolHeader + 相关工具
│   ├── pages/
│   │   ├── index.astro                     # [NEW] 首页：Hero + 分类网格 + 工具卡 + 最近使用 + 收藏
│   │   ├── about.astro                     # [NEW] 关于页：项目简介、隐私声明、技术栈、开源链接
│   │   ├── 404.astro                       # [NEW] 友好 404：搜索框 + 推荐工具
│   │   ├── tools/
│   │   │   └── [tool].astro                # [NEW] 单工具页：getStaticPaths 来自 registry，挂载对应 Vue 岛屿
│   │   └── en/                             # [NEW] 英文路由镜像（astro-i18n 自动生成）
│   ├── pages/sitemap-index.xml.ts          # [NEW] 由 @astrojs/sitemap 自动产出，无需手写
│   └── tools/                              # [NEW] 插件化工具目录，每个子目录一个工具
│       ├── _template/                      # [NEW] 模板：复制即新增工具
│       │   ├── index.ts                    # 导出 ToolMeta（id/category/icon/i18n/keywords/tags/component-loader）
│       │   └── Tool.vue
│       ├── base64/                         # [NEW] Base64 编解码（编码类）
│       ├── url-encode/                     # [NEW] URL 编解码
│       ├── html-entity/                    # [NEW] HTML 实体编解码
│       ├── hex-string/                     # [NEW] Hex / 字符串互转
│       ├── unicode-escape/                 # [NEW] Unicode 转义
│       ├── json-format/                    # [NEW] JSON 格式化/校验/压缩，错误行号定位
│       ├── json-diff/                      # [NEW] JSON 对比（结构感知）
│       ├── json-yaml/                      # [NEW] JSON ↔ YAML
│       ├── json-xml/                       # [NEW] JSON ↔ XML
│       ├── json-csv/                       # [NEW] JSON ↔ CSV
│       ├── json-to-ts/                     # [NEW] JSON → TypeScript Interface
│       ├── hash/                           # [NEW] MD5/SHA-1/256/512/HMAC（文本+文件，Web Crypto + js-md5）
│       ├── aes/                            # [NEW] AES 加解密（SubtleCrypto，CBC/GCM）
│       ├── rsa/                            # [NEW] RSA 密钥生成 + 加解密
│       ├── jwt/                            # [NEW] JWT 解析（header/payload/signature 高亮）
│       ├── timestamp/                      # [NEW] Unix 时间戳互转，多时区
│       ├── cron/                           # [NEW] Cron 表达式解析 + 下次执行时间预览
│       ├── timezone/                       # [NEW] 多时区时间换算
│       ├── uuid/                           # [NEW] UUID v4 / NanoID 批量生成
│       ├── password/                       # [NEW] 随机密码（长度/字符集/排除易混字符）
│       ├── random/                         # [NEW] 随机数/字符串/范围
│       ├── lorem/                          # [NEW] Lorem Ipsum 生成
│       ├── mock-data/                      # [NEW] 假数据生成（姓名/邮箱/地址/JSON 模板）
│       ├── qr-generate/                    # [NEW] 二维码生成（容错率/尺寸/Logo 嵌入）
│       ├── qr-decode/                      # [NEW] 二维码识别（图片/摄像头）
│       ├── image-compress/                 # [NEW] 图片压缩（browser-image-compression + Worker）
│       ├── image-convert/                  # [NEW] PNG/JPG/WebP/AVIF 互转（Canvas）
│       ├── image-base64/                   # [NEW] 图片 ↔ Base64 / Data URL
│       ├── color-picker/                   # [NEW] 取色器 + 历史色 + 复制 HEX/RGB/HSL
│       ├── svg-optimize/                   # [NEW] SVG 优化（svgo browser bundle）
│       ├── text-diff/                      # [NEW] 文本 Diff（行/字符级，diff + diff2html）
│       ├── markdown/                       # [NEW] Markdown 实时预览（markdown-it + highlight.js + sanitize）
│       ├── case-convert/                   # [NEW] 大小写/驼峰/下划线/短横线
│       ├── text-utils/                     # [NEW] 去重/排序/反转/字数统计
│       ├── regex/                          # [NEW] 正则测试器（高亮匹配 + 分组 + 速查）
│       ├── ip-lookup/                      # [NEW] 公网 IP 查询（ipapi.co + 隐私说明）
│       ├── ua-parse/                       # [NEW] User-Agent 解析（ua-parser-js）
│       ├── curl-convert/                   # [NEW] cURL → fetch / axios / Python / Go
│       ├── url-parse/                      # [NEW] URL 解析（协议/域名/参数表）
│       ├── color-convert/                  # [NEW] HEX/RGB/HSL/HSV 互转 + Tailwind 近似
│       ├── css-units/                      # [NEW] px/rem/em/vw 换算
│       ├── number-base/                    # [NEW] 二/八/十/十六进制互转
│       └── tailwind-cheatsheet/            # [NEW] Tailwind 速查表（搜索 + 复制）
├── workers/
│   └── image-compress.worker.ts            # [NEW] 图片压缩 Web Worker（如需自定义可选）
├── tests/
│   ├── registry.spec.ts                    # [NEW] 校验 registry 完整性：id 唯一、icon 存在、i18n key 完整
│   ├── tools/base64.spec.ts                # [NEW] 核心工具函数单测（编码/解码圆环回归）
│   ├── tools/json-format.spec.ts           # [NEW] JSON 工具单测
│   └── tools/hash.spec.ts                  # [NEW] Hash 单测
└── README.md                               # [NEW] 项目说明、本地开发、添加工具教程、部署指引
```

## Key Code Structures

仅给出最关键的两处契约——工具元信息与 registry，以保证插件化扩展的一致性：

```ts
// src/lib/types.ts —— 工具元信息（每个工具 index.ts 必须导出符合此契约的对象）
export type ToolCategory =
  | 'encoding' | 'json' | 'crypto' | 'datetime'
  | 'generator' | 'image' | 'text' | 'network' | 'dev';

export interface ToolMeta {
  id: string;                              // kebab-case，与目录名一致
  category: ToolCategory;
  icon: string;                            // Lucide 图标名，如 'Hash'
  i18n: {
    zh: { title: string; description: string };
    en: { title: string; description: string };
  };
  keywords: string[];                      // 用于 ⌘K / 首页搜索
  tags?: ('new' | 'hot' | 'beta')[];
  privacy?: 'local' | 'external';          // 默认 'local'；'external' 需在页面显式说明
  // 工具组件懒加载，避免在 registry 聚合时打包全部 chunk
  loader: () => Promise<{ default: Component }>;
}

// src/lib/registry.ts —— 自动收集
const modules = import.meta.glob<{ meta: ToolMeta }>(
  '/src/tools/*/index.ts',
  { eager: true }
);
export const allTools: ToolMeta[] = Object.values(modules).map(m => m.meta);
```

## 整体设计语言

现代极客风 + 内容优先的双主题工具站。借鉴 Linear / Vercel / Raycast 的克制美学：大留白、强排版、细微动效、单一品牌主色，避免花哨渐变干扰工具本体。同时保留"开发者友好"气质——等宽字体在代码区、单色高亮在交互态、键盘快捷键随处可见。

## 页面规划（共 4 个核心页面 / 模板）

### 1. 首页 `/`（Landing + Tools Grid）

- **顶部导航条**：Logo（WeTools 字标 + 单色 Lucide 图标）/ 全站搜索按钮（占位文字"搜索工具… ⌘K"）/ 主题切换 / 语言切换 / GitHub 链接
- **Hero 区**：一句价值主张"程序员的浏览器工具箱，全部本地运行" + 副标 + 主 CTA"打开命令面板 ⌘K"
- **快捷区**（条件渲染）：最近使用横向滚动卡片 + 收藏夹徽标
- **分类工具网格**：9 大分类标题分组，每个工具一张卡（Lucide 图标 + 标题 + 一句话描述 + new/hot 角标 + 收藏星标），鼠标悬停轻微抬升 + 边框点亮
- **底部页脚**：项目简介、隐私声明、开源仓库、备案

### 2. 工具页 `/tools/[id]`（统一壳）

- **顶部导航**：与首页一致
- **左侧 Sidebar**（桌面 ≥ lg）：分类树 + 当前分类高亮 + 收藏置顶分组（移动端折叠为顶部抽屉）
- **工具头**：面包屑 / 标题 + 一句话描述 / 隐私 badge（绿"本地处理" 或 黄"调用外部 API"） / 收藏按钮 / 复制链接按钮
- **工具内容区**：Vue 岛屿渲染。统一布局规范——左输入 / 右输出 双栏，或上下分栏（视工具）；所有输入/输出区右上角都带 Copy / Clear / Download 三键
- **底部**：相关工具推荐（同分类随机 4 个） + 隐私说明 + 反馈

### 3. 命令面板 `⌘K / Ctrl+K`（全局浮层）

- 居中 Dialog，背景 backdrop-blur
- 顶部输入框（Lucide Search） + 模糊匹配（fuse.js）
- 列表分组：最近使用 / 收藏 / 全部工具（按分类）
- 每项展示：Lucide 图标 + 工具名 + 简述 + 分类标签
- 全键盘导航：↑↓ 选择，Enter 进入，Esc 关闭，⌘1–9 快速跳转分类

### 4. 404 / About

- 404：极简插画 + 搜索框 + 4 个热门工具推荐
- About：项目动机、技术栈说明、隐私承诺、贡献指南链接

## Block 设计要点

- **工具卡片**：12px 圆角，1px 边框（dark 用 zinc-800，light 用 zinc-200），hover 时边框转为品牌色 + translateY(-2px) + 投影从无到 sm，过渡 150ms
- **代码区（CodeArea）**：等宽字体 JetBrains Mono / Fira Code，行号灰色，错误行红色背景，复制按钮悬停才显形
- **按钮**：主按钮品牌色实心，次按钮 ghost，危险按钮 destructive；统一 36px 高，8px 圆角
- **Toast**：右下角，2.5s 自动消失，Lucide CheckCircle2 / AlertCircle 前缀
- **响应式断点**：sm 640 / md 768 / lg 1024 / xl 1280；< lg 隐藏 Sidebar，改为顶部"分类"抽屉
- **动效原则**：所有过渡 ≤ 200ms，仅用于状态变化（hover / focus / 主题切换 / 收藏星标 fill 动画），禁止页面级花哨动画
- **主题切换**：在 `<head>` 内联预脚本读 localStorage 设置 `<html class="dark">`，杜绝刷新闪白

## Agent Extensions

### Skill

- **vue**
- Purpose: 在编写 Vue 3 岛屿组件、Composition API、Pinia store、composables 与 vue-i18n 集成时遵循官方最佳实践
- Expected outcome: 所有 Vue 岛屿代码符合 Vue 3 + `<script setup lang="ts">` 规范，状态管理与组合式函数结构清晰、可维护

### SubAgent

- **code-explorer**
- Purpose: 在实现过程中如需查阅 Astro / Vue / shadcn-vue 等多文件交叉模式或定位某工具库的正确用法时，进行多文件批量探查
- Expected outcome: 减少对单个 read_file 的反复调用，快速给出符合社区主流的用法

### MCP

- **context7**
- Purpose: 在引入 Astro、@vite-pwa/astro、astro-i18n、shadcn-vue、browser-image-compression、qrcode 等库时获取最新且准确的 API 与配置示例，避免因版本差异导致的错误
- Expected outcome: 关键依赖的初始化与典型用法基于官方最新文档落地