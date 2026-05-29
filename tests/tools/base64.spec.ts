import { describe, it, expect } from 'vitest';
import { utf8ToBase64, base64ToUtf8 } from '@/tools/base64/logic';

describe('base64 logic', () => {
  it('encode/decode UTF-8 round trip', () => {
    const s = 'Hello, WeTools 你好 🎉';
    expect(base64ToUtf8(utf8ToBase64(s))).toBe(s);
  });

  it('url-safe variant', () => {
    const s = 'Subjects?=A & B/C';
    const enc = utf8ToBase64(s, true);
    expect(enc.includes('+')).toBe(false);
    expect(enc.includes('/')).toBe(false);
    expect(enc.endsWith('=')).toBe(false);
    expect(base64ToUtf8(enc, true)).toBe(s);
  });

  it('decode auto-detects URL safe', () => {
    const s = '<>?@';
    const enc = utf8ToBase64(s, true);
    expect(base64ToUtf8(enc)).toBe(s); // urlSafe=false but contains - or _
  });
});
