import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for playground
 * - Development mode: directly references source code (src) for hot reload
 * - Production build: optimized bundle with code splitting
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
    exclude: ['@ddevkim/carousel-circular-3d'],
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@ddevkim/carousel-circular-3d': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    // Production build optimization
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'scheduler'],
          'carousel-lib': ['@ddevkim/carousel-circular-3d'],
        },
        // Clean file names with content hash
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning threshold (500kb)
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Disable reporting compressed size for faster builds
    reportCompressedSize: false,
  },
});
