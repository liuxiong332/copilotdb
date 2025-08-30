import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/renderer/__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@database-gui/types': path.resolve(__dirname, '../../packages/types/src'),
      '@database-gui/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});