import type { CSSProperties } from 'react';
import type { ImageOrientation, ItemTransform } from '../types';
import { pxToRem } from './helpers';
import { calculateContainerSize } from './orientationCalculator';

/**
 * 아이템 스타일 계산 파라미터
 */
export interface ItemStyleParams {
  /** 컨테이너 높이 (px) */
  containerHeight: number;
  /** 이미지 방향 */
  orientation: ImageOrientation;
  /** Transform 계산 결과 */
  transform: ItemTransform;
  /** 뒤쪽 아이템의 최소 크기 스케일 (0.0~1.0, 정면 아이템은 항상 1.0) - transform scale 효과 고려 */
  minScale: number;
  /** Perspective 값 (px) - 원근 투영 효과 고려 */
  perspective: number;
  /** 원의 반지름 (px) - translateZ 계산에 사용 */
  radius: number;
  /** 클릭 가능 여부 */
  isClickable: boolean;
}

/**
 * 아이템 기본 스타일을 계산한다.
 * containerHeight와 orientation을 기반으로 크기를 동적으로 계산한다.
 * minScale, perspective, translateZ를 모두 고려하여 실제 렌더링 크기가 containerHeight를 초과하지 않도록 한다.
 * @param params - 스타일 계산 파라미터
 * @returns CSS 스타일 객체
 */
export function calculateItemStyle(params: ItemStyleParams): CSSProperties {
  const { containerHeight, orientation, transform, perspective, radius, isClickable } = params;

  // 1. maxScale은 항상 1.0 고정
  const maxScale = 1.0;

  // 2. translateZ의 최대값 계산 (앞쪽 아이템, depthIntensity 최대 고려)
  // transformCalculator에서: translateZ = radius + depthIntensity
  // 최대 depthIntensity는 normalizedAngle=0일 때 cos(0) * depthIntensity = depthIntensity
  // 보수적으로 radius만 사용 (depthIntensity는 일반적으로 작음)
  const maxTranslateZ = pxToRem(radius);

  // 3. 원근 투영 배율 계산
  // 실제 크기 = 기본 크기 × (perspective / (perspective - translateZ))
  const perspectiveInRem = pxToRem(perspective);
  const perspectiveScale = perspectiveInRem / (perspectiveInRem - maxTranslateZ);

  // 4. 전체 확대 배율 = scale × perspectiveScale (maxScale = 1.0으로 고정)
  const totalScale = maxScale * perspectiveScale;

  // 5. 실제 사용 가능한 높이 계산
  const effectiveHeight = containerHeight / totalScale;

  // 6. containerHeight와 orientation을 기반으로 아이템 크기 계산
  const { width: itemWidth, height: itemHeight } = calculateContainerSize(
    orientation,
    effectiveHeight
  );

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `${-pxToRem(itemWidth) / 2}rem`,
    marginTop: `${-pxToRem(itemHeight) / 2}rem`,
    width: `${pxToRem(itemWidth)}rem`,
    height: `${pxToRem(itemHeight)}rem`,
    transform: transform.transform,
    opacity: transform.opacity,
    zIndex: transform.zIndex,
    willChange: 'transform, opacity',
    transition: 'opacity 0.3s linear',
    border: 'none',
    padding: 0,
    background: 'transparent',
    pointerEvents: isClickable ? 'auto' : 'none',
    userSelect: 'none',
  };
}
