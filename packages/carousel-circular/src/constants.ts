/**
 * 드래그 및 관성 애니메이션 관련 상수
 */
export const DRAG_CONSTANTS = {
  /** 관성 애니메이션 시작 최소 속도 (degree/frame) */
  MOMENTUM_START_THRESHOLD: 0.5,
  /** 관성 애니메이션 종료 속도 (degree/frame) */
  MOMENTUM_STOP_THRESHOLD: 0.01,
  /** 클릭과 구분하기 위한 최소 이동 거리 (px) */
  DRAG_START_DISTANCE: 5,
} as const;

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
} as const;

/**
 * px to rem 변환 기준
 */
export const PX_TO_REM_BASE = 16;

/**
 * perspective 자동 계산 배율
 * perspective = radius * PERSPECTIVE_MULTIPLIER
 */
export const PERSPECTIVE_MULTIPLIER = 3.33;

/**
 * perspective 최소 배율
 * perspective >= radius * PERSPECTIVE_MIN_MULTIPLIER
 */
export const PERSPECTIVE_MIN_MULTIPLIER = 2;

/**
 * 자동 회전 start/stop easing 지속 시간 (ms)
 */
export const AUTO_ROTATE_EASING_DURATION = 800;

/**
 * 키보드 네비게이션 회전 애니메이션 지속 시간 (ms)
 */
export const KEYBOARD_ROTATION_DURATION = 500;

/**
 * 키보드 입력 debounce 시간 (ms)
 * 키 연속 입력 시 너무 많은 이벤트 방지
 * 이 값을 줄이면 더 빠르게 반응하고, 늘리면 더 천천히 반응합니다.
 * 권장값: 100-300ms
 */
export const KEYBOARD_DEBOUNCE_MS = 50;
