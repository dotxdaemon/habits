// ABOUTME: Configures Vitest to align with the project's React tooling.
// ABOUTME: Sets test environments and shared setup for deterministic runs.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    environmentMatchGlobs: [['**/vite.config.test.ts', 'node']],
    setupFiles: './src/test/setup.ts',
  },
});
