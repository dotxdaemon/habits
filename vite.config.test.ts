// ABOUTME: Validates build configuration for predictable deployment paths.
// ABOUTME: Confirms the entry HTML references assets through the configured base URL.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

describe('vite configuration', () => {
  it('uses the repository base path for built assets', () => {
    const configFile = readFileSync(resolve(currentDirectory, './vite.config.ts'), 'utf-8');

    expect(configFile).toContain("base: '/habits/',");
    expect(configFile).toContain("outDir: 'docs'");
    expect(configFile).toContain("includeAssets: ['vite.svg']");
  });

  it('references assets through the base url placeholder in index.html', () => {
    const indexHtml = readFileSync(resolve(currentDirectory, './index.html'), 'utf-8');

    expect(indexHtml).toContain('%BASE_URL%manifest.json');
    expect(indexHtml).toContain('%BASE_URL%src/main.tsx');
    expect(indexHtml).toContain('data:image/png;base64');
  });

  it('exposes a manifest aligned to the deployment base', () => {
    const manifest = readFileSync(resolve(currentDirectory, './public/manifest.json'), 'utf-8');
    const parsed = JSON.parse(manifest);

    expect(parsed.start_url).toBe('/habits/');
    parsed.icons.forEach((icon: { src: string }) => {
      expect(icon.src.startsWith('data:image/png;base64')).toBe(true);
    });
  });

  it('avoids committed binary icon assets', () => {
    const smallIcon = resolve(currentDirectory, './public/icon-192.png');
    const largeIcon = resolve(currentDirectory, './public/icon-512.png');

    expect(() => readFileSync(smallIcon)).toThrow();
    expect(() => readFileSync(largeIcon)).toThrow();
  });
});
