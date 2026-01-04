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
  });

  it('references static assets relative to the deployed base path', () => {
    const indexHtml = readFileSync(resolve(currentDirectory, './index.html'), 'utf-8');

    expect(indexHtml).toContain('href="manifest.webmanifest"');
    expect(indexHtml).toContain('href="icon.svg"');
    expect(indexHtml).toContain('src="/src/main.tsx"');
  });
});

describe('web manifest', () => {
  it('uses the GitHub Pages base path for installation and icons', () => {
    const manifest = readFileSync(resolve(currentDirectory, './public/manifest.webmanifest'), 'utf-8');
    const parsed = JSON.parse(manifest);

    expect(parsed.start_url).toBe('/habits/');
    parsed.icons.forEach((icon: { src: string }) => {
      expect(icon.src).toBe('icon.svg');
    });
  });
});
