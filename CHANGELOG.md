# Changelog

## 0.2.1

### Patch Changes

- ## 📝 Documentation Updates

  - Updated README to reflect CHANGELOG 0.2.0 changes
  - Added `enableKeyboardNavigation` option to Interaction API documentation
  - Added detailed `LightboxOptions` table with all available options
  - Enhanced Accessibility section with keyboard navigation usage guide
  - Updated Features section to highlight enhanced keyboard support

## 0.2.0

### Minor Changes

- ## ✨ New Features

  - Enhanced keyboard navigation support for Lightbox
    - Added ArrowLeft/ArrowRight key support for navigating between images in Lightbox
    - Added Escape key support for closing Lightbox
    - Keyboard events are handled in capture phase to prevent conflicts with other handlers
    - Added `enableKeyboardNavigation` option to control keyboard navigation in Lightbox (default: true)
    - Added `closeOnEsc` option to control ESC key behavior (default: true)
  - Improved carousel keyboard navigation
    - Added `enableKeyboardNavigation` option to control carousel keyboard navigation (default: true)
    - Carousel keyboard navigation is automatically disabled when Lightbox is open to prevent conflicts

  ## 🐛 Bug Fixes

  - Fixed Lightbox navigation and close button rendering issues by explicitly setting z-index hierarchy
    - Increased button z-index from 9999 to 10000 to ensure buttons are always above images
    - Added z-index 9999 to image container and image elements
    - Explicitly set `pointer-events: auto` on buttons and backdrop to prevent click interference
    - Added `position: relative` to image element to ensure z-index is applied correctly

  This release improves keyboard accessibility and ensures that navigation and close buttons are always clickable and properly rendered above the lightbox image, preventing rendering issues caused by style interference.

## 0.1.3

### Patch Changes

- ## 🚀 Build Optimization

  - **Minification**: Enabled esbuild minification for production builds
  - **Sourcemaps**: Removed from production builds to reduce package size
  - **Bundle size**: Reduced by ~64% (from ~475KB to ~170KB)
  - **Output files**: Optimized from 8 files to 5 files
  - **npm files**: Excluded .map files from npm package

  ### Technical Changes

  - Set `sourcemap: false` for production builds
  - Set `minify: true` using esbuild built-in minification
  - Updated `package.json` files field to exclude `!dist/**/*.map`
  - Removed conditional build logic for simpler, always-optimized builds

  ### Impact

  - Smaller npm package size
  - Faster install times for consumers
  - Cleaner dist folder structure
  - Better production performance

## 0.1.2

### Patch Changes

- ## 🚀 Build Optimization

  - **Minification**: Enabled esbuild minification for production builds
  - **Sourcemaps**: Removed from production builds to reduce package size
  - **Bundle size**: Reduced by ~64% (from ~475KB to ~170KB)
  - **Output files**: Optimized from 8 files to 5 files
  - **npm files**: Excluded .map files from npm package

  ### Technical Changes

  - Set `sourcemap: false` for production builds
  - Set `minify: true` using esbuild built-in minification
  - Updated `package.json` files field to exclude `!dist/**/*.map`
  - Removed conditional build logic for simpler, always-optimized builds

  ### Impact

  - Smaller npm package size
  - Faster install times for consumers
  - Cleaner dist folder structure
  - Better production performance

## 0.1.1

### Patch Changes

- remove repo url

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-11

### Added

- 🎉 Initial release of `@ddevkim/carousel-circular-3d`
- ✨ Core 3D circular carousel component with customizable geometry
- 🎨 Luxury visual effects (opacity, scale, reflection)
- 🖱️ Drag and touch interaction with momentum physics
- ⚡ Smooth animations using requestAnimationFrame
- 🖼️ Built-in lightbox functionality with keyboard navigation
- 🎯 LQIP (Low Quality Image Placeholder) support for progressive loading
- ⌨️ Keyboard navigation (Arrow keys)
- ♿ Accessibility features (ARIA labels, keyboard support)
- 🔧 Highly customizable API with TypeScript support
- 🎭 Auto-rotation with pause-on-interaction
- 🌟 GPU-accelerated transforms for smooth performance

### Features

**3D Geometry Configuration:**

- Adjustable radius, perspective, camera angle
- Depth intensity for Z-axis variation

**Interaction:**

- Drag sensitivity control
- Momentum physics with friction
- Touch-friendly on mobile devices

**Visual Effects:**

- Opacity and scale gradients
- Bottom reflection effect
- Smooth transitions with easing functions

**Lightbox:**

- Full-screen image viewer
- Keyboard navigation (Arrow keys, ESC)
- Smooth enter/exit animations

**Performance:**

- GPU-accelerated CSS transforms
- Optimized bundle size
- Tree-shakeable ESM/CJS exports

[0.1.0]: https://github.com/ddevkim/packages/releases/tag/carousel-circular-3d-v0.1.0
