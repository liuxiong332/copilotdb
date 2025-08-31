import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: './src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@database-gui/types': path.resolve(__dirname, '../../packages/types/src'),
      '@database-gui/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 3001,
  },
});