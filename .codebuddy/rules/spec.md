# WeTools 项目开发规范（必读）

> 本文件由 CodeBuddy 在每次会话中自动读取。任何修改或新增工具的工作都必须遵守以下规则。

---

## 1. 国际化（i18n）—— 所有 UI 文字必须适配 zh-CN / zh-TW / en

**这是项目最高优先级规则。任何新增/修改工具时都必须遵守，不允许只写中文就提交。**

### 站点支持的语言
- `zh-CN` 简体中文（默认）
- `zh-TW` 繁体中文（由 OpenCC 自动转换，**无需人工维护**）
- `en` 英文（**必须人工维护**，依赖 `src/lib/zhEnDict.ts` 字典）

### 工具元信息（`src/tools/<id>/index.ts`）
- `meta.i18n` 字段**必须**同时提供 `zh` 和 `en` 的 `title` 与 `description`。
- **不需要**额外把工具标题/描述加进 `src/lib/zhEnDict.ts` —— `zhEnDict.ts` 会在运行时
  从 `registry` 自动注入所有工具的 `zh.title→en.title` / `zh.description→en.description`。
- 分类（`src/lib/categories.ts`）同理：`zh.title/description` 与 `en.title/description` 同时填好即可自动注入。

```ts
// ✅ 正确
export const meta: ToolMeta = {
  id: 'my-tool',
  // ...
  i18n: {
    zh: { title: '我的工具', description: '一段中文描述' },
    en: { title: 'My Tool', description: 'An English description' },
  },
};
```

### 工具内部 UI（`src/tools/<id>/Tool.vue`）
工具组件**保留中文源码即可**（不需要在每个组件里写 `useI18n`），但所有出现在 UI 上的中文短语/句子**必须**同步加入 `src/lib/zhEnDict.ts`：

涵盖范围（缺一不可）：
- 按钮文字（"复制"、"清空"、"生成"…）
- 标签 / 表头 / 单选按钮 label（"输入"、"输出"、"算法"…）
- 提示与状态文案（"加载中…"、"无效"、"未识别到内容"…）
- 错误信息（`"日期格式无效"`、`"输入不是合法的 Base64 字符串"`…）
- HTML 属性：`placeholder` / `title` / `aria-label` / `alt` 中的中文
- 占位符 / 帮助文字
- 动态拼接出现的中文片段（例如 `第 N 行` 中的"第"和"行"，**优先把整段加入字典**）

每个新工具至少补 1 条字典即可视为合规，缺漏会被视为遗漏修复。

### 自动翻译机制（仅供理解，开发时不要依赖未维护的翻译）
- 实现位于：
  - `src/components/layout/GlobalI18n.vue` —— 全 body 扫描器
  - `src/composables/useToolI18n.ts` —— 工具区扫描器
  - `src/lib/zhEnDict.ts` —— 中→英字典
  - `src/lib/i18n.ts` —— OpenCC 简→繁
- 扫描会处理：所有文本节点 + 元素属性 `placeholder` / `title` / `aria-label` / `alt`
- **不会扫描**：`<script>` / `<style>` / `<code>` / `<pre>` / `<kbd>` 内部，以及带 `data-no-i18n` 标记的子树
- 切到英文时未命中字典的中文将**保留原样**，因此漏译会直接以中文显示混在英文里。

### 添加字典条目的最佳实践
1. **优先添加整句**，避免单字 key（如 `'秒'`、`'年'`、`'词'` 这种容易误伤普通文本）。
2. 必须使用单字时，加上**前导/后导空格或标点**以缩小匹配范围，例如 `' 秒后'`、`' 行（非空）'`。
3. 长字符串先加，因为字典按 key 长度降序匹配。
4. 不要删除既有 key（可能被其他工具引用）。
5. zh-TW 由 OpenCC 自动转换，**不需要**也**不能**在字典里维护繁体条目。

---

## 2. UI 图标使用 Lucide Icons

- 项目内所有图标使用 `lucide-vue-next` 包提供的图标。
- 禁止 emoji 作为 UI 图标。
- 默认尺寸 16px；标题栏 14px；空状态 48px。
- 常用映射参考：
  - Search（搜索）/ Star（收藏）/ Pin（置顶）/ Trash2（删除）
  - Eye（查看）/ Settings（设置）/ X（关闭）/ Minus（最小化）
  - ArrowLeft（返回）/ Download（导出）
  - FileText / Image / Link / Code2（类型图标）
  - ClipboardList（空状态）

---

## 3. 新增工具的步骤（务必按顺序）

1. 复制 `src/tools/_template/` 为 `src/tools/<new-tool-id>/`，目录名使用 kebab-case。
2. 修改 `src/tools/<new-tool-id>/index.ts`：
   - 填写 `meta.id`（与目录名一致）、`category`、`icon`、`i18n.zh`、`i18n.en`、`keywords`、`tags`、`privacy`。
3. 实现 `src/tools/<new-tool-id>/Tool.vue`。
4. **国际化收尾**（必做，不可跳过）：
   - 将 Tool.vue 中所有中文 UI 文案（含 placeholder 等属性）加入 `src/lib/zhEnDict.ts`；
   - 在 `index.ts` 的 `i18n.en` 中提供工具名/描述的英文翻译；
   - 自测：切换语言到 `zh-TW` 和 `en`，检查页面无遗漏的中文（除非该中文不属于 UI 文案）。
5. 通过 `pnpm dev` 验证三种语言显示正常。

---

## 4. 其他

- 所有工具默认 `privacy: 'local'`；调用第三方接口的工具需显式声明 `privacy: 'external'`。
- 提交前确保无 TS / ESLint 报错。
