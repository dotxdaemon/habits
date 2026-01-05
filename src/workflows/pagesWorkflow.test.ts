// ABOUTME: Tests the GitHub Pages workflow configuration to ensure expected build setup ordering.
// ABOUTME: Ensures pnpm installation happens before steps that rely on pnpm caching or commands.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseConfigFileTextToJson } from 'typescript';

describe('pages workflow', () => {
  it('installs pnpm before enabling pnpm cache', () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'pages.yml');
    const content = readFileSync(workflowPath, 'utf-8');

    const pnpmSetupIndex = content.indexOf('uses: pnpm/action-setup@v4');
    const nodeSetupIndex = content.indexOf('uses: actions/setup-node@v4');

    expect(pnpmSetupIndex).toBeGreaterThanOrEqual(0);
    expect(nodeSetupIndex).toBeGreaterThanOrEqual(0);
    expect(pnpmSetupIndex).toBeLessThan(nodeSetupIndex);
  });

  it('configures Node types for workflow tests that rely on built-in modules', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.app.json');
    const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
    const { config } = parseConfigFileTextToJson(tsconfigPath, tsconfigContent);
    const configuredTypes = config?.compilerOptions?.types ?? [];

    expect(configuredTypes).toContain('node');
  });
});
