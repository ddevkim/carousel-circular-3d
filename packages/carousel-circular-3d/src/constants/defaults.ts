/**
 * 기본 Props 값
 */
export const DEFAULT_PROPS = {
  /** 원의 반지름 (px) */
  RADIUS: 600,
  /** 아이템 너비 (px) */
  ITEM_WIDTH: 300,
  /** 아이템 높이 (px) */
  ITEM_HEIGHT: 400,
  /** 드래그 민감도 배율 */
  DRAG_SENSITIVITY: 1.0,
  /** 관성 마찰 계수 */
  MOMENTUM_FRICTION: 0.95,
  /** 관성 효과 활성화 */
  ENABLE_MOMENTUM: true,
  /** 키보드 네비게이션 활성화 */
  ENABLE_KEYBOARD_NAVIGATION: true,
  /** 자동 회전 활성화 */
  AUTO_ROTATE: false,
  /** 자동 회전 속도 (degree/frame) */
  AUTO_ROTATE_SPEED: 0.1,
  /** 자동 회전 재개 딜레이 (ms) */
  AUTO_ROTATE_RESUME_DELAY: 3000,
  /** 자동 회전 easing 지속 시간 (ms) */
  AUTO_ROTATE_EASING_DURATION: 500,
  /** Opacity 범위 [min, max] */
  OPACITY_RANGE: [0.2, 1] as [number, number],
  /** Scale 범위 [min, max] */
  SCALE_RANGE: [0.7, 1] as [number, number],
  /** 컨테이너 aria-label */
  ARIA_LABEL: 'Circular Carousel',
  /** 최대 아이템 수 */
  MAX_ITEMS: 30,
  /** 카메라 각도 (degree) */
  CAMERA_ANGLE: 0,
  /** 개별 아이템 Z축 깊이 변동 강도 */
  DEPTH_INTENSITY: 0,
  /** 컨테이너 높이 (px) */
  CONTAINER_HEIGHT: 600,
} as const;
