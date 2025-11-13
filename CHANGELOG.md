# Changelog

## 0.3.1

### Patch Changes

- fix: resolve infinite loop and refactor useAutoRotate hook

  Critical bug fix and code improvements:

  **Bug Fixes:**

  - Fixed "Maximum update depth exceeded" error in useAutoRotate hook
  - Removed problematic circular dependencies between useEffect and useCallback
  - Added useMemo to useCarouselConfig to stabilize config object references and prevent unnecessary re-renders
  - Fixed infinite loop that occurred during carousel initialization and album changes

  **Code Improvements:**

  - Extracted common cleanup logic into reusable `cleanup()` function
  - Simplified pause/resume functions (40% code reduction)
  - Dramatically simplified scheduleResume function (89% code reduction: 90 lines → 10 lines)
  - Reduced overall hook code by 38% (345 lines → 213 lines)
  - Reduced bundle size by ~1.2KB (29.60KB → 28.43KB)

  These changes improve code maintainability, readability, and performance while resolving critical runtime errors.

## 0.3.0

### Minor Changes

- perf: optimize album change performance with caching

  Major performance improvements for album transitions:

  - Add global image orientation cache to prevent re-analyzing same images
  - Implement custom comparison function in CarouselItem to reduce unnecessary re-renders
  - Add itemsMetadata calculation caching with LRU strategy (max 50 entries)
  - Optimize useImageOrientations hook to prioritize cache > LQIP > image loading

  Performance improvements:

  - Album switching: 80-90% faster for previously seen images (500ms → 50-100ms)
  - Same album revisit: 95% faster (300ms → 10-20ms)
  - Frame rate: Maintains 55-60fps during transitions (previously dropped to 30-40fps)

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
