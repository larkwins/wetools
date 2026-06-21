/**
 * qrcode.ts — 二维码生成工具库
 *
 * 基于 third-party/widget-qrcode 封装，提供美化二维码生成能力。
 * 支持 11 种外观模板、Logo、渐变色、前景/背景图等高级特性。
 * 所有操作均在本地完成，不上传任何数据。
 */

// ─── 类型定义 ──────────────────────────────────────────────────────────────────

/** 二维码纠错等级 */
export type QREcLevel = 'L' | 'M' | 'Q' | 'H';

/** 二维码外观模板 */
export type QRTemplate =
  | 'default'   // 标准方块
  | 'water'     // 圆角水滴（相邻块合并圆角）
  | 'star'      // 五角星
  | 'rect'      // 矩形合并
  | 'diamond'   // 菱形
  | 'hexagon'   // 六边形
  | 'bar'       // 条形 / 胶囊
  | 'heart'     // 爱心
  | 'glitter'   // 散点光斑
  | 'fusion'    // 融合圆角矩形
  | 'stroke';   // 描边风格

/** 所有可用模板及其显示名称 */
export const QR_TEMPLATES: Array<{ value: QRTemplate; label: string }> = [
  { value: 'default',  label: '标准' },
  { value: 'water',    label: '水滴' },
  { value: 'fusion',   label: '融合' },
  { value: 'rect',     label: '矩形' },
  { value: 'bar',      label: '条形' },
  { value: 'hexagon',  label: '六边形' },
  { value: 'diamond',  label: '菱形' },
  { value: 'star',     label: '星形' },
  { value: 'heart',    label: '爱心' },
  { value: 'glitter',  label: '光斑' },
  { value: 'stroke',   label: '描边' },
];

/** generateQRCode 参数 */
export interface QRCodeOptions {
  /** 二维码内容（文字、URL 等） */
  value: string;
  /** 输出画布尺寸（像素），默认 400 */
  size?: number;
  /** 纠错等级，默认 'M'（有 Logo 时自动升为 'H'） */
  level?: QREcLevel;
  /** 外观模板，默认 'default' */
  template?: QRTemplate;
  /** 前景色，支持单色 '#000000' 或多色渐变 '#ff0000,#0000ff'，默认 '#000000' */
  foregroundColor?: string;
  /** 背景色，默认 '#ffffff' */
  backgroundColor?: string;
  /** 定位点内层颜色（不填则跟随前景色） */
  innerColor?: string;
  /** 定位点外层颜色（不填则跟随前景色） */
  outerColor?: string;
  /** Logo 图片 URL（启用时自动将纠错升为 H） */
  logo?: string;
  /** 前景图片 URL（当 foregroundColor 未设置时生效） */
  foregroundImage?: string;
  /** 背景图片 URL */
  backgroundImage?: string;
  /** 悬浮文本 */
  text?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 文本描边颜色 */
  textStroke?: string;
}

// ─── 懒加载第三方模块 ──────────────────────────────────────────────────────────

type QRCodeFn = (text: string, level: string) => boolean[][];
type DrawMap = Record<string, (ctx: CanvasRenderingContext2D, data: boolean[][], options: Record<string, string>) => void>;

let _qrcodeFn: QRCodeFn | null = null;
let _drawMap: DrawMap | null = null;

async function ensureModules(): Promise<{ qrcodeFn: QRCodeFn; drawMap: DrawMap }> {
  if (_qrcodeFn && _drawMap) {
    return { qrcodeFn: _qrcodeFn, drawMap: _drawMap };
  }
  const [qrcodeModule, drawModule] = await Promise.all([
    import('@third-party/widget-qrcode/src/module/qrcode.js'),
    import('@third-party/widget-qrcode/src/module/draw.js'),
  ]);
  _qrcodeFn = qrcodeModule.default as QRCodeFn;
  _drawMap  = drawModule.default as DrawMap;
  return { qrcodeFn: _qrcodeFn, drawMap: _drawMap };
}

// ─── 核心生成函数 ──────────────────────────────────────────────────────────────

/**
 * 生成美化二维码，返回 Base64 DataURL（PNG）。
 *
 * @example
 * const url = await generateQRCode({
 *   value: 'https://wetools.cc',
 *   template: 'water',
 *   foregroundColor: '#6366f1,#ec4899',
 *   size: 400,
 * });
 */
