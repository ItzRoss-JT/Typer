/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Source maps would expose the full source to anyone with DevTools open.
    sourcemap: false,
    // Use esbuild (Vite's default minifier) to drop console.log / console.debug /
    // console.info from the production bundle, while preserving warn/error so
    // real failures remain visible.
    minify: 'esbuild',
  },
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.info', 'console.trace'],
  },
  test: {
    // Vitest config (read by `vitest` even though it lives in vite.config)
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
