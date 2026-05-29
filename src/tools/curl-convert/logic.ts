/**
 * 极简 cURL 解析器
 * 支持：-X / --request, -H / --header, -d / --data / --data-raw / --data-urlencode,
 *       -u / --user, --compressed, -L / --location, -k / --insecure, -A / --user-agent
 *       -F / --form （multipart/form-data 简易支持）
 *       --json （等价于 -d 并设置 Content-Type: application/json）
 */
export interface CurlParsed {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: string | null;
  formFields?: { key: string; value: string }[];
  basicAuth?: { user: string; pass?: string };
}

function tokenize(input: string): string[] {
  // 处理换行续行 \\\n
  const cleaned = input
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const out: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (ch === ' ') { i++; continue; }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      let buf = '';
      while (j < cleaned.length && cleaned[j] !== quote) {
        if (cleaned[j] === '\\' && j + 1 < cleaned.length) {
          buf += cleaned[j + 1]; j += 2; continue;
        }
        buf += cleaned[j]; j++;
      }
      out.push(buf);
      i = j + 1;
    } else {
      let j = i;
      let buf = '';
      while (j < cleaned.length && cleaned[j] !== ' ') {
        buf += cleaned[j]; j++;
      }
      out.push(buf);
      i = j;
    }
  }
  return out;
}

export function parseCurl(input: string): CurlParsed {
  const tokens = tokenize(input.trim().replace(/^\s*curl\s+/i, ''));
  const headers: Record<string, string> = {};
  let url = '';
  let method = '';
  let data: string | null = null;
  const formFields: { key: string; value: string }[] = [];
  let basicAuth: { user: string; pass?: string } | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = () => tokens[++i];
    if (t === '-X' || t === '--request') method = next();
    else if (t === '-H' || t === '--header') {
      const v = next();
      const idx = v.indexOf(':');
      if (idx > -1) headers[v.slice(0, idx).trim()] = v.slice(idx + 1).trim();
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary' || t === '--data-urlencode') {
      const v = next();
      data = data ? data + '&' + v : v;
      if (!method) method = 'POST';
    } else if (t === '--json') {
      const v = next();
      data = v;
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      if (!method) method = 'POST';
    } else if (t === '-F' || t === '--form') {
      const v = next();
      const eq = v.indexOf('=');
      if (eq > -1) formFields.push({ key: v.slice(0, eq), value: v.slice(eq + 1) });
      if (!method) method = 'POST';
    } else if (t === '-u' || t === '--user') {
      const v = next();
      const colon = v.indexOf(':');
      basicAuth = colon > -1
        ? { user: v.slice(0, colon), pass: v.slice(colon + 1) }
        : { user: v };
    } else if (t === '-A' || t === '--user-agent') {
      headers['User-Agent'] = next();
    } else if (t === '-e' || t === '--referer') {
      headers['Referer'] = next();
    } else if (t === '-b' || t === '--cookie') {
      headers['Cookie'] = next();
    } else if (t === '-L' || t === '--location' || t === '--compressed' || t === '-k' || t === '--insecure' || t === '-s' || t === '--silent' || t === '-i' || t === '--include' || t === '-v' || t === '--verbose') {
      // flags ignored
    } else if (t.startsWith('-')) {
      // 未识别选项：吞掉一个值
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) i++;
    } else {
      if (!url) url = t.replace(/^['"]|['"]$/g, '');
    }
  }

  if (basicAuth) {
    const token = btoa(`${basicAuth.user}:${basicAuth.pass ?? ''}`);
    headers['Authorization'] = headers['Authorization'] || `Basic ${token}`;
  }

  if (!method) method = 'GET';
  return { url, method, headers, data, formFields, basicAuth };
}

export function toFetch(p: CurlParsed): string {
  const opts: string[] = [];
  if (p.method !== 'GET') opts.push(`method: ${JSON.stringify(p.method)}`);
  if (Object.keys(p.headers).length) {
    opts.push(`headers: ${JSON.stringify(p.headers, null, 2).replace(/\n/g, '\n  ')}`);
  }
  if (p.formFields && p.formFields.length) {
    const lines = [
      'const formData = new FormData();',
      ...p.formFields.map((f) => `formData.append(${JSON.stringify(f.key)}, ${JSON.stringify(f.value)});`),
    ];
    opts.push('body: formData');
    return [
      ...lines,
      `const res = await fetch(${JSON.stringify(p.url)}, {`,
      `  ${opts.join(',\n  ')}`,
      '});',
      'const data = await res.json();',
    ].join('\n');
  }
  if (p.data != null) opts.push(`body: ${JSON.stringify(p.data)}`);
  return [
    `const res = await fetch(${JSON.stringify(p.url)}, {`,
    `  ${opts.join(',\n  ')}`,
    '});',
    'const data = await res.json();',
  ].join('\n');
}

export function toAxios(p: CurlParsed): string {
  const cfg: Record<string, unknown> = { url: p.url, method: p.method.toLowerCase() };
  if (Object.keys(p.headers).length) cfg.headers = p.headers;
  if (p.data != null) cfg.data = p.data;
  if (p.formFields && p.formFields.length) {
    return [
      "import axios from 'axios';",
      'const formData = new FormData();',
      ...p.formFields.map((f) => `formData.append(${JSON.stringify(f.key)}, ${JSON.stringify(f.value)});`),
      `const { data } = await axios.${p.method.toLowerCase()}(${JSON.stringify(p.url)}, formData${
        Object.keys(p.headers).length ? `, { headers: ${JSON.stringify(p.headers)} }` : ''
      });`,
    ].join('\n');
  }
  return [
    "import axios from 'axios';",
    `const { data } = await axios(${JSON.stringify(cfg, null, 2)});`,
  ].join('\n');
}

export function toNodeFetch(p: CurlParsed): string {
  return "import fetch from 'node-fetch';\n" + toFetch(p);
}
