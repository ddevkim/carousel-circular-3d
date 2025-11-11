import { easeOutCubic, normalizeAngle360 } from './helpers';

/**
 * Rotation 애니메이션 상태
 */
export interface RotationAnimationState {
  /** 애니메이션 프레임 ID */
  animationId: number | null;
  /** 애니메이션 시작 시간 */
  startTime: number | null;
  /** 시작 각도 */
  startAngle: number;
  /** 목표 각도 */
  targetAngle: number;
  /** 현재 각도 */
  currentAngle: number;
}

/**
 * 회전 방향
 */
export type RotationDirection = 'clockwise' | 'counterClockwise' | 'auto';

/**
 * 두 각도 간 최단 거리 delta 계산 (360도 환형 구조)
 * @param fromAngle - 시작 각도 (degree)
 * @param toAngle - 목표 각도 (degree)
 * @param direction - 회전 방향 ('clockwise': 양수, 'counterClockwise': 음수, 'auto': 최단)
 * @returns 최단 거리 delta (degree, -180 ~ +180 범위)
 */
export function calculateShortestDelta(
  fromAngle: number,
  toAngle: number,
  direction: RotationDirection = 'auto'
): number {
  const from = normalizeAngle360(fromAngle);
  const to = normalizeAngle360(toAngle);

  let delta = to - from;

  // 방향이 명시된 경우 처리
  if (direction === 'clockwise') {
    // 항상 양수 (시계방향)
    if (delta < 0) {
      delta += 360;
    }
  } else if (direction === 'counterClockwise') {
    // 항상 음수 (반시계방향)
    if (delta > 0) {
      delta -= 360;
    }
  } else {
    // auto: 최단 거리
    // -180 ~ +180 범위로 정규화
    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }
  }

  return delta;
}

/**
 * Rotation 애니메이션 시작
 * @param state - 애니메이션 상태 객체
 * @param fromAngle - 시작 각도 (degree)
 * @param toAngle - 목표 각도 (degree)
 * @param duration - 애니메이션 지속 시간 (ms)
 * @param direction - 회전 방향 ('clockwise', 'counterClockwise', 'auto')
 * @param onUpdate - 각 프레임마다 호출되는 콜백 (현재 각도 전달)
 * @param onComplete - 애니메이션 완료 시 호출되는 콜백
 */
export function startRotationAnimation(
  state: RotationAnimationState,
  fromAngle: number,
  toAngle: number,
  duration: number,
  direction: RotationDirection = 'auto',
  onUpdate: (angle: number) => void,
  onComplete: () => void
): void {
  // 기존 애니메이션 즉시 취소
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }

  state.startTime = performance.now();
  state.startAngle = fromAngle;
  state.targetAngle = toAngle;
  state.currentAngle = fromAngle;

  // 방향을 고려한 delta 계산 (명시된 방향 우선)
  const totalDelta = calculateShortestDelta(fromAngle, toAngle, direction);

  // delta가 0이면 즉시 완료
  if (Math.abs(totalDelta) < 0.01) {
    state.currentAngle = toAngle;
    state.animationId = null;
    onComplete();
    return;
  }

  const animate = () => {
    if (state.startTime === null) {
      state.animationId = null;
      return;
    }

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    // 시작 각도 + (총 delta * eased progress)
    const newAngle = state.startAngle + totalDelta * easedProgress;
    state.currentAngle = newAngle;

    if (progress >= 1) {
      // 애니메이션 완료 - 정확한 타겟 각도로 설정
      state.currentAngle = toAngle;
      state.startTime = null;
      state.animationId = null;
      onComplete();
      return;
    }

    onUpdate(newAngle);
    state.animationId = requestAnimationFrame(animate);
  };

  state.animationId = requestAnimationFrame(animate);
}

/**
 * Rotation 애니메이션 취소
 * @param state - 애니메이션 상태 객체
 */
export function cancelRotationAnimation(state: RotationAnimationState): void {
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  }
  state.startTime = null;
}

/**
 * Rotation 애니메이션 상태 객체 생성
 * @returns 초기화된 애니메이션 상태 객체
 */
export function createRotationAnimationState(): RotationAnimationState {
  return {
    animationId: null,
    startTime: null,
    startAngle: 0,
    targetAngle: 0,
    currentAngle: 0,
  };
}
