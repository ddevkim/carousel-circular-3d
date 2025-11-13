import { defineConfig } from 'tsup';

/**
 * tsup configuration for @ddevkim/carousel-circular
 *
 * Library build configuration:
 * - ESM + CJS dual format for maximum compatibility
 * - TypeScript declarations with resolve
 * - NOT minified for better debugging experience in consuming applications
 * - Tree-shaking enabled
 * - React/React-DOM as external (peer dependencies)
 * - "use client" directive for Next.js App Router compatibility
 *
 * Output files:
 * - index.js (CJS, readable)
 * - index.mjs (ESM, readable)
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

  // Build options - readable for consuming applications
  splitting: false,
  sourcemap: true, // Enable sourcemap for better debugging
  clean: true,
  treeshake: true,
  minify: false, // Disabled for readable code in consuming applications

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
