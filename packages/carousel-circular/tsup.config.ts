import { defineConfig } from "tsup";

/**
 * tsup configuration for @ddevkim/carousel-circular
 * Best practices:
 * - ESM + CJS dual format for maximum compatibility
 * - TypeScript declarations with resolve
 * - Source maps for debugging
 * - Tree-shaking enabled
 * - React/React-DOM as external (peer dependencies)
 * - "use client" directive for Next.js App Router compatibility
 */
export default defineConfig({
  // Entry point
  entry: ["src/index.ts"],

  // Output formats (CJS first for better compatibility)
  format: ["cjs", "esm"],

  // TypeScript declarations
  dts: {
    resolve: true,
  },

  // Output directory
  outDir: "dist",

  // Build options
  splitting: false, // Single bundle for library
  sourcemap: true, // Enable source maps for debugging
  clean: true, // Clean output directory before build
  treeshake: true, // Enable tree-shaking
  minify: false, // Keep readable for development (can be overridden in CI)

  // Platform target
  platform: "browser", // Browser-only library

  // External dependencies (peer dependencies)
  external: ["react", "react-dom"],

  // TypeScript config
  tsconfig: "./tsconfig.json",

  // Build options for Next.js App Router compatibility
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
