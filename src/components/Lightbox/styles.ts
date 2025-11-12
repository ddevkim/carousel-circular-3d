import type { CSSProperties } from 'react';

/**
 * Lightbox 스타일 생성 함수들
 */
export function createBackdropStyle(
  backgroundBlur: number,
  animationDuration: number,
  isClosing: boolean
): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 9998,
    backdropFilter: `blur(${backgroundBlur * 2}px)`,
    WebkitBackdropFilter: `blur(${backgroundBlur * 2}px)`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${animationDuration}ms ease-out`,
    opacity: isClosing ? 0 : 1,
    pointerEvents: 'auto',
  };
}

export function createImageContainerStyle(containerPadding: number): CSSProperties {
  return {
    position: 'absolute',
    inset: `${containerPadding}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 9999,
  };
}

export function createImageStyle(): CSSProperties {
  return {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    display: 'block',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'auto',
    userSelect: 'none',
    position: 'relative',
    zIndex: 9999,
  };
}
