import { PX_TO_REM_BASE } from '../constants';

/**
 * px 값을 rem 단위로 변환
 * @param px - 픽셀 값
 * @returns rem 값 (1rem = 16px 기준)
 */
export function pxToRem(px: number): number {
  return px / PX_TO_REM_BASE;
}

/**
 * 각도를 0-360 범위로 정규화
 * @param angle - 정규화할 각도 (degree)
 * @returns 0-360 범위의 각도
 */
export function normalizeAngle360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * 각도를 0-180 범위로 정규화
 * 180도 이상이면 360에서 빼서 거울 대칭 처리
 * @param angle - 정규화할 각도 (degree, 0-360 범위 가정)
 * @returns 0-180 범위의 각도 (절대값)
 */
export function normalizeAngle180(angle: number): number {
  const normalized = angle > 180 ? 360 - angle : angle;
  return Math.abs(normalized);
}

/**
 * perspective 값을 계산 (자동 또는 수동)
 * @param radius - 원의 반지름 (px)
 * @param customPerspective - 사용자 지정 perspective (px, optional)
 * @param multiplier - 기본 배율
 * @param minMultiplier - 최소 배율
 * @returns 계산된 perspective 값 (px)
 */
export function calculatePerspective(
  radius: number,
  customPerspective: number | undefined,
  multiplier: number,
  minMultiplier: number
): number {
  if (customPerspective !== undefined) {
    // 사용자 지정값이 있으면 최소값만 체크
    return Math.max(customPerspective, radius * minMultiplier);
  }
  // 자동 계산: radius * multiplier
  return radius * multiplier;
}

/**
 * Cubic ease-in-out easing 함수
 * @param t - 진행도 (0-1)
 * @returns easing된 값 (0-1)
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Cubic ease-out easing 함수 (빠르게 시작, 천천히 종료)
 * @param t - 진행도 (0-1)
 * @returns easing된 값 (0-1)
 */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
