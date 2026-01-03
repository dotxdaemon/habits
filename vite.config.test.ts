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

  it('references assets through the base url placeholder in index.html', () => {
    const indexHtml = readFileSync(resolve(currentDirectory, './index.html'), 'utf-8');

    expect(indexHtml).toContain('%BASE_URL%manifest.json');
    expect(indexHtml).toContain('%BASE_URL%icon-192.png');
    expect(indexHtml).toContain('%BASE_URL%icon-512.png');
    expect(indexHtml).toContain('%BASE_URL%src/main.tsx');
  });
});
