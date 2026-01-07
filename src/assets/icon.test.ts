// ABOUTME: Verifies the favicon SVG only contains vector paths for the kanji.
// ABOUTME: Guards against reintroducing text or background shapes in the icon.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('favicon icon', () => {
  it('keeps only kanji paths with no text or background shapes', () => {
    const iconPath = resolve(process.cwd(), 'public', 'icon.svg');
    const iconMarkup = readFileSync(iconPath, 'utf8');

    expect(iconMarkup).toContain('<path');
    expect(iconMarkup).not.toContain('<text');
    expect(iconMarkup).not.toContain('<circle');
    expect(iconMarkup).not.toContain('<rect');
  });
});
