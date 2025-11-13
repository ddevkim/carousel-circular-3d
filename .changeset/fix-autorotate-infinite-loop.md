---
"@ddevkim/carousel-circular-3d": patch
---

fix: resolve infinite loop bug in autoRotate feature when props change dynamically

**Critical Bug Fix:**
- Fix "Maximum update depth exceeded" React error when carousel items change while autoRotate is active
- Stabilize `handleAutoRotate` callback with `useCallback` to prevent recreation on every render
- Improve cleanup logic in `useAutoRotate` hook to prevent RAF loop overlap

**Root Cause:**
- `handleAutoRotate` callback was recreated on every render (not wrapped in `useCallback`)
- When parent re-renders (e.g., album selection change), new callback reference was created
- `useAutoRotate` hook's `onRotateRef.current` was updated to new reference
- Existing `requestAnimationFrame` loops continued calling the new callback
- New callback triggered `setAutoRotation` → re-render → new callback → infinite loop

**Changes:**
1. **useCarouselRotation.ts**: Wrap `handleAutoRotate` in `useCallback` with empty deps array
2. **useAutoRotate.ts**: Call `cleanup()` at start of useEffect to cancel previous animations before starting new ones

**Impact:**
- Fixes application crashes in dynamic carousel scenarios (album galleries, product catalogs)
- Prevents CPU usage spikes (100% before crash)
- Resolves memory leaks during rapid prop changes

**Related Issues:**
- Regression from v0.3.3 refactoring (removal of "excessive memoization")
- Similar to issue fixed in v0.3.1, but in different location
