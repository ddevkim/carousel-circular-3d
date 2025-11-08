import type { ItemTransform } from '../types';
import { normalizeAngle180, normalizeAngle360, pxToRem } from './helpers';

/**
 * Transform 계산에 필요한 파라미터
 */
export interface TransformCalculationParams {
  /** 아이템 인덱스 */
  itemIndex: number;
  /** 아이템당 각도 간격 (degree) */
  anglePerItem: number;
  /** 최종 회전 각도 (degree) */
  finalRotation: number;
  /** 원의 반지름 (px) */
  radius: number;
  /** 투명도 범위 [최소, 최대] */
  opacityRange: [number, number];
  /** 크기 스케일 범위 [최소, 최대] */
  scaleRange: [number, number];
  /** 개별 아이템 Z축 깊이 변동 강도 */
  depthIntensity: number;
}

/**
 * 아이템별 transform 계산 (최적화)
 * @param params - Transform 계산 파라미터
 * @returns ItemTransform 객체
 */
export function calculateItemTransform(params: TransformCalculationParams): ItemTransform {
  const {
    itemIndex,
    anglePerItem,
    finalRotation,
    radius,
    opacityRange,
    scaleRange,
    depthIntensity,
  } = params;

  const itemAngle = itemIndex * anglePerItem;

  // 정규화된 각도 계산
  const totalRotation = normalizeAngle360(finalRotation);
  const relativeAngle = normalizeAngle360(itemAngle + totalRotation);
  const normalizedAngle = normalizeAngle180(relativeAngle);

  // Opacity 계산
  const [minOpacity, maxOpacity] = opacityRange;
  const opacityRatio = Math.abs(normalizedAngle) / 180;
  const opacity = Math.max(minOpacity, maxOpacity - opacityRatio * (maxOpacity - minOpacity));

  // Scale 계산
  const [minScale, maxScale] = scaleRange;
  const scaleRatio = Math.abs(normalizedAngle) / 180;
  const scale = Math.max(minScale, maxScale - scaleRatio * (maxScale - minScale));

  // Z-index 계산 (앞쪽 아이템이 위로)
  const radian = ((itemAngle - finalRotation) * Math.PI) / 180;
  const zIndex = Math.round(Math.cos(radian) * 100);

  // Transform 문자열 (미리 계산된 값 사용)
  // Calculate Z depth variation based on item visibility
  const zDepthVariation = Math.cos((normalizedAngle * Math.PI) / 180) * depthIntensity;
  const radiusInRem = pxToRem(radius);
  const totalZ = radiusInRem + zDepthVariation;
  const transform = `rotateY(${itemAngle}deg) translateZ(${totalZ}rem) scale(${scale})`;

  return { transform, opacity, zIndex };
}
