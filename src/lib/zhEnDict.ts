/**
 * 中文 → 英文术语字典
 *
 * 用于全局 DOM 扫描（GlobalI18n.vue / useToolI18n.ts）时把页面中的中文整段/词组替换为英文。
 *
 * 维护规则（重要 — 新增/修改工具时必须遵守）：
 *   1. 工具内任何中文 UI 文案（按钮、label、placeholder、提示、错误、占位符等）
 *      在写入 Tool.vue 后，**必须**同步把对应中文短语加入本字典。
 *   2. 优先匹配长字符串，因此本文件采用按 key 长度降序的匹配策略 —— 较长短语先加。
 *   3. 短语应尽量「自成一体」，避免动态拼接（如 `第 ${n} 行`），优先把整句加入。
 *      若必须动态拼接，需把拼接的「中文部分」全部纳入字典（如 `第`、`行`、`列`）。
 *   4. 严禁删除既有 key —— 删除可能破坏其他工具的翻译。
 *   5. zh-TW 由 OpenCC 自动转换，无需在此维护；本字典仅服务 en 模式。
 */
export const zhToEnDict: Record<string, string> = {
  // ============================================================
  // —— 站点 UI 与文案 ——
  // ============================================================
  // 首页 Hero
  '100% 本地运行 · 不上传任何数据': '100% local · zero data upload',
  // 主标题被渐变 <span> 切成两段：'程序员的' + '浏览器工具箱'
  '程序员的': "A Developer's ",
  '浏览器工具箱': 'Browser Toolbox',
  '常用开箱即用的开发者工具：JSON、Base64、加密哈希、二维码、时间戳、正则、图片压缩…… 全部在你的浏览器本地完成，开源、免费、无追踪。':
    'Common ready-to-use developer tools: JSON, Base64, hash, QR, timestamp, regex, image compression… all in your browser, open-source, free, no tracking.',
  // 旧 Hero 文案（保留向后兼容，避免其他地方残留时无法翻译）
  '数据 100% 本地处理': 'Data is 100% processed locally',
  '开发者浏览器工具箱': 'Developer Browser Toolbox',
  '开发者': 'Developer',
  '个常用工具，无需安装、无需注册、数据不离开你的设备。开源免费。':
    ' essential tools, no install, no signup, your data never leaves your device. Free & open source.',
  '我的收藏': 'My Favorites',
  '常用工具一键直达': 'Your most-used tools, one click away',
  '快捷搜索': 'Quick search',
  // 收藏空状态（两行结构，第二行图标会切断 <p> 内部文本节点）
  '还没有收藏任何工具': 'No favorites yet',
  '点击工具卡片右上角的': 'Click the',
  '即可收藏': 'on a tool card to add it',
  '最近使用': 'Recent',
  '收藏': 'Favorites',
  '搜索工具…': 'Search tools…',
  '没有匹配的工具': 'No matches',
  '搜索结果': 'Results',
  '关于': 'About',
  '本地处理': 'Runs locally',
  '调用外部 API': 'Uses external API',

  // ============================================================
  // —— /about 页 ——
  // ============================================================
  '关于 WeTools': 'About WeTools',
  'WeTools 是一个面向程序员的开源在线工具合集。它把那些每天都会用到的小工具':
    'WeTools is an open-source collection of online tools for programmers. It gathers everyday-use utilities',
  '集中在一个干净、快速、可信的站点里——所有计算都跑在你的浏览器里，无需登录、无需上传。':
    'in one clean, fast, trustworthy site — all computation runs in your browser, no signup, no upload.',
  '隐私承诺': 'Privacy promise',
  '技术栈': 'Tech stack',
  '参与贡献': 'Contributing',
  // 隐私承诺 li 的文本（被 <span class="badge"> 切断）
  '所有标注': 'All tools labeled as',
  '的工具，输入数据从不离开你的浏览器。': '— your input never leaves the browser.',
  '少数工具（如 IP 查询）必须调用第三方公开接口，会显式标注':
    'A few tools (such as IP Lookup) must call third-party public APIs, and are explicitly marked as',
  '并说明请求内容。': 'with details about the request.',
  'WeTools 没有后端服务、没有埋点、没有 Cookie 跟踪。':
    'WeTools has no backend, no analytics, and no cookie tracking.',
  // 技术栈段
  'Astro 4（SSG）+ Vue 3 岛屿 + TypeScript + Tailwind CSS，':
    'Astro 4 (SSG) + Vue 3 islands + TypeScript + Tailwind CSS, ',
  '通过插件化架构使新增一个工具的成本接近零。所有重型库按需懒加载，首页仅有几 KB JS。':
    'with a plug-in architecture that makes adding a new tool near-zero cost. Heavy libs are lazy-loaded; the home page ships only a few KB of JS.',
  // 参与贡献段（被 <code> 切断，<code> 默认会被 GlobalI18n skip，无需翻译代码内容）
  '欢迎提交工具或改进现有工具，复制': 'Submissions and improvements are welcome. Copy',
  '即可开始。': ' to get started.',

  // ============================================================
  // —— 404 页 ——
  // ============================================================
  '页面没找到': 'Page not found',
  '你想访问的页面可能已被移除，或链接拼写有误。从下面继续探索吧。':
    'The page you tried to open may have been removed, or the link is mistyped. Keep exploring below.',
  '搜索工具': 'Search tools',

  // ============================================================
  // —— SiteHeader / 导航 ——
  // ============================================================
  '分类导航': 'Category navigation',
  'WeTools 首页': 'WeTools home',

  // ============================================================
  // —— SiteFooter / CommandPalette ——
  // ============================================================
  '· 开源 · 本地运行': ' · Open source · Runs locally',
  // CommandPalette "共匹配 N 个工具" 三个文本节点（不用单字 '共' 避免误伤）
  '共匹配': 'Found',
  '个工具': 'tools',

  // ============================================================
  // —— <head> 的 title / meta description（BaseLayout 默认 + about/404 传入）
  //     由 GlobalI18n.applyHeadMeta() 翻译
  // ============================================================
  'WeTools — 程序员的浏览器工具箱': 'WeTools — A Developer Toolbox in Your Browser',
  '40+ 个程序员常用在线工具：JSON 格式化、Base64、加密哈希、二维码、时间戳、正则、图片压缩…… 全部在你的浏览器本地运行，不上传任何数据。':
    '40+ everyday tools for developers: JSON, Base64, hash, QR, timestamp, regex, image compression… all run locally in your browser, no upload.',
  '关于 · WeTools': 'About · WeTools',
  'WeTools 是一个专为开发者打造的浏览器工具箱，所有工具在浏览器本地运行。':
    'WeTools is a browser-based toolbox built for developers; every tool runs locally in your browser.',
  '404 · WeTools': '404 · WeTools',
  // tool 页 title 模板 `${tool zh title} · WeTools` 中的 "· WeTools" 不需要翻译，
  // 工具中文 title 由 registry 自动注入字典完成替换。
  '相关工具': 'Related tools',
  '开源 · 本地运行': 'Open source · Runs locally',
  '开发中': 'In development',
  '此分类即将上线，敬请期待': 'This category is coming soon — stay tuned',
  '复制链接': 'Copy link',
  '已复制': 'Copied',
  '复制': 'Copy',
  '清空': 'Clear',
  '取消收藏': 'Unfavorite',
  '切换主题': 'Toggle theme',
  '切换语言': 'Change language',
  '打开菜单': 'Open menu',
  '首页': 'Home',
  '加载工具中…': 'Loading…',
  '选择': 'navigate',
  '打开': 'open',
  '关闭': 'close',
  // '项' 单字易误伤普通文本（如"项目"、"事项"），不收。CommandPalette 中 `N 项` 可在显示前转为 `N tools`


  // ============================================================
  // —— 通用动作 / 按钮 / 状态 ——
  // ============================================================
  '编码 / 解码': 'Encode / Decode',
  '编码': 'Encode',
  '解码': 'Decode',
  '加密': 'Encrypt',
  '解密': 'Decrypt',
  '压缩': 'Minify',
  '美化': 'Beautify',
  '格式化': 'Format',
  '校验': 'Validate',
  '转义': 'Escape',
  '反转义': 'Unescape',
  '转义字符串': 'Escape as string',
  '反转': 'Reverse',
  '反转字符': 'Reverse chars',
  '反转行': 'Reverse lines',
  '去重': 'Deduplicate',
  '去重（保留首次）': 'Deduplicate (keep first)',
  '去空行': 'Remove blank lines',
  '随机打乱': 'Shuffle',
  '排序': 'Sort',
  '排序 ASC': 'Sort ASC',
  '排序 DESC': 'Sort DESC',
  '按行': 'By line',
  '按词': 'By word',
  '交换': 'Swap',
  '交换输入/输出': 'Swap input/output',
  '加行号': 'Add line numbers',
  '生成': 'Generate',
  '重新生成': 'Regenerate',
  '上传': 'Upload',
  '下载': 'Download',
  '下载图片': 'Download image',
  '下载 PNG': 'Download PNG',
  '粘贴': 'Paste',
  '导入': 'Import',
  '导出': 'Export',
  '导入文件': 'Import file',
  '保存': 'Save',
  '删除': 'Delete',
  '添加': 'Add',
  '新增': 'Add',
  '应用': 'Apply',
  '重置': 'Reset',
  '取消': 'Cancel',
  '确定': 'OK',
  // 注意：'关闭' 已在站点 UI 段定义为 lowercase 'close'（CommandPalette 用），此处不再覆盖
  '选择文件': 'Choose file',
  '使用当前浏览器': 'Use current browser',
  '使用新参数重压': 'Re-compress with new params',
  '全部清除': 'Clear all',
  '复制全部': 'Copy all',
  '复制 HTML': 'Copy HTML',
  '复制输入': 'Copy input',
  '复制输出': 'Copy output',
  '填入当前': 'Fill current',
  '查询': 'Query',
  '查询中…': 'Querying…',
  '识别中…': 'Recognizing…',
  '压缩中…': 'Compressing…',
  '计算': 'Compute',
  '正在计算…（大文件会读入内存，仅在浏览器本地处理）':
    'Computing… (large files are read into memory; runs locally in browser)',
  '加载中…': 'Loading…',

  // ============================================================
  // —— 输入 / 输出 / 字段标签 ——
  // ============================================================
  '输入': 'Input',
  '输出': 'Output',
  '原文输入': 'Original input',
  '输入文本': 'Input text',
  '输入颜色': 'Input color',
  '输入值': 'Input value',
  '输入进制': 'Input base',
  '自定义输出进制': 'Custom output base',
  '输入要哈希的文本…': 'Text to hash…',
  '输入要编码的文本…': 'Text to encode…',
  '输入文字或链接…': 'Enter text or URL…',
  '输入任意标识符或短语…': 'Enter any identifier or phrase…',
  '输入内容以生成': 'Enter content to generate',
  '搜索类名 / CSS / 分组…': 'Search class / CSS / group…',
  '留空查询本机；或输入指定 IP': 'Leave blank for current IP, or enter specific IP',
  '支持秒或毫秒，自动识别': 'Supports seconds or milliseconds, auto-detect',
  '支持负数；进制由右侧选择': 'Supports negative, base on the right',
  '粘贴 JSON…': 'Paste JSON…',
  '粘贴 JWT…': 'Paste JWT…',
  '粘贴 Base64 字符串…': 'Paste Base64 string…',
  '替换字符串，支持 $1 $2 $<name>': 'Replacement, supports $1 $2 $<name>',
  '例如：*/15 9-18 * * MON-FRI': 'e.g.: */15 9-18 * * MON-FRI',
  '如 Asia/Hong_Kong': 'e.g. Asia/Hong_Kong',
  '口令（PBKDF2 派生 256 位密钥，10 万次迭代）':
    'Passphrase (PBKDF2-derived 256-bit key, 100k iterations)',
  '使用 PBKDF2-SHA256 派生 256 位密钥，10 万次迭代。':
    'Uses PBKDF2-SHA256 to derive a 256-bit key, 100k iterations.',

  // ============================================================
  // —— 错误 / 提示 / 状态 ——
  // ============================================================
  '结果将显示在这里': 'Results will appear here',
  '未识别到内容': 'No content detected',
  '未识别到二维码，可尝试更清晰、更居中的图片':
    'No QR code detected; try a clearer, more centered image',
  '本地识别，不上传任何数据': 'Recognized locally, no data uploaded',
  '识别结果': 'Recognition result',
  '图片加载失败': 'Image failed to load',
  '无效': 'Invalid',
  '无效时区': 'Invalid timezone',
  '无法解析的 Cron 表达式': 'Invalid Cron expression',
  '无法解析的颜色：': 'Invalid color: ',
  '解密失败：密钥或数据有误': 'Decryption failed: invalid key or data',
  '输入不是合法的 Base64 字符串': 'Input is not a valid Base64 string',
  '编码失败': 'Encoding failed',
  'Hex 长度不是偶数': 'Hex length is not even',
  '期望对象数组（[{...}, ...]）': 'Expected an array of objects ([{...}, ...])',
  '解析失败': 'Parse failed',
  '请输入 cURL 命令': 'Please enter a cURL command',
  '未找到 URL': 'URL not found',
  'API 返回错误': 'API returned an error',
  '查询失败：': 'Query failed: ',
  '请至少选择一种字符集': 'Please choose at least one character set',
  '请选择图片': 'Please choose an image',
  '拖入图片 / 点击选择': 'Drop an image / click to choose',
  '拖入图片 / 点击选择 / Ctrl+V 粘贴': 'Drop image / click to choose / Ctrl+V paste',
  '拖入或选择多张图片': 'Drop or choose multiple images',
  '支持 PNG / JPG / WebP，本地压缩': 'Supports PNG / JPG / WebP, compressed locally',
  '输入不是有效时间戳': 'Input is not a valid timestamp',
  '日期格式无效': 'Invalid date format',
  '日期时间格式无效': 'Invalid datetime format',
  '没有匹配的 utility': 'No matching utility',
  '本工具只解码不验证签名（验签需要服务端密钥）。粘贴线上 token 时请注意泄漏风险。':
    'This tool only decodes JWTs and does NOT verify signatures (verification requires server key). Be careful when pasting production tokens.',
  'JWT 必须包含 3 段（用 . 分隔）': 'JWT must have 3 segments (separated by ".")',
  'Base64Url 或 JSON 解析失败：': 'Base64Url or JSON parse failed: ',
  // JSON 格式化的错误位置提示是动态拼接 `位置：第 X 行，第 Y 列`，整段处理 + 留尾词
  '位置：第': 'Position: line ',
  ' 行，第 ': ', column ',
  ' 列': '',
  ' 行（非空）': ' lines (non-empty)',
  ' 字符（去空白 ': ' chars (no whitespace ',
  '解析结果': 'Parsed result',
  '本地': 'Local',
  '相对': 'Relative',

  // ============================================================
  // —— 通用术语 / 单位 / 字段 ——
  // ============================================================
  '字符串 → Hex': 'String → Hex',
  'Hex → 字符串': 'Hex → String',
  '字符串': 'String',
  '大写': 'Uppercase',
  '大写输出': 'Uppercase output',
  '小写': 'Lowercase',
  '空格': 'Space',
  '连续': 'Continuous',
  '逗号': 'Comma',
  '分号': 'Semicolon',
  '竖线': 'Pipe',
  '分隔符': 'Separator',
  '换行': 'Newline',
  '制表符': 'Tab',
  '缩进': 'Indent',
  '小写字母': 'Lowercase letters',
  '大写字母': 'Uppercase letters',
  '数字': 'Numbers',
  '数字 / 非数字': 'Digit / non-digit',
  '字母数字下划线 / 反之': 'Word char / non-word char',
  '空白 / 非空白': 'Whitespace / non-whitespace',
  '行首 / 行尾': 'Line start / line end',
  '量词': 'Quantifier',
  '捕获组 / 非捕获组': 'Capture group / non-capture group',
  '正/负向先行': 'Positive / negative lookahead',
  '任意字符（不含换行）': 'Any char (no newline)',
  'flags：全局/忽略大小写/多行/dotAll/unicode/sticky':
    'flags: global / ignore case / multiline / dotAll / unicode / sticky',
  '符号': 'Symbols',
  '字符集': 'Charset',
  '长度': 'Length',
  '数量': 'Count',
  // '位' 单字易误伤（位置/几位），不收；常见的"256 位密钥"在上方整段 PBKDF2 提示中已覆盖
  '字节': 'bytes',
  '密码': 'Password',
  '密钥': 'Key',
  '算法': 'Algorithm',
  '模式': 'Mode',
  '格式：': 'Format: ',
  '格式': 'Format',
  '类型': 'Type',
  '语言': 'Language',
  '时区': 'Timezone',
  '日期': 'Date',
  '时间': 'Time',
  '当前': 'Current',
  '当前时间': 'Current time',
  '本地时间': 'Local time',
  '添加时区': 'Add timezone',
  '时间戳 → 日期': 'Timestamp → Date',
  '日期 → 时间戳': 'Date → Timestamp',
  '现在': 'Now',
  '文件': 'File',
  '图片': 'Image',
  '二维码': 'QR Code',
  '颜色': 'Color',
  '宽度': 'Width',
  '高度': 'Height',
  '尺寸': 'Size',
  '质量': 'Quality',
  '错误': 'Error',
  '成功': 'Success',
  '警告': 'Warning',
  '提示': 'Tip',
  '说明': 'Description',
  '示例': 'Example',
  '预览': 'Preview',
  '预览（已 sanitize）': 'Preview (sanitized)',
  '原文': 'Original',
  '原文 A': 'Original A',
  '新文 B': 'New B',
  '结果': 'Result',
  '差异': 'Diff',
  '相同': 'Identical',
  '不同': 'Different',
  '字符': 'Character',
  '单词': 'Word',
  '字数': 'Word count',
  '总数': 'Total',
  '匹配数': 'Matches',
  '匹配': 'Match',
  '高亮匹配': 'Highlight matches',
  '分组提取': 'Group capture',
  '替换预览': 'Replace preview',
  '附常见正则速查': 'Includes regex cheatsheet',
  '正则表达式': 'Regular expression',
  '高亮匹配、分组提取、替换预览，附常见正则速查。':
    'Highlight matches, group capture, replace preview. Includes regex cheatsheet.',
  '正则测试器': 'Regex Tester',
  '替换': 'Replace',
  '替换结果': 'Replace result',
  '速查表': 'Cheatsheet',
  '捕获组': 'Capture group',
  '命名组': 'Named group',
  '匹配预览': 'Match preview',
  '原文输入 ': 'Original input ',
  '组件': 'Components',
  '查询参数': 'Query params',
  '字段': 'Fields',
  '条记录': ' records',
  '条结果': ' results',
  '个数': ' items',
  '张图片': ' images',
  '共生成': 'Generated ',
  // '条' 单字易误伤（条件/条目），不收
  '中文': 'Chinese',

  // ============================================================
  // —— 时间 / 日期相对 ——
  // 注意：单字单位（秒/分/天/年）非常容易误伤普通文本，
  // 此处统一把组合短语（如 ` 秒后`、`5 秒前`、`3 天后` 等出现形式）整段加入字典。
  // 仅保留"前导空格 + 单位"形式，避免误伤如「今年」「每秒一次」等普通词。
  // ============================================================
  ' 秒后': ' sec from now',
  ' 秒前': ' sec ago',
  ' 分钟后': ' min from now',
  ' 分钟前': ' min ago',
  ' 小时后': ' hr from now',
  ' 小时前': ' hr ago',
  ' 天后': ' days from now',
  ' 天前': ' days ago',
  ' 个月后': ' months from now',
  ' 个月前': ' months ago',
  ' 年后': ' years from now',
  ' 年前': ' years ago',
  '毫秒': 'ms',

  // ============================================================
  // —— 工具内 placeholder / 提示 ——
  // ============================================================
  '一个时间，多地查看；支持自定义时区列表。':
    'One time, many places. Custom timezone list.',
  '上传或拖入图片，识别其中的二维码内容。':
    'Upload or drop an image to decode its QR content.',
  '人类可读描述 + 接下来 N 次执行时间。':
    'Human-readable description + next N executions.',
  '复制此目录即可新增一个工具。': 'Copy this directory to add a new tool.',
  '人类可读描述': 'Human-readable description',
  '下次执行时间（前 8 次）': 'Next executions (first 8)',

  // ============================================================
  // —— Cron 预设 ——
  // ============================================================
  '每 5 分钟': 'Every 5 min',
  '每小时整点': 'Hourly (on the hour)',
  '每天 09:00': 'Daily 09:00',
  '每周一 09:00': 'Every Monday 09:00',
  '每月 1 号 0:00': '1st of month 0:00',
  '每年 1 月 1 日': 'Yearly Jan 1',

  // ============================================================
  // —— AES / Hash / JWT ——
  // ============================================================
  '文本': 'Text',
  '标准声明': 'Standard claims',
  'iat (签发时间)': 'iat (issued at)',
  'exp (过期时间)': 'exp (expires)',
  'nbf (生效时间)': 'nbf (not before)',
  'iss (签发者)': 'iss (issuer)',
  'aud (受众)': 'aud (audience)',
  'sub (主体)': 'sub (subject)',
  'jti (Token ID)': 'jti (Token ID)',

  // ============================================================
  // —— IP Lookup 字段 ——
  // ============================================================
  '版本': 'Version',
  '国家': 'Country',
  '地区': 'Region',
  '城市': 'City',
  '邮编': 'Postal code',
  '经纬度': 'Lat / Lng',
  'UTC 偏移': 'UTC offset',
  '运营商': 'ISP',
  '货币': 'Currency',
  '原始 JSON': 'Raw JSON',

  // ============================================================
  // —— Password ——
  // ============================================================
  '大写字母 A-Z': 'Uppercase A-Z',
  '小写字母 a-z': 'Lowercase a-z',
  '数字 0-9': 'Digits 0-9',
  '符号 !@#$…': 'Symbols !@#$…',
  '排除易混淆字符（0O1lI|）': 'Exclude ambiguous chars (0O1lI|)',

  // ============================================================
  // —— UUID ——
  // ============================================================
  'UUID v4': 'UUID v4',
  '去掉短横': 'Remove dashes',

  // ============================================================
  // —— Lorem ——
  // ============================================================
  '段落': 'Paragraphs',
  '句子': 'Sentences',
  '首段以 Lorem ipsum 起头': 'Start first paragraph with Lorem ipsum',

  // ============================================================
  // —— Random ——
  // ============================================================
  '最小值': 'Min',
  '最大值': 'Max',
  '小数位': 'Decimals',
  '整数': 'Integer',
  '小数': 'Decimal',
  '不重复': 'Unique',
  '每行一个': 'One per line',

  // ============================================================
  // —— Text Diff / Text Utils ——
  // ============================================================
  '忽略大小写': 'Ignore case',
  '忽略空白': 'Ignore whitespace',
  'Trim 每行': 'Trim each line',

  // ============================================================
  // —— Number base / CSS units / Image / QR ——
  // ============================================================
  '输入值（px）': 'Input value (px)',
  '根字号 (px)': 'Root font size (px)',
  '视口宽 (px)': 'Viewport width (px)',
  '视口高 (px)': 'Viewport height (px)',
  '最大文件大小 (MB)': 'Max file size (MB)',
  '最大边长 (px)': 'Max edge (px)',
  '容错率': 'Error correction',
  '尺寸 (px)': 'Size (px)',
  '边距': 'Margin',
  '前景色': 'Foreground',
  '背景色': 'Background',
  // '省' 单字易误伤（省份/省略），不收
  'CSS 示例': 'CSS example',
  '内容': 'Content',
  '根接口名': 'Root interface name',

  // ============================================================
  // —— JSON CSV / YAML / TS ——
  // ============================================================
  'JSON → CSV': 'JSON → CSV',
  'CSV → JSON': 'CSV → JSON',
  'JSON → YAML': 'JSON → YAML',
  'YAML → JSON': 'YAML → JSON',
  'JSON 输入': 'JSON input',
  'Base64 输入': 'Base64 input',
  'Base64 输出': 'Base64 output',
  '解码结果': 'Decoded result',

  // ============================================================
  // —— Markdown ——
  // ============================================================
  // 见上方"预览（已 sanitize）"

  // ============================================================
  // —— Tailwind cheatsheet ——
  // ============================================================
  '布局': 'Layout',
  '间距': 'Spacing',
  '排版': 'Typography',
  '边框': 'Border',
  '环形阴影': 'Ring',
  '效果': 'Effects',
  '柔和阴影': 'Soft shadow',
  '动画': 'Animation',
  '渐显动画 200ms': 'Fade-in 200ms',
  '定位': 'Position',
  '响应式': 'Responsive',
  'sm 显示，md 隐藏': 'show at sm, hide at md',
  'lg 屏幕 grid 3 列': '3-col grid at lg',
  '状态': 'State',
  'hover 时背景': 'background on hover',
  '键盘聚焦环': 'keyboard focus ring',
  '父级 hover 时变色（父级须 group）': 'color on parent hover (parent needs `group`)',
  '暗色模式背景': 'dark-mode background',

  // ============================================================
  // —— HTML entity ——
  // ============================================================
  '使用命名实体（&amp; / &lt; …）': 'Use named entities (&amp; / &lt; …)',
  '转义 & < > " \' 等 HTML 特殊字符。': 'Escape/unescape HTML special characters.',

  // ============================================================
  // —— Unicode escape ——
  // ============================================================
  '仅转义非 ASCII 字符': 'Only escape non-ASCII chars',

  // ============================================================
  // —— URL encode ——
  // ============================================================
  '整段 URI（保留 / : ? = & 等）': 'Whole URI (preserve / : ? = & ...)',

  // ============================================================
  // —— Base64 ——
  // ============================================================
  'URL Safe（- _ 替代 + /）': 'URL Safe (- _ instead of + /)',

  // ============================================================
  // —— _template ——
  // ============================================================
  '复制本目录为': 'Copy this directory as ',
  '并修改 index.ts 中的 meta 即可注册新工具。':
    ' and edit meta in index.ts to register a new tool.',

  // ============================================================
  // —— 分类名 ——
  // ============================================================
  // 当前 8 大分类（runtime dict 也会自动从 categories 注入，这里作为兜底）
  '常用': 'Popular',
  '编码/加密': 'Encoding & Crypto',
  '生成': 'Generators',
  '转换/格式化': 'Converter & Formatter',
  '文本处理': 'Text',
  'Web/网络': 'Web & Network',
  '速查': 'Cheatsheets',
  '检测': 'Detect',
  // 旧分类名（保留向后兼容，避免历史 Sidebar / 收藏中残留时无法翻译）
  '编码转换': 'Encoding',
  'JSON 与数据': 'JSON & Data',
  '加密哈希': 'Crypto & Hash',
  '时间日期': 'Date & Time',
  '生成器': 'Generators',
  '图像': 'Image',
  '开发速查': 'Dev Cheatsheet',
  '编码 & 加密': 'Encoding & Crypto',
  'JSON & 数据格式': 'JSON & Data',
  '文本工具': 'Text',
  'Web & 网络': 'Web & Network',
  '时间 & 数学': 'Time & Math',

  // ============================================================
  // —— 工具名（37 个）——
  // ============================================================
  'Base64 编解码': 'Base64 Encode/Decode',
  'URL 编解码': 'URL Encode/Decode',
  'HTML 实体编解码': 'HTML Entity Encode/Decode',
  'Hex / 字符串互转': 'Hex ↔ String',
  'Unicode 转义': 'Unicode Escape',
  'JSON 格式化 / 校验': 'JSON Format / Validate',
  'JSON ↔ YAML': 'JSON ↔ YAML',
  'JSON ↔ CSV': 'JSON ↔ CSV',
  'JSON → TypeScript': 'JSON → TypeScript',
  'Hash 计算': 'Hash',
  'AES 加解密': 'AES Encrypt/Decrypt',
  'JWT 解析': 'JWT Parser',
  'Unix 时间戳': 'Unix Timestamp',
  'Cron 解析': 'Cron Parser',
  '时区换算': 'Timezone Converter',
  'UUID / NanoID': 'UUID / NanoID',
  '随机密码': 'Random Password',
  '随机数': 'Random Number',
  'Lorem Ipsum': 'Lorem Ipsum',
  'Mock 假数据': 'Mock Data',
  '二维码生成': 'QR Generate',
  '二维码识别': 'QR Decode',
  '图片压缩': 'Image Compress',
  '图片 ↔ Base64': 'Image ↔ Base64',
  '文本 Diff': 'Text Diff',
  'Markdown 预览': 'Markdown Preview',
  '大小写 / 命名转换': 'Case Convert',
  '文本工具集': 'Text Utilities',
  '正则测试': 'Regex Test',
  'IP 查询': 'IP Lookup',
  'UA 解析': 'UA Parser',
  'cURL 转代码': 'cURL to Code',
  'URL 解析': 'URL Parser',
  '颜色转换': 'Color Convert',
  'CSS 单位换算': 'CSS Units',
  '进制转换': 'Number Base',
  'Tailwind 速查': 'Tailwind Cheatsheet',

  // ============================================================
  // —— 工具描述（37 个）——
  // ============================================================
  '文本与 Base64 互转，支持 UTF-8 与 URL Safe 模式。':
    'Encode/decode Base64 with UTF-8 & URL-safe modes.',
  'encodeURIComponent / decodeURIComponent，按行批量处理。':
    'Encode/decode URI components, line-batch supported.',
  '十六进制与字符串互转，支持空格分隔与大小写。':
    'Convert between hex and UTF-8 strings.',
  '\\uXXXX 与原文互转，支持非 BMP 代理对。':
    'Convert between text and \\uXXXX escapes (incl. surrogate pairs).',
  '美化、压缩、转义 JSON，错误定位精确到行列。':
    'Beautify, minify, escape JSON with precise error location.',
  '美化、压缩、转义 JSON，错误位置精确提示。':
    'Beautify, minify, escape JSON with precise error position.',
  '在 JSON 与 YAML 之间互转，支持复杂结构。':
    'Convert between JSON and YAML, complex structures supported.',
  '对象数组与 CSV 互转，可选分隔符、引号策略。':
    'Convert between JSON arrays and CSV, configurable separator.',
  '从任意 JSON 生成 TypeScript Interface / Type 定义。':
    'Generate TypeScript interfaces / types from any JSON.',
  'MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512，支持文本与文件。':
    'MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 for text and files.',
  'Web Crypto AES-GCM / AES-CBC，自动派生密钥，输出 Base64。':
    'AES-GCM / AES-CBC via Web Crypto, auto key derivation, Base64 output.',
  '解析 JWT 三段：Header / Payload / Signature。':
    'Parse JWT into Header / Payload / Signature.',
  '秒/毫秒时间戳与日期互转，覆盖多时区。':
    'Convert between Unix timestamp and date, multiple timezones.',
  '解析 Cron 表达式并计算未来 N 次执行时间。':
    'Parse Cron expressions, preview next N runs.',
  '查询当前公网 IP 与归属地（调用第三方公开 API）。':
    'Look up your public IP via ipapi (calls a third-party API).',

  // ============================================================
  // —— 新增 11 个工具 ——
  // ============================================================
  // HTTP 状态码
  '搜索状态码 / 名称 / 描述…': 'Search code / name / description…',
  '没有匹配的状态码': 'No matching status codes',
  '1xx 信息': '1xx Informational',
  '2xx 成功': '2xx Success',
  '3xx 重定向': '3xx Redirection',
  '4xx 客户端错误': '4xx Client Error',
  '5xx 服务端错误': '5xx Server Error',
  '全部': 'All',

  // ASCII
  '搜索：10、0A、LF、A、Tab…': 'Search: 10, 0A, LF, A, Tab…',
  '控制字符': 'Control chars',
  '可打印': 'Printable',
  '没有匹配的字符': 'No matching characters',

  // HMAC
  '输入 HMAC 密钥…': 'Enter HMAC key…',
  '输入要签名的消息…': 'Message to sign…',
  '消息': 'Message',
  'HMAC 输出': 'HMAC output',
  '使用 Web Crypto API 计算，密钥与消息均按 UTF-8 编码，全部在浏览器本地完成。':
    'Computed via Web Crypto API; key & message in UTF-8; all done locally in your browser.',

  // DES
  '密钥（DES 需 8 字节，3DES 需 16 或 24 字节）':
    'Key (DES requires 8 bytes, 3DES requires 16 or 24 bytes)',
  'IV（CBC 模式必填，8 字节）': 'IV (required for CBC, 8 bytes)',
  'UTF-8 字节': 'UTF-8 bytes',
  'DES / 3DES 已被 NIST 标记为遗留算法（不再推荐用于新系统）。本工具仅用于兼容老接口调试，强加密请使用 AES。':
    'DES / 3DES are NIST-deprecated legacy algorithms. Use this only for compatibility; prefer AES for new systems.',

  // RSA
  '生成密钥对': 'Generate keypair',
  '使用公钥加密': 'Encrypt with public key',
  '使用私钥解密': 'Decrypt with private key',
  '公钥 (SPKI / PEM)': 'Public key (SPKI / PEM)',
  '私钥 (PKCS8 / PEM)': 'Private key (PKCS8 / PEM)',
  '明文': 'Plaintext',
  '密文 (Base64)': 'Ciphertext (Base64)',
  '使用 Web Crypto API RSA-OAEP。注意：RSA 加密长度受密钥长度限制（2048 位约 200 字节明文），适合加密小数据或对称密钥。':
    'Uses Web Crypto RSA-OAEP. Note: RSA encrypt length is limited by key size (~200 bytes for 2048-bit); best for small data or symmetric keys.',

  // JSON ↔ XML
  '根元素名（JSON → XML）': 'Root element (JSON → XML)',
  '粘贴 XML…': 'Paste XML…',

  // JSON → Go
  '根 struct 名': 'Root struct name',
  '嵌套用指针': 'Pointer for nested',
  '添加 omitempty': 'Add omitempty',
  'Go Struct': 'Go Struct',
  '类型推断：整数 → int64，小数 → float64，对象数组取首元素结构，空数组退化为 []interface{}。':
    'Inference: int → int64, float → float64, object arrays use the first element, empty arrays fall back to []interface{}.',

  // JSON → Proto
  '根 message 名': 'Root message name',
  'Protobuf 3': 'Protobuf 3',
  '类型映射：整数 → int64，小数 → double，对象数组取首元素结构。字段名自动转 snake_case，tag 顺序生成。':
    'Mapping: int → int64, float → double, object arrays use the first element. Field names auto-convert to snake_case; tags are sequential.',

  // SQL 格式化
  '方言': 'Dialect',
  '关键字': 'Keywords',
  '保留': 'Preserve',
  '粘贴 SQL…': 'Paste SQL…',

  // SQL → Go
  'CREATE TABLE 语句': 'CREATE TABLE statements',
  '粘贴 CREATE TABLE…': 'Paste CREATE TABLE…',
  '添加 json tag': 'Add json tag',
  'json omitempty': 'json omitempty',
  '添加 gorm tag': 'Add gorm tag',
  '没有解析到 CREATE TABLE 语句': 'No CREATE TABLE statements parsed',
  '支持 MySQL 主流类型与 PostgreSQL 常见类型。tinyint(1) 视为 bool；nullable 列默认用指针；DATE/DATETIME 映射 time.Time。':
    'Supports common MySQL & PostgreSQL types. tinyint(1) → bool; nullable columns use pointers; DATE/DATETIME → time.Time.',

  // WebSocket
  '子协议（逗号分隔，可选）': 'Subprotocols (comma separated, optional)',
  '连接': 'Connect',
  '断开': 'Disconnect',
  '条日志': ' logs',
  '自动滚动': 'Auto scroll',
  '日志为空，连接后收发消息会出现在这里': 'No logs yet — send/receive messages after connecting',
  '发送消息': 'Send message',
  '要发送的文本…': 'Text to send…',
  '发送': 'Send',
  '使用浏览器原生 WebSocket，连接与消息全部在客户端处理，不经任何中转。':
    'Uses native browser WebSocket; all messages handled client-side with no relay.',
  '连接失败常见原因：① HTTPS 页面只能连 wss://（不能连 ws://）；② 远端服务暂时不可用；③ 公司网络/防火墙拦截 WebSocket；④ 跨域 CSP 限制。':
    'Common failure reasons: (1) HTTPS pages can only connect to wss:// (not ws://); (2) remote service temporarily down; (3) corporate network/firewall blocking WebSocket; (4) CSP restrictions.',
  '常用：': 'Presets: ',
  '连接错误（浏览器出于安全考虑不会暴露具体原因，常见情况见下方说明）':
    'Connection error (browsers do not expose the exact reason for security; see notes below)',
  '正常关闭': 'Normal closure',
  '端点离开': 'Endpoint going away',
  '协议错误': 'Protocol error',
  '数据类型不支持': 'Unsupported data',
  '未给出状态码': 'No status received',
  '异常关闭（TLS/网络断开或对端未发送 Close 帧）':
    'Abnormal closure (TLS/network dropped or no Close frame from peer)',
  '数据不一致（非 UTF-8）': 'Invalid frame payload (non-UTF-8)',
  '违反策略': 'Policy violation',
  '消息过大': 'Message too big',
  '需要扩展': 'Mandatory extension',
  '服务端内部错误': 'Internal server error',
  '服务重启中': 'Service restart',
  '稍后重试': 'Try again later',
  '网关错误': 'Bad gateway',
  'TLS 握手失败': 'TLS handshake failure',
  'URL 不能为空': 'URL cannot be empty',
  '只支持 ws:// 或 wss:// 协议': 'Only ws:// or wss:// is supported',
  '未连接，无法发送': 'Not connected, cannot send',
  '已连接': 'Connected',
  '连接中': 'Connecting',
  '已关闭': 'Closed',
  '未连接': 'Disconnected',

  // Placeholder Image
  '宽度 (px)': 'Width (px)',
  '高度 (px)': 'Height (px)',
  '字号 (0 = 自动)': 'Font size (0 = auto)',
  '渐变': 'Gradient',
  '背景色 ①': 'Background ①',
  '背景色 ②': 'Background ②',
  '文字色': 'Text color',
  '文字（留空使用尺寸）': 'Text (empty = use size)',
  '正方': 'Square',
  '横版': 'Landscape',
  '竖版': 'Portrait',
  '横幅': 'Banner',
  '头像': 'Avatar',
  '社交分享': 'Social share',
  '浅灰': 'Light gray',
  '深灰': 'Dark gray',
  '翠绿': 'Emerald',
  '海蓝': 'Blue',
  '玫红': 'Pink',
  '琥珀': 'Amber',
  '紫罗兰': 'Violet',
  '下载 SVG': 'Download SVG',
  '生成中…': 'Generating…',
  '重新渲染': 'Re-render',
  'SVG 源码': 'SVG source',
  'Data URL（<img src> / CSS background）': 'Data URL (<img src> / CSS background)',
  'CSS：': 'CSS: ',
  '在浏览器本地用 SVG 生成，PNG 由 Canvas 实时栅格化下载。无网络请求，无水印。':
    'Generated locally as SVG; PNG is rasterized via Canvas. No network requests, no watermark.',

  // === 批1：10 个工具 ===
  // 罗马数字
  '阿拉伯数字': 'Arabic numeral',
  '罗马数字': 'Roman numeral',
  '请输入 1 - 3999 之间的整数': 'Please enter an integer between 1 and 3999',
  '只能包含 M D C L X V I': 'Only M D C L X V I are allowed',
  '不是规范的罗马数字写法': 'Not a canonical Roman numeral',
  '常用示例': 'Common examples',
  '3999 (最大)': '3999 (max)',
  '罗马数字使用 7 个字母：I(1) V(5) X(10) L(50) C(100) D(500) M(1000)。支持范围 1 - 3999。':
    'Roman numerals use 7 letters: I(1) V(5) X(10) L(50) C(100) D(500) M(1000). Range: 1 - 3999.',

  // 温度
  '摄氏度': 'Celsius',
  '华氏度': 'Fahrenheit',
  '开尔文': 'Kelvin',
  '兰金度': 'Rankine',
  '列氏度': 'Réaumur',
  '牛顿度': 'Newton',
  '水的冰点 0 °C / 沸点 100 °C': 'Water freezes at 0 °C / boils at 100 °C',
  '人体体温 ≈ 98.6 °F': 'Human body ≈ 98.6 °F',
  '绝对零度 = 0 K': 'Absolute zero = 0 K',
  '美国工程界使用': 'Used in US engineering',
  '历史用，主要在欧洲': 'Historical, mainly Europe',
  '牛顿提出，已不常用': 'Proposed by Newton, rarely used',
  '常用温度': 'Common temperatures',
  '绝对零度': 'Absolute zero',
  '水冰点': 'Water freezing',
  '冰箱冷藏': 'Fridge',
  '室温': 'Room temp',
  '人体体温': 'Body temp',
  '水沸点': 'Water boiling',

  // 百分比
  '占比': 'Ratio',
  '涨跌幅': 'Change',
  '增减后值': 'Increase/decrease',
  '折扣': 'Discount',
  'A 是 B 的百分之几？': 'A is what percent of B?',
  '从 A 到 B 的变化幅度（正数=上涨，负数=下跌）': 'Change from A to B (positive = up, negative = down)',
  '数值 增加 / 减少 N% 后的结果': 'Value after increase / decrease by N%',
  '原价 - 折扣百分比 = 折后价 + 节省金额': 'Original - discount % = final price + savings',
  '原价': 'Original',
  '折扣 (%)': 'Discount (%)',
  '折后价': 'Final price',
  '节省': 'You save',

  // Chmod
  '所有者 (u)': 'Owner (u)',
  '所属组 (g)': 'Group (g)',
  '其他人 (o)': 'Other (o)',
  '读 read': 'read',
  '写 write': 'write',
  '执行 execute': 'execute',
  '常用预设': 'Common presets',
  '可执行文件 / 公共目录（rwxr-xr-x）': 'Executables / public dirs (rwxr-xr-x)',
  '普通文件（rw-r--r--）': 'Regular files (rw-r--r--)',
  '私密文件（rw-------）': 'Private files (rw-------)',
  '私密目录（rwx------）': 'Private dirs (rwx------)',
  '完全开放（不推荐）': 'Fully open (not recommended)',
  '只读（r--------）': 'Read-only (r--------)',

  // Keycode
  '按下键盘上的任意按键': 'Press any key on the keyboard',
  '历史记录': 'History',
  '标准': 'Standard',
  '左侧': 'Left',
  '右侧': 'Right',
  '数字键盘': 'Numpad',
  '注意：现代代码应使用': 'Note: modern code should use',
  '（语义）或': '(semantic) or',
  '（物理位置），': '(physical), ',
  '已废弃。': 'are deprecated.',

  // Basic Auth
  '用户名': 'Username',
  'Base64 凭证': 'Base64 credential',
  'Authorization 请求头': 'Authorization header',
  'JavaScript fetch': 'JavaScript fetch',
  'Basic Auth 仅做 Base64 编码（不是加密），必须配合 HTTPS 使用，避免凭证在网络中明文传输。':
    'Basic Auth is only Base64-encoded (not encrypted). Always use over HTTPS to prevent credential leaks.',

  // NATO
  'NATO 字母': 'NATO alphabet',
  '输入英文字母或数字…': 'Enter letters or digits…',
  '完整字母表': 'Full alphabet',
  'NATO 音标字母（ICAO 拼读字母表），用于无线电通讯避免相似字母混淆，如 B / D、M / N。':
    'NATO phonetic alphabet (ICAO), used in radio comms to disambiguate similar letters like B/D, M/N.',

  // MIME
  '搜索后缀或 MIME（如 png / json / application/pdf）…': 'Search extension or MIME (png / json / application/pdf)…',
  '视频': 'Video',
  '音频': 'Audio',
  '字体': 'Font',
  '没有匹配的类型': 'No matching MIME types',
  '后缀': 'Extension',
  'MIME 类型': 'MIME Type',
  '分类': 'Category',
  '个常见 MIME 类型。后缀名不带点（如': ' common MIME types. Extensions without dot (e.g. ',
  '而非': ', not ',

  // HTTP Headers
  '搜索头名称或说明…': 'Search header name or description…',
  '通用': 'General',
  '认证': 'Auth',
  '缓存': 'Cache',
  '条件': 'Conditional',
  'Cookie': 'Cookie',
  '安全': 'Security',
  '请求 + 响应': 'Request + Response',
  '仅请求': 'Request only',
  '仅响应': 'Response only',
  '没有匹配的请求头': 'No matching headers',
  '请求': 'Request',
  '响应': 'Response',

  // Git Cheatsheet
  '搜索命令或说明…': 'Search command or description…',
  '没有匹配的命令': 'No matching commands',
  '初始化 & 克隆': 'Init & Clone',
  '查看状态 & 历史': 'Status & History',
  '暂存 & 提交': 'Stage & Commit',
  '分支': 'Branch',
  '远程仓库': 'Remote',
  '变基 & 樱桃挑选': 'Rebase & Cherry-pick',
  '撤销 & 救命': 'Undo & Recover',
  '标签': 'Tag',
  '配置 & 别名': 'Config & Alias',

  // === 批2：8 个工具 ===
  // Bcrypt（'校验' '计算中…' 与通用按钮重复，依赖既有翻译）
  '生成哈希': 'Generate hash',
  '校验密码': 'Verify password',
  '明文密码': 'Plaintext password',
  '要哈希的密码': 'Password to hash',
  '轮数 (4-15)': 'Rounds (4-15)',
  '生成 hash': 'Generate hash',
  '校验中…': 'Verifying…',
  '匹配：密码正确': 'Match: password correct',
  '不匹配：密码错误或 hash 无效': 'No match: wrong password or invalid hash',
  '→ 用这个 hash 去校验区测试': '→ Use this hash in the verify section',
  'Bcrypt 用于密码哈希。轮数越高越安全也越慢（10 ≈ 100ms，12 ≈ 400ms）。生产建议 10-12 轮。':
    'Bcrypt is for password hashing. Higher rounds = more secure but slower (10 ≈ 100ms, 12 ≈ 400ms). Production: use 10-12.',

  // JSON Diff（'新增' '删除' 与通用按钮共用「Add/Delete」，差异类别用「Added/Removed」会更好，
  // 但避免重复键，这里复用通用值；表格里显示 "+ 新增"/"- 删除" 已带符号区分）
  '原 JSON (A)': 'Original JSON (A)',
  '新 JSON (B)': 'New JSON (B)',
  '✓ 两段 JSON 完全相同': '✓ The two JSON values are identical',
  '修改': 'Changed',
  '路径': 'Path',
  '原值 (A)': 'Old value (A)',
  '新值 (B)': 'New value (B)',
  'TOML 顶层必须是对象': 'TOML root must be an object',

  // Slug
  '横线 (kebab)': 'Hyphen (kebab)',
  '下划线 (snake)': 'Underscore (snake)',
  '点号': 'Dot',
  '无分隔': 'None',
  '转小写': 'Lowercase',
  'Slug 结果': 'Slug result',
  '规则：去除变音符号 / 标点 / emoji，CJK 字符原样保留（适合中文 URL）。如需音译为拼音可在后端单独处理。':
    'Rules: strip diacritics / punctuation / emoji; CJK characters preserved as-is (works well for Chinese URLs). Pinyin transliteration should be done server-side.',

  // Text-Binary
  '字节间分隔：': 'Byte separator: ',
  '文本 → 二进制': 'Text → Binary',
  '二进制 → 文本': 'Binary → Text',
  '文本 (UTF-8)': 'Text (UTF-8)',
  '二进制': 'Binary',
  '只能包含 0 / 1 和分隔符': 'Only 0 / 1 and separators are allowed',
  '总长度必须是 8 的倍数': 'Total length must be a multiple of 8',
  '每个字节 8 bit，UTF-8 编码。中文字符通常占 3 个字节 = 24 bit。':
    'Each byte is 8 bits, UTF-8 encoded. CJK characters typically take 3 bytes = 24 bits.',

  // WiFi QR
  'WiFi 名称 (SSID)': 'WiFi name (SSID)',
  'WiFi 密码': 'WiFi password',
  '加密方式': 'Security',
  'WPA / WPA2 / WPA3': 'WPA / WPA2 / WPA3',
  'WEP（已淘汰）': 'WEP (deprecated)',
  '无密码': 'No password',
  '隐藏网络': 'Hidden network',
  'WiFi 编码字符串': 'WiFi encoded string',
  '渲染中…': 'Rendering…',
  'iOS 11+ / Android 10+ 直接扫码即可连接。生成的二维码完全离线，无任何上传。':
    'Scan on iOS 11+ / Android 10+ to auto-connect. The QR is generated entirely offline, no upload.',

  // === 批3：10 个工具 ===
  // Math eval
  '逐行结果': 'Line-by-line results',
  '基本运算': 'Basic',
  '函数': 'Functions',
  '单位换算': 'Units',
  '复数': 'Complex',
  '矩阵': 'Matrix',
  '统计': 'Statistics',
  '基于 mathjs。支持：基础运算、内置函数（sin/cos/log/sqrt 等）、变量、单位换算、复数、矩阵、统计函数。# 或 // 开头的行作注释。':
    'Powered by mathjs. Supports basic arithmetic, functions (sin/cos/log/sqrt …), variables, unit conversion, complex numbers, matrices, statistics. Lines starting with # or // are comments.',

  // IPv4 subnet
  '请输入 CIDR 格式，如 192.168.1.0/24': 'Please enter CIDR format, e.g. 192.168.1.0/24',
  '前缀必须在 0-32 之间': 'Prefix must be 0-32',
  '无效 CIDR：请输入 IP/前缀 格式，如 192.168.1.0/24': 'Invalid CIDR: use IP/prefix format, e.g. 192.168.1.0/24',
  '网络地址': 'Network',
  '广播地址': 'Broadcast',
  '子网掩码': 'Netmask',
  '通配符掩码': 'Wildcard',
  '可用主机起': 'First usable',
  '可用主机止': 'Last usable',
  '前缀长度': 'Prefix length',
  '总地址数': 'Total addresses',
  '可用主机数': 'Usable hosts',
  'IP 类别': 'IP class',
  '（私有）': ' (private)',
  '（公网）': ' (public)',

  // MAC lookup
  '请至少输入 MAC 地址的前 6 位（OUI）': 'Please enter at least the first 6 hex digits (OUI)',
  '厂商': 'Vendor',
  '完整 MAC': 'Full MAC',
  '组播 (multicast)': 'Multicast',
  '单播 (unicast)': 'Unicast',
  '本地管理 (locally administered)': 'Locally administered',
  '全局唯一 (globally unique)': 'Globally unique',

  // MAC generate
  'OUI 前缀（可选）': 'OUI prefix (optional)',
  '. (思科)': '. (Cisco)',
  '单播（unicast，bit0=0）': 'Unicast (bit0=0)',
  '全局唯一（global，bit1=0）': 'Globally unique (bit1=0)',

  // OTP
  'Secret（Base32）': 'Secret (Base32)',
  '随机生成': 'Random',
  'Issuer': 'Issuer',
  'Account': 'Account',
  '位数': 'Digits',
  '6 位': '6 digits',
  '8 位': '8 digits',
  '周期 (秒)': 'Period (sec)',
  '当前验证码': 'Current code',
  '下一个验证码': 'Next code',
  '秒后刷新': ' sec until refresh',
  'otpauth:// URI（导入到 Authenticator）': 'otpauth:// URI (import into Authenticator)',
  '密钥无效（必须是 Base32）：': 'Invalid secret (must be Base32): ',
  '基于 RFC 6238 (TOTP)。和 Google Authenticator / 1Password / Authy 等兼容。Secret 必须是 Base32 字符（A-Z, 2-7）。':
    'Based on RFC 6238 (TOTP). Compatible with Google Authenticator / 1Password / Authy. Secret must be Base32 (A-Z, 2-7).',

  // Emoji
  '搜索 emoji（中英文关键词）…': 'Search emoji (Chinese / English keywords)…',
  '表情 & 情绪': 'Smileys & Emotion',
  '手势 & 人物': 'Gestures & People',
  '物件 & 符号': 'Objects & Symbols',
  '科技 & 办公': 'Tech & Office',
  '符号 & 标记': 'Symbols & Marks',
  '没有匹配的 emoji': 'No matching emojis',
  '点击任意 emoji 即复制到剪贴板。共收录': 'Click any emoji to copy. Included: ',
  '个常用 emoji，覆盖日常使用 95%+。': ' common emojis (covers 95%+ everyday usage).',

  // ASCII art
  '字符画': 'ASCII art',
  '· 渲染中…': '· Rendering…',
  '请输入文本': 'Please enter text',
  '基于 figlet。字体按需从 CDN 加载，首次使用某字体需联网（之后会缓存）。仅支持英文字符。':
    'Powered by figlet. Fonts are loaded on demand from CDN (network needed first time, cached afterwards). English only.',
  '字体加载失败：': 'Font load failed: ',

  // Docker compose
  'docker run 命令': 'docker run command',
  '粘贴 docker run 命令…': 'Paste a docker run command…',
  '未找到镜像名': 'Image name not found',
  '支持识别 -d / -p / -v / -e / --name / --network / --restart / --hostname / -w / -u / --privileged 等常见参数。未识别参数会被跳过。':
    'Recognizes common flags: -d / -p / -v / -e / --name / --network / --restart / --hostname / -w / -u / --privileged. Unknown flags are skipped.',

  // Meta tag
  '站点 URL': 'Site URL',
  '分享图 URL': 'Share image URL',
  '站点名': 'Site name',
  'Twitter 账号': 'Twitter handle',
  '作者': 'Author',
  '主题色': 'Theme color',
  'Meta 标签代码': 'Meta tags code',
  '社交分享预览': 'Social share preview',

  // Rate FX
  '⚠️ 本工具会调用第三方 API（exchangerate-api.com）获取汇率数据，会向其服务器发送一次 GET 请求。':
    '⚠️ This tool calls a third-party API (exchangerate-api.com) to fetch rates; one GET request is sent to their server.',
  '从': 'From',
  '到': 'To',
  '金额': 'amount',
  '汇率获取失败：': 'Failed to fetch rates: ',
  '数据更新日期：': 'Data updated: ',
  '对应（参考）': ' equals (reference)',
};

