import { useCallback, useEffect, useRef, useState } from 'react';
import { LIGHTBOX_CONSTANTS } from '../constants';
import type { LightboxOptions, LightboxState } from '../types';

/**
 * useLightbox Hook Props
 */
interface UseLightboxProps {
  /** Lightbox 활성화 여부 */
  enabled: boolean;
  /** 전체 아이템 개수 */
  itemCount: number;
  /** Carousel 회전 함수 (인덱스 delta 전달) */
  onRotateCarousel: (delta: number) => void;
  /** Lightbox 옵션 */
  options?: LightboxOptions;
}

/**
 * useLightbox Hook Return
 */
export interface UseLightboxReturn {
  /** Lightbox 상태 */
  lightboxState: LightboxState;
  /** Lightbox 열기 */
  openLightbox: (index: number, sourceElement: HTMLElement) => void;
  /** Lightbox 닫기 */
  closeLightbox: () => void;
  /** 이전/다음 이미지로 이동 */
  navigateLightbox: (direction: 'prev' | 'next') => void;
}

/**
 * Lightbox 상태 관리 및 키보드/터치 이벤트 처리 Hook
 * @param props - useLightbox Hook Props
 * @returns useLightbox Hook Return
 */
export function useLightbox({
  enabled,
  itemCount,
  onRotateCarousel,
  options,
}: UseLightboxProps): UseLightboxReturn {
  const [lightboxState, setLightboxState] = useState<LightboxState>({
    isOpen: false,
    selectedIndex: 0,
    sourceRect: null,
    sourceTransform: null,
  });

  // 터치 이벤트 처리용 ref
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // 옵션 기본값 적용
  const enableKeyboardNav =
    options?.enableKeyboardNavigation ?? LIGHTBOX_CONSTANTS.ENABLE_KEYBOARD_NAVIGATION;
  const closeOnEsc = options?.closeOnEsc ?? LIGHTBOX_CONSTANTS.CLOSE_ON_ESC;
  const swipeThreshold = LIGHTBOX_CONSTANTS.SWIPE_THRESHOLD;

  /**
   * Lightbox 열기
   * @param index - 선택된 아이템 인덱스
   * @param sourceElement - 클릭된 소스 요소
   */
  const openLightbox = useCallback(
    (index: number, sourceElement: HTMLElement) => {
      if (!enabled) return;

      const rect = sourceElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(sourceElement);
      const transform = computedStyle.transform;

      setLightboxState({
        isOpen: true,
        selectedIndex: index,
        sourceRect: rect,
        sourceTransform: transform !== 'none' ? transform : null,
      });
    },
    [enabled]
  );

  /**
   * Lightbox 닫기
   */
  const closeLightbox = useCallback(() => {
    setLightboxState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  /**
   * 이전/다음 이미지로 이동
   * Lightbox 이미지와 Carousel 회전 방향이 반대로 동작
   * @param direction - 이동 방향 ('prev' | 'next')
   */
  const navigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (!lightboxState.isOpen) return;

      const delta = direction === 'prev' ? 1 : -1;
      const newIndex = (lightboxState.selectedIndex + delta + itemCount) % itemCount;

      setLightboxState((prev) => ({
        ...prev,
        selectedIndex: newIndex,
      }));

      // Carousel은 반대 방향으로 회전
      onRotateCarousel(delta);
    },
    [lightboxState.isOpen, lightboxState.selectedIndex, itemCount, onRotateCarousel]
  );

  /**
   * 키보드 이벤트 핸들러
   * Lightbox에서는 carousel과 반대 방향으로 동작
   * - ArrowRight: 이전 이미지 (낮은 index, carousel은 시계방향 회전)
   * - ArrowLeft: 다음 이미지 (높은 index, carousel은 반시계방향 회전)
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxState.isOpen) return;

      switch (e.key) {
        case 'Escape':
          if (closeOnEsc) {
            e.preventDefault();
            closeLightbox();
          }
          break;
        case 'ArrowLeft':
          if (enableKeyboardNav) {
            e.preventDefault();
            // Lightbox: 다음 이미지 (carousel은 반시계방향)
            navigateLightbox('next');
          }
          break;
        case 'ArrowRight':
          if (enableKeyboardNav) {
            e.preventDefault();
            // Lightbox: 이전 이미지 (carousel은 시계방향)
            navigateLightbox('prev');
          }
          break;
      }
    },
    [lightboxState.isOpen, closeOnEsc, enableKeyboardNav, closeLightbox, navigateLightbox]
  );

  /**
   * 터치 시작 이벤트 핸들러
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }, []);

  /**
   * 터치 종료 이벤트 핸들러 (스와이프 감지)
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!lightboxState.isOpen) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = touchEndY - touchStartYRef.current;

      // 수평 스와이프가 수직 스와이프보다 큰 경우만 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        e.preventDefault();
        if (deltaX > 0) {
          // 오른쪽 스와이프 → 이전 이미지
          navigateLightbox('prev');
        } else {
          // 왼쪽 스와이프 → 다음 이미지
          navigateLightbox('next');
        }
      }
    },
    [lightboxState.isOpen, swipeThreshold, navigateLightbox]
  );

  /**
   * 키보드 및 터치 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!lightboxState.isOpen) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxState.isOpen, handleKeyDown, handleTouchStart, handleTouchEnd]);

  /**
   * Lightbox 열릴 때 body 스크롤 방지
   */
  useEffect(() => {
    if (lightboxState.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxState.isOpen]);

  return {
    lightboxState,
    openLightbox,
    closeLightbox,
    navigateLightbox,
  };
}
