import { describe, it, expect } from 'vitest';
import { allTools } from '@/lib/registry';
import { categories } from '@/lib/categories';
import { iconMap } from '@/lib/icons';

describe('registry', () => {
  it('has tools registered', () => {
    expect(allTools.length).toBeGreaterThan(20);
  });

  it('all tool ids are unique kebab-case', () => {
    const seen = new Set<string>();
    for (const t of allTools) {
      expect(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)).toBe(true);
      expect(seen.has(t.id)).toBe(false);
      seen.add(t.id);
    }
  });

  it('each tool has bilingual i18n', () => {
    for (const t of allTools) {
      expect(typeof t.i18n.zh.title).toBe('string');
      expect(typeof t.i18n.zh.description).toBe('string');
      expect(typeof t.i18n.en.title).toBe('string');
      expect(typeof t.i18n.en.description).toBe('string');
    }
  });

  it('tool category exists in categories registry', () => {
    const cats = new Set(categories.map((c) => c.id));
    for (const t of allTools) {
      expect(cats.has(t.category)).toBe(true);
    }
  });

  it('tool icons are registered in iconMap', () => {
    for (const t of allTools) {
      expect(iconMap).toHaveProperty(t.icon);
    }
  });

  it('category icons are registered in iconMap', () => {
    for (const c of categories) {
      expect(iconMap).toHaveProperty(c.icon);
    }
  });
});
