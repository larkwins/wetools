# WeTools 工具清单

> 按 **8 大新分类**整理。状态说明：
> - ✅ 已实现（49 个）
> - ⏳ 待实现（31 个，规划中）
> - 🆕 = 参考 [it-tools.tech](https://it-tools.tech/) 后新增的规划工具
>
> **合计目标：80 个工具**（49 已实现 + 31 待实现）

最近更新：2026-06-01

---

## 1. 常用 (`common`) — 6 ✅ / 0 ⏳

> 高频通用工具，新用户首屏入口

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `timestamp` | Unix 时间戳 | Unix Timestamp | |
| ✅ | `regex` | 正则测试 | Regex Test | |
| ✅ | `cron` | Cron 解析 | Cron Parser | |
| ✅ | `color-convert` | 颜色转换 | Color Convert | RGB/HEX/HSL/HSV |
| ✅ | `image-base64` | 图片 ↔ Base64 | Image ↔ Base64 | |
| ✅ | `image-compress` | 图片压缩 | Image Compress | |

---

## 2. 编码/加密 (`encoding`) — 11 ✅ / 1 ⏳

> 字节变换：编解码 + 加密哈希

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `base64` | Base64 编解码 | Base64 Encode/Decode | |
| ✅ | `url-encode` | URL 编解码 | URL Encode/Decode | |
| ✅ | `html-entity` | HTML 实体编解码 | HTML Entity Encode/Decode | |
| ✅ | `hex-string` | Hex ↔ 字符串 | Hex ↔ String | |
| ✅ | `unicode-escape` | Unicode 转义 | Unicode Escape | \uXXXX 与原文互转 |
| ✅ | `hash` | Hash 计算 | Hash | MD5/SHA-1/256/384/512 |
| ✅ | `hmac` | HMAC 计算 | HMAC | HMAC-SHA1/256/384/512 |
| ✅ | `aes` | AES 加解密 | AES Encrypt/Decrypt | Web Crypto GCM/CBC |
| ✅ | `des` | DES / 3DES 加解密 | DES / 3DES Encrypt/Decrypt | crypto-js CBC/ECB |
| ✅ | `rsa` | RSA 加解密 / 生成密钥 | RSA Encrypt/Decrypt & Keygen | Web Crypto OAEP |
| ✅ | `jwt` | JWT 解析 | JWT Parser | |
| 🆕⏳ | `bcrypt` | Bcrypt 计算/校验 | Bcrypt | bcryptjs，后端密码哈希 |

---

## 3. 生成 (`generator`) — 8 ✅ / 6 ⏳

> 各类内容生成器

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `uuid` | UUID / NanoID | UUID / NanoID | |
| ✅ | `password` | 随机密码 | Random Password | |
| ✅ | `random` | 随机数 | Random Number | |
| ✅ | `qr-generate` | 二维码生成 | QR Generate | |
| ✅ | `qr-decode` | 二维码识别 | QR Decode | |
| ✅ | `lorem` | Lorem Ipsum | Lorem Ipsum | |
| ✅ | `mock-data` | Mock 假数据 | Mock Data | |
| ✅ | `placeholder-image` | 占位图生成 | Placeholder Image | SVG + PNG，仿 dummyimage |
| 🆕⏳ | `wifi-qr` | WiFi 二维码 | WiFi QR Code | 扫码连 WiFi |
| 🆕⏳ | `nato-text` | NATO 字母 | NATO Phonetic | "A" → "Alpha" |
| 🆕⏳ | `text-binary` | 文本 ↔ 二进制 | Text ↔ Binary | 教学/调试 |
| 🆕⏳ | `basic-auth` | Basic Auth 生成 | Basic Auth Generator | user:pass → base64 |
| 🆕⏳ | `meta-tag` | Meta Tag 生成 | Meta Tag Generator | SEO/OG/Twitter |
| 🆕⏳ | `docker-compose` | Docker run → Compose | Docker → Compose | DevOps 神器 |

---

## 4. 转换/格式化 (`converter`) — 9 ✅ / 4 ⏳

> 数据格式互转 + 代码生成

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `json-format` | JSON 格式化 / 校验 | JSON Format / Validate | |
| ✅ | `json-yaml` | JSON ↔ YAML | JSON ↔ YAML | |
| ✅ | `json-csv` | JSON ↔ CSV | JSON ↔ CSV | |
| ✅ | `json-xml` | JSON ↔ XML | JSON ↔ XML | |
| ✅ | `json-to-ts` | JSON → TypeScript | JSON → TypeScript | |
| ✅ | `json-to-go` | JSON → Go Struct | JSON → Go Struct | |
| ✅ | `json-to-proto` | JSON → Protobuf | JSON → Protobuf | |
| ✅ | `sql-to-go` | SQL → Go Struct | SQL → Go Struct | gorm tag |
| ✅ | `sql-format` | SQL 格式化 / 压缩 | SQL Format / Minify | sql-formatter 11 方言 |
| 🆕⏳ | `json-diff` | JSON Diff | JSON Diff | 结构化差异对比 |
| 🆕⏳ | `json-toml` | JSON ↔ TOML | JSON ↔ TOML | 配套 YAML/XML |
| 🆕⏳ | `yaml-toml` | YAML ↔ TOML | YAML ↔ TOML | |
| 🆕⏳ | `xml-format` | XML 美化/压缩 | XML Format / Minify | 独立 XML 格式化 |
| 🆕⏳ | `roman-numeral` | 罗马数字转换 | Roman Numeral | 1999 ↔ MCMXCIX |

---

## 5. 文本处理 (`text`) — 4 ✅ / 2 ⏳

> 文本对比、转换、加工

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `text-diff` | 文本 Diff | Text Diff | |
| ✅ | `case-convert` | 大小写 / 命名转换 | Case Convert | camel/snake/kebab/pascal |
| ✅ | `text-utils` | 文本工具集 | Text Utilities | 去重/排序/反转/统计 |
| ✅ | `markdown` | Markdown 预览 | Markdown Preview | |
| 🆕⏳ | `slug` | Slug 字符串 | Slugify | "Hello 你好" → "hello-ni-hao" |
| 🆕⏳ | `emoji` | Emoji 选择器 | Emoji Picker | 搜索 + 复制 |

---

## 6. Web/网络 (`web`) — 5 ✅ / 4 ⏳

> Web 开发与网络调试

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `ip-lookup` | IP 查询 | IP Lookup | external API |
| ✅ | `ua-parse` | UA 解析 | UA Parser | |
| ✅ | `url-parse` | URL 解析 | URL Parser | |
| ✅ | `curl-convert` | cURL 转代码 | cURL to Code | |
| ✅ | `websocket` | WebSocket 测试 | WebSocket Tester | |
| 🆕⏳ | `ipv4-subnet` | IPv4 子网计算器 | IPv4 Subnet Calculator | 网络工程师高频 |
| 🆕⏳ | `mac-lookup` | MAC 地址查询 (OUI) | MAC Address Lookup | 内置 OUI 表 |
| 🆕⏳ | `mac-generate` | MAC 地址生成 | MAC Address Generator | |
| 🆕⏳ | `otp` | OTP / TOTP | OTP / TOTP | 2FA 调试 |

---

## 7. 速查 (`cheatsheet`) — 6 ✅ / 9 ⏳

> 查阅 / 对照 / 轻量换算（无重交互）

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ✅ | `http-status` | HTTP 状态码 | HTTP Status Codes | 60+ 状态码 + RFC 引用 |
| ✅ | `timezone` | 时区换算 | Timezone Converter | |
| ✅ | `ascii` | ASCII 码表 | ASCII Table | 0-127 全表 + 控制字符 |
| ✅ | `css-units` | CSS 单位换算 | CSS Units | px/rem/em/vw/vh |
| ✅ | `number-base` | 进制转换 | Number Base | 2/8/10/16 |
| ✅ | `tailwind-cheatsheet` | Tailwind 速查 | Tailwind Cheatsheet | |
| 🆕⏳ | `rate-fx` | 实时汇率 | Forex Rates | external API |
| 🆕⏳ | `http-headers` | HTTP 头速查 | HTTP Headers | 配 http-status |
| 🆕⏳ | `git-cheatsheet` | Git 速查表 | Git Cheatsheet | 常用命令 |
| 🆕⏳ | `mime-types` | MIME 类型查询 | MIME Types | 后缀 ↔ MIME 双向 |
| 🆕⏳ | `keycode` | Keycode 速查 | Keycode Info | event.key/code/keyCode |
| 🆕⏳ | `chmod-calc` | Chmod 计算器 | Chmod Calculator | Linux 权限 rwx ↔ 数字 |
| 🆕⏳ | `temperature` | 温度换算 | Temperature Converter | C/F/K |
| 🆕⏳ | `percentage` | 百分比计算器 | Percentage Calculator | 涨跌/折扣 |
| 🆕⏳ | `math-eval` | 数学表达式求值 | Math Evaluator | mathjs，含 sin/log/π |

---

## 8. 检测 (`detect`) — 0 ✅ / 4 ⏳

> 浏览器设备检测（全部待实现）

| 状态 | id | 中文名 | 英文名 | 备注 |
|:--:|---|---|---|---|
| ⏳ | `camera-test` | 摄像头检测 | Camera Test | getUserMedia 预览 + 录制 |
| ⏳ | `mic-test` | 麦克风检测 | Microphone Test | 音量波形 + 录制回放 |
| ⏳ | `gamepad-test` | 游戏手柄检测 | Gamepad Test | Gamepad API 按键/摇杆映射 |
| ⏳ | `screen-info` | 屏幕信息 | Screen Info | 分辨率/DPR/刷新率/色域 |

---

## 总览

| 分类 | 已实现 | 待实现 | 合计 |
|---|---:|---:|---:|
| 常用 | 6 | 0 | 6 |
| 编码/加密 | 11 | 1 | 12 |
| 生成 | 8 | 6 | 14 |
| 转换/格式化 | 9 | 5 | 14 |
| 文本处理 | 4 | 2 | 6 |
| Web/网络 | 5 | 4 | 9 |
| 速查 | 6 | 9 | 15 |
| 检测 | 0 | 4 | 4 |
| **合计** | **49** | **31** | **80** |

---

## 不收录清单（参考 it-tools 但决定不做）

| 工具 | 原因 |
|---|---|
| Cypher (凯撒密码) | 加密需求已被 AES/RSA 覆盖 |
| BIP39 助记词 | 加密货币细分，与目标用户偏离 |
| PDF Signature Checker | 用户群极小 |
| HTML WYSIWYG Editor | 体积大且用户有偏好编辑器 |
| Random Port Generator | 价值低（一行代码） |
| Chronometer / ETA Calculator | 个人工具非开发工具 |
| ASCII Text Drawer (figlet) | 字体包大且小众 |
| String Obfuscator | 用途暧昧 |
| Numeronym Generator | 几乎用不到 |
| Safelink Decoder | Outlook 专用 |
| Benchmark Builder | 抽象，门槛高 |
| Camera Recorder (it-tools) | 我们用更轻的 `camera-test` 替代 |
| GO 在线运行 | 需要后端 sandbox，与"100% 本地"原则冲突 |
| Email 规范化 | 使用场景窄（主要 Gmail 别名），价值有限 |

---

## 实现优先级（建议分批）

### 第一批（10 个，高 ROI · 实现简单）
1. `bcrypt` — 后端必备
2. `json-diff` — 高需求
3. `chmod-calc` — Linux 高频
4. `wifi-qr` — 实用
5. `slug` — 一行代码大用处
6. `roman-numeral`
7. `temperature`
8. `percentage`
9. `basic-auth`
10. `mime-types`

### 第二批（10 个，中等需求）
11. `camera-test` / `mic-test` / `gamepad-test` / `screen-info`（检测分类一次性补齐）
15. `otp` — 2FA 调试
16. `ipv4-subnet` — 网络工程师
17. `mac-lookup` — OUI 厂商识别
18. `docker-compose` — DevOps 神器
19. `math-eval` — 计算器
20. `json-toml`

### 第三批（10 个，锦上添花）
21. `yaml-toml` / `xml-format` / `emoji` / `git-cheatsheet` / `http-headers`
26. `nato-text` / `text-binary` / `mac-generate` / `meta-tag` / `keycode`

### 第四批（external API）
- `rate-fx` 实时汇率 — 需在隐私页声明 external，加 `privacy: 'external'`