/**
 * 运行时合并字典：
 *  - 静态 zhToEnDict（上方）
 *  - 从 registry 自动收集的所有工具 zh.title / zh.description → en.title / en.description
 *  - 从 categories 自动收集的所有分类 zh.title / zh.description → en.title / en.description
 *
 * 这样以后新增任何工具，**只要在 meta.i18n.en 中写好英文标题/描述**，
 * 就能自动出现在 en 模式下，无需手工维护本字典。
 */
let runtimeDict: Record<string, string> | null = null;
let sortedKeys: string[] | null = null;

async function ensureRuntimeDict(): Promise<Record<string, string>> {
  if (runtimeDict) return runtimeDict;
  // 合并基础静态字典
  const merged: Record<string, string> = { ...zhToEnDict };
  try {
    // 动态 import 避免循环依赖、并便于 SSR/CSR 共用
    const [{ allTools }, { categories }] = await Promise.all([
      import('./registry'),
      import('./categories'),
    ]);
    for (const t of allTools) {
      const zh = t.i18n?.zh;
      const en = t.i18n?.en;
      if (!zh || !en) continue;
      if (zh.title && en.title && zh.title !== en.title) {
        merged[zh.title] = en.title;
      }
      if (zh.description && en.description && zh.description !== en.description) {
        merged[zh.description] = en.description;
      }
    }
    for (const c of categories) {
      const zh = c.i18n?.zh;
      const en = c.i18n?.en;
      if (!zh || !en) continue;
      if (zh.title && en.title && zh.title !== en.title) {
        merged[zh.title] = en.title;
      }
      if (zh.description && en.description && zh.description !== en.description) {
        merged[zh.description] = en.description;
      }
    }
  } catch (e) {
    // registry / categories 加载失败不影响基础字典工作
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined') console.warn('[zhEnDict] runtime dict augment failed', e);
  }
  runtimeDict = merged;
  sortedKeys = Object.keys(merged).sort((a, b) => b.length - a.length);
  return runtimeDict;
}

