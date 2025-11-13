---
"@ddevkim/carousel-circular-3d": patch
---

refactor: remove excessive memoization and dead code for better maintainability

**Bug Fixes:**
- Fix lightbox not opening on item click due to React.memo stale closure
- Fix orientation not updating when album changes
- Fix CSS not applying when lightbox opens externally

**Code Simplification:**
- Remove React.memo from CarouselItem (caused bugs with function props)
- Remove unused itemMetadataCache.ts file and 7 functions
- Remove 25+ unnecessary intermediate variables
- Remove 3 useEffect hooks for ref synchronization
- Remove 5 redundant useCallback wrappers
- Inline renderItem logic for better code clarity
- Remove ~300 lines of unnecessary code

**Build Configuration:**
- Disable minification for better debugging experience in consuming applications
- Enable sourcemaps for development workflow
- Bundle size: 28KB → 64KB (unminified, but will be minified by consuming apps)

**Documentation:**
- Add "Lessons Learned" section about premature optimization
- Add troubleshooting guide for React.memo pitfalls
- Update performance optimization principles

**Performance Impact:**
- Cleaner code with better data flow
- Removed complexity without losing functionality
- Better debugging experience for library users
