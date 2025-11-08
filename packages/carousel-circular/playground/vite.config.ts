import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for playground
 * - Development mode: directly references source code (src) for hot reload
 * - Production build: uses dist files
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7000,
    open: true,
    host: true,
    cors: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'scheduler'],
    exclude: ['@ddevkim/carousel-circular'],
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@ddevkim/carousel-circular': path.resolve(__dirname, '../src/index.ts'),
    },
  },
});