/** 同步路径（仅静态字典）—— 用于第一次同步调用还没拿到 runtimeDict 时的兜底 */
function syncDict(): Record<string, string> {
  return runtimeDict ?? zhToEnDict;
}
function syncSortedKeys(): string[] {
  if (sortedKeys) return sortedKeys;
  sortedKeys = Object.keys(syncDict()).sort((a, b) => b.length - a.length);
  return sortedKeys;
}

/**
 * 在模块加载时**立即**触发一次异步合并（不 block 调用方）。
 * 由于 GlobalI18n 是在 client:idle 阶段挂载、并通过 MutationObserver 持续重扫，
 * 一旦 runtimeDict 就绪，下次扫描即可命中长句翻译。
 */
if (typeof window !== 'undefined') {
  void ensureRuntimeDict();
}

/**
 * 将文本中所有匹配的中文短语替换为英文。
 * 未命中字典的中文保持原样（不会破坏未翻译的内容）。
 *
 * 注意：本函数为同步调用。首次调用时如 runtimeDict 还没构建完，
 * 仅使用静态字典；后续扫描（GlobalI18n MutationObserver 触发）会命中完整字典。
 */
export function translateZhToEn(text: string): string {
  if (!text) return text;
  const dict = syncDict();
  const keys = syncSortedKeys();
  let result = text;
  for (const zh of keys) {
    if (result.includes(zh)) {
      result = result.split(zh).join(dict[zh]);
    }
  }
  return result;
}

/**
 * 异步等待运行时字典就绪。供 GlobalI18n 在 onMounted 中调用，
 * 保证第一次翻译扫描时所有工具标题/描述都已注入。
 */
export async function waitZhEnReady(): Promise<void> {
  await ensureRuntimeDict();
}
