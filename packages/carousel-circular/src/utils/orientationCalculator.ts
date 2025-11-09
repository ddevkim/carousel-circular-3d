import type { ImageOrientation, OrientationRatio } from '../types';

/**
 * 방향별 표준 비율 상수
 */
export const ORIENTATION_RATIOS: Record<ImageOrientation, OrientationRatio> = {
  portrait: { width: 3, height: 4 },
  square: { width: 1, height: 1 },
  landscape: { width: 4, height: 3 },
};

/**
 * 이미지의 aspect ratio를 기준으로 가장 가까운 orientation을 결정한다.
 * @param aspectRatio - 이미지의 width / height 비율
 * @returns ImageOrientation (square, portrait, landscape)
 */
export function determineOrientation(aspectRatio: number): ImageOrientation {
  const ratios: Array<{ type: ImageOrientation; value: number }> = [
    {
      type: 'portrait',
      value: ORIENTATION_RATIOS.portrait.width / ORIENTATION_RATIOS.portrait.height,
    }, // 0.75
    { type: 'square', value: ORIENTATION_RATIOS.square.width / ORIENTATION_RATIOS.square.height }, // 1.0
    {
      type: 'landscape',
      value: ORIENTATION_RATIOS.landscape.width / ORIENTATION_RATIOS.landscape.height,
    }, // 1.333
  ];

  // 가장 가까운 비율 찾기
  let closestOrientation: ImageOrientation = 'square';
  let minDifference = Number.POSITIVE_INFINITY;

  for (const { type, value } of ratios) {
    const difference = Math.abs(aspectRatio - value);
    if (difference < minDifference) {
      minDifference = difference;
      closestOrientation = type;
    }
  }

  return closestOrientation;
}

/**
 * 아이템 크기 스케일 팩터 (컨테이너 overflow 방지)
 * containerHeight에 맞춰 90%로 제한하여 여유 공간 확보
 */
const ITEM_SIZE_SCALE_FACTOR = 0.9;

/**
 * 기준 높이를 기반으로 orientation에 맞는 컨테이너 크기를 계산한다.
 * 컨테이너 overflow를 방지하기 위해 스케일 팩터를 적용한다.
 * @param orientation - 이미지 방향
 * @param baseHeight - 기준 높이 (containerHeight, px)
 * @returns { width: number, height: number } 컨테이너 크기 (px)
 */
export function calculateContainerSize(
  orientation: ImageOrientation,
  baseHeight: number
): { width: number; height: number } {
  // 스케일 팩터를 적용하여 containerHeight 내에서 아이템 크기 제한
  const scaledHeight = baseHeight * ITEM_SIZE_SCALE_FACTOR;
  const ratio = ORIENTATION_RATIOS[orientation];
  const width = (scaledHeight * ratio.width) / ratio.height;

  return {
    width: Math.round(width),
    height: Math.round(scaledHeight),
  };
}

/**
 * orientation에 따른 아이템 각도를 계산한다.
 * 더 넓은 아이템일수록 더 많은 각도를 차지해야 한다.
 * @param orientation - 이미지 방향
 * @param baseAngle - 기본 각도 (square 기준)
 * @returns 조정된 각도
 */
export function calculateAngleForOrientation(
  orientation: ImageOrientation,
  baseAngle: number
): number {
  const ratio = ORIENTATION_RATIOS[orientation];
  const aspectRatio = ratio.width / ratio.height;

  // portrait (0.75): 작은 각도
  // square (1.0): 기본 각도
  // landscape (1.33): 큰 각도
  return baseAngle * aspectRatio;
}