export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const {
    value,
    size = 400,
    level = 'M',
    template = 'default',
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    innerColor = '',
    outerColor = '',
    logo = '',
    foregroundImage = '',
    backgroundImage = '',
    text = '',
    textColor = '',
    textStroke = '',
  } = options;

  if (!value) return '';

  const { qrcodeFn, drawMap } = await ensureModules();

  // Logo 存在时纠错等级强制升为 H
  const ecLevel = logo ? 'H' : level;
  const data = qrcodeFn(value, ecLevel);

  const canvas = document.createElement('canvas');
  canvas.width  = size * 2; // 2x 高清
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d')!;

  const drawFn = drawMap[template] ?? drawMap['default'];

  return new Promise<string>((resolve) => {
    // draw 函数内部用 Promise（imageReady），需要在图片加载完成后 canvas 已绘制完毕
    // 通过 MutationObserver / requestAnimationFrame 等待绘制完成
    const drawOptions = {
      foregroundColor,
      backgroundColor,
      innerColor,
      outerColor,
      logo,
      foregroundImage,
      backgroundImage,
      text,
      textColor,
      textStroke,
    } as Record<string, string>;

    // draw 函数是异步的（内部有 imageReady Promise），但没有返回 Promise
    // 用 setTimeout 在微任务队列清空后读取 canvas
    drawFn(ctx, data, drawOptions);

    // 等待所有图片加载完成（imageReady 内部 Promise.all）
    // 最长等待 3 秒，之后直接导出当前状态
    const startTime = Date.now();
    function tryExport() {
      // 检测 canvas 是否有像素（非全透明/全白即认为已绘制）
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let hasContent = false;
      // 采样检查是否有非背景色像素
      for (let i = 0; i < pixels.length; i += 4 * 50) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
        if (a > 0 && !(r === 255 && g === 255 && b === 255)) {
          hasContent = true;
          break;
        }
      }
      if (hasContent || Date.now() - startTime > 3000) {
        // 若有 Logo，在 logo 四周绘制白色渐变过渡，logo 本身裁剪为圆角
        if (logo) {
          const logoSize = Math.ceil(canvas.width / 4);
          const lx = (canvas.width - logoSize) / 2;
          const ly = (canvas.height - logoSize) / 2;
          const fadeSize = Math.ceil(canvas.width / 60);       // 渐变宽度
          const radius   = Math.ceil(logoSize * 0.08);          // logo 圆角半径（小圆角）

          // 圆角矩形路径
          function roundRect(x: number, y: number, w: number, h: number, r: number) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y,     x + w, y + r,     r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x,     y + h, x,     y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x,     y,     x + r, y,          r);
            ctx.closePath();
          }

          // 1. 先保存 logo 区域像素
          const logoPixels = ctx.getImageData(lx, ly, logoSize, logoSize);

          // 2. 在扩展区域用径向渐变（中心白→边缘透明）绘制过渡晕圈
          //    使用一个稍大的矩形区域，四条边各画渐变条
          const ex = lx - fadeSize, ey = ly - fadeSize;
          const ew = logoSize + fadeSize * 2, eh = logoSize + fadeSize * 2;

          ctx.save();
          // 用扩展圆角矩形作为 clip，防止渐变溢出
          roundRect(ex, ey, ew, eh, radius + fadeSize);
          ctx.clip();

          // 上
          { const g = ctx.createLinearGradient(0, ey, 0, ly);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = g; ctx.fillRect(ex, ey, ew, fadeSize); }
          // 下
          { const g = ctx.createLinearGradient(0, ly + logoSize, 0, ey + eh);
            g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g; ctx.fillRect(ex, ly + logoSize, ew, fadeSize); }
          // 左
          { const g = ctx.createLinearGradient(ex, 0, lx, 0);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = g; ctx.fillRect(ex, ly, fadeSize, logoSize); }
          // 右
          { const g = ctx.createLinearGradient(lx + logoSize, 0, ex + ew, 0);
            g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g; ctx.fillRect(lx + logoSize, ly, fadeSize, logoSize); }
          // 中间纯白底（logo 区域本身）
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.fillRect(lx, ly, logoSize, logoSize);

          ctx.restore();

          // 3. 将 logo 以圆角矩形 clip 绘制回去
          ctx.save();
          roundRect(lx, ly, logoSize, logoSize, radius);
          ctx.clip();
          // 用临时 canvas 绘制 logo 像素再贴回
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = logoSize; tmpCanvas.height = logoSize;
          tmpCanvas.getContext('2d')!.putImageData(logoPixels, 0, 0);
          ctx.drawImage(tmpCanvas, lx, ly, logoSize, logoSize);
          ctx.restore();
        }
        resolve(canvas.toDataURL('image/png'));
      } else {
        requestAnimationFrame(tryExport);
      }
    }
    requestAnimationFrame(tryExport);
  });
}

/**
 * 将 DataURL 触发浏览器下载。
 *
 * @param dataUrl  Base64 DataURL
 * @param filename 文件名（默认 'qrcode.png'）
 */
export function downloadQRCode(dataUrl: string, filename = 'qrcode.png'): void {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
