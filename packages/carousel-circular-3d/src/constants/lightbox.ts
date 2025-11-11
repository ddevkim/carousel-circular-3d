/**
 * Lightbox 관련 상수
 */
export const LIGHTBOX_CONSTANTS = {
  /** 애니메이션 지속 시간 (ms) */
  ANIMATION_DURATION: 300,
  /** 배경 blur 강도 (px) */
  BACKGROUND_BLUR: 8,
  /** 키보드 네비게이션 활성화 */
  ENABLE_KEYBOARD_NAVIGATION: true,
  /** ESC 키로 닫기 활성화 */
  CLOSE_ON_ESC: true,
  /** 터치 스와이프 최소 거리 (px) */
  SWIPE_THRESHOLD: 50,
  /** 이미지 최대 너비 (viewport 기준, %) */
  MAX_IMAGE_WIDTH: 90,
  /** 이미지 최대 높이 (viewport 기준, %) */
  MAX_IMAGE_HEIGHT: 85,
  /** Lightbox 컨테이너 padding (px) */
  CONTAINER_PADDING: 40,
} as const;
