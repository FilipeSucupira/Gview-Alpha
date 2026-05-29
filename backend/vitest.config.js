import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    setupFiles: ['./tests/setup.js'],
    // Reseta o cache de módulos entre arquivos de teste
    // Isso garante que vi.mock() intercepte require() corretamente em cada suite
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary'],
      include: ['src/**/*.js'],
      exclude: [
        'src/lib/prisma.js',
        'src/routes/rawg.routes.js',
        'src/controllers/**/*.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
