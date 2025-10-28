import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/lib/**/*.ts',
        'src/pages/api/**/*.ts',
        'scripts/**/*.ts',
      ],
      exclude: [
        'src/lib/tests/**',
        'scripts/tests/**',
        'scripts/seed-history.ts', // Exclude seed script from coverage
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
      all: true,
    },
  },
});
