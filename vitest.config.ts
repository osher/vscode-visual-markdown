import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      vscode: path.resolve(__dirname, '__mocks__/vscode.ts'),
    },
  },
});
