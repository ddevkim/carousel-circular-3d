import { defineConfig } from 'tsup';

/**
 * tsup configuration for @ddevkim/carousel-circular
 *
 * Production-optimized build configuration:
 * - ESM + CJS dual format for maximum compatibility
 * - TypeScript declarations with resolve
 * - Minified for smallest bundle size
 * - Tree-shaking enabled
 * - React/React-DOM as external (peer dependencies)
 * - "use client" directive for Next.js App Router compatibility
 *
 * Output files:
 * - index.js (CJS, minified)
 * - index.mjs (ESM, minified)
 * - index.d.ts (TypeScript declarations)
 * - index.d.mts (ESM TypeScript declarations)
 * - index.css (Styles)
 */
export default defineConfig({
  // Entry point
  entry: ['src/index.ts'],

  // Output formats (CJS first for better compatibility)
  format: ['cjs', 'esm'],

  // TypeScript declarations
  dts: {
    resolve: true,
  },

  // Output directory
  outDir: 'dist',

  // Build options - production optimized
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: true, // Use esbuild built-in minification

  // Platform target
  platform: 'browser',

  // External dependencies (peer dependencies)
  external: ['react', 'react-dom'],

  // TypeScript config
  tsconfig: './tsconfig.json',

  // Build options for Next.js App Router compatibility
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
