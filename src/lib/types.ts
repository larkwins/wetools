/**
 * 工具元信息契约 —— 所有 src/tools/<id>/index.ts 必须导出 `meta: ToolMeta`
 */
export type ToolCategory =
  | 'encoding'
  | 'json'
  | 'crypto'
  | 'datetime'
  | 'generator'
  | 'image'
  | 'text'
  | 'network'
  | 'dev';

export type ToolTag = 'new' | 'hot' | 'beta';

/** 隐私模式：本地处理 / 调用外部 API */
export type ToolPrivacy = 'local' | 'external';

export interface ToolI18nField {
  title: string;
  description: string;
}

export interface ToolMeta {
  /** kebab-case，与目录名一致；同时作为 URL 段 */
  id: string;
  category: ToolCategory;
  /** Lucide 图标名，如 'Hash' 'QrCode' 'Braces' */
  icon: string;
  i18n: {
    zh: ToolI18nField;
    en: ToolI18nField;
  };
  /** ⌘K / 首页搜索关键字 */
  keywords?: string[];
  tags?: ToolTag[];
  /** 隐私模式，默认 local；external 表示需要调用第三方接口 */
  privacy?: ToolPrivacy;
}

export interface CategoryMeta {
  id: ToolCategory;
  icon: string;
  i18n: {
    zh: { title: string; description?: string };
    en: { title: string; description?: string };
  };
  /** 排序权重，数字越小越靠前 */
  order: number;
}
