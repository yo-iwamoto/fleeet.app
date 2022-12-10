import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'miniflare',
    dir: 'src/__tests__',
    environmentOptions: {
      bindings: {
        //
      },
    },
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
