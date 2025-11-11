import { AUTO_ROTATE_EASING_DURATION } from '../constants';
import { easeInOutCubic } from './helpers';

/**
 * Easing 애니메이션 방향
 */
type EasingDirection = 'start' | 'stop';

/**
 * Easing 애니메이션 상태
 */
export interface EasingState {
  /** 애니메이션 프레임 ID */
  animationId: number | null;
  /** Easing 시작 시간 */
  startTime: number | null;
  /** Easing 방향 */
  direction: EasingDirection | null;
  /** 현재 속도 */
  currentSpeed: number;
}

/**
 * Easing 애니메이션 시작 (0에서 목표 속도로)
 * @param state - Easing 상태 객체
 * @param targetSpeed - 목표 속도
 * @param onUpdate - 각 프레임마다 호출되는 콜백
 * @param onComplete - Easing 완료 시 호출되는 콜백
 * @returns 애니메이션 프레임 ID 또는 null
 */
export function startEasingAnimation(
  state: EasingState,
  targetSpeed: number,
  onUpdate: (speed: number) => void,
  onComplete: () => void
): number | null {
  // 기존 애니메이션 취소
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }

  state.startTime = performance.now();
  state.direction = 'start';

  const animate = () => {
    if (state.startTime === null || state.direction !== 'start') {
      state.animationId = null;
      return;
    }

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / AUTO_ROTATE_EASING_DURATION, 1);
    const easedProgress = easeInOutCubic(progress);

    // 0에서 targetSpeed로 증가
    const newSpeed = targetSpeed * easedProgress;
    state.currentSpeed = newSpeed;

    if (progress >= 1) {
      // Easing 완료
      state.currentSpeed = targetSpeed;
      state.startTime = null;
      state.direction = null;
      state.animationId = null;
      onComplete();
      return;
    }

    onUpdate(newSpeed);
    state.animationId = requestAnimationFrame(animate);
  };

  state.animationId = requestAnimationFrame(animate);
  return state.animationId;
}

/**
 * Easing 애니메이션 종료 (현재 속도에서 0으로)
 * @param state - Easing 상태 객체
 * @param onUpdate - 각 프레임마다 호출되는 콜백
 * @param onComplete - Easing 완료 시 호출되는 콜백
 * @returns 애니메이션 프레임 ID 또는 null
 */
export function stopEasingAnimation(
  state: EasingState,
  onUpdate: (speed: number) => void,
  onComplete: () => void
): number | null {
  // 기존 애니메이션 취소
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }

  // 현재 속도가 0이면 즉시 완료
  if (state.currentSpeed <= 0) {
    state.currentSpeed = 0;
    state.animationId = null;
    onComplete();
    return null;
  }

  const startSpeed = state.currentSpeed;
  state.startTime = performance.now();
  state.direction = 'stop';

  const animate = () => {
    if (state.startTime === null || state.direction !== 'stop') {
      state.animationId = null;
      onComplete();
      return;
    }

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / AUTO_ROTATE_EASING_DURATION, 1);
    const easedProgress = easeInOutCubic(progress);

    // 현재 속도에서 0으로 감소
    const newSpeed = startSpeed * (1 - easedProgress);
    state.currentSpeed = newSpeed;

    if (progress >= 1) {
      // Easing 완료
      state.currentSpeed = 0;
      state.startTime = null;
      state.direction = null;
      state.animationId = null;
      onComplete();
      return;
    }

    onUpdate(newSpeed);
    state.animationId = requestAnimationFrame(animate);
  };

  state.animationId = requestAnimationFrame(animate);
  return state.animationId;
}

/**
 * Easing 애니메이션 취소
 * @param state - Easing 상태 객체
 */
export function cancelEasingAnimation(state: EasingState): void {
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  state.startTime = null;
  state.direction = null;
}

/**
 * Easing 상태 객체 생성
 * @returns 초기화된 Easing 상태 객체
 */
export function createEasingState(): EasingState {
  return {
    animationId: null,
    startTime: null,
    direction: null,
    currentSpeed: 0,
  };
}
