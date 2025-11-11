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
