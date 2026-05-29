/**
 * Base64 工具核心逻辑
 * - 浏览器内 atob/btoa 仅支持 latin1，需用 TextEncoder/TextDecoder 处理 UTF-8
 * - 支持 URL-safe 变种：+/= → -_（去除 padding）
 */

export function utf8ToBase64(input: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  let b64 = btoa(bin);
  if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return b64;
}

export function base64ToUtf8(input: string, urlSafe = false): string {
  let s = input.trim();
  if (urlSafe) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
  } else {
    // 智能识别：若包含 - 或 _ 则视为 url safe
    if (/[-_]/.test(s)) {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4 !== 0) s += '=';
    }
  }
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}
