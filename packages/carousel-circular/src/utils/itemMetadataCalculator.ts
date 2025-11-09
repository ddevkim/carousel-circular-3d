import type { OrientationMap } from '../hooks/useImageOrientations';
import type { CarouselItem, ImageOrientation, ItemWithOrientation } from '../types';

import { calculateContainerSize, ORIENTATION_RATIOS } from './orientationCalculator';

/**
 * 아이템 배열과 orientation 맵을 기반으로 각 아이템의 메타데이터를 계산한다.
 * @param items - CarouselItem 배열
 * @param orientationMap - 아이템 id를 key로 하는 orientation 맵
 * @param baseHeight - 기준 높이 (px)
 * @returns ItemWithOrientation 배열
 */
export function calculateItemsMetadata(
  items: CarouselItem[],
  orientationMap: OrientationMap,
  baseHeight: number
): ItemWithOrientation[] {
  // 1단계: 각 아이템의 방향과 크기 결정
  // orientationMap이 비어있어도 기본값 'square'를 사용하여 계산
  const itemsWithSize = items.map((item) => {
    const orientation: ImageOrientation = orientationMap.get(item.id) ?? 'square';
    const { width, height } = calculateContainerSize(orientation, baseHeight);

    return {
      item,
      orientation,
      width,
      height,
    };
  });

  // 2단계: 전체 원주를 360도로 가정하고, 각 아이템이 차지할 각도를 비율로 계산
  // 순수한 orientation 비율을 사용 (스케일 팩터 영향 없이)
  const totalAspectRatio = itemsWithSize.reduce((sum, { orientation }) => {
    const ratio = ORIENTATION_RATIOS[orientation];
    const aspectRatio = ratio.width / ratio.height;
    return sum + aspectRatio;
  }, 0);

  // 각 아이템의 각도 비율 = (해당 아이템의 aspectRatio) / (전체 aspectRatio의 합)
  const itemsWithAngle = itemsWithSize.map(({ item, orientation, width, height }) => {
    const ratio = ORIENTATION_RATIOS[orientation];
    const aspectRatio = ratio.width / ratio.height;
    const angle = (aspectRatio / totalAspectRatio) * 360;

    return {
      item,
      orientation,
      width,
      height,
      angle,
    };
  });

  // 3단계: 누적 각도 계산
  // 첫 번째 아이템의 중심을 0도에 맞추기 위해 첫 아이템 각도의 절반만큼 음수 오프셋 적용
  const firstItemAngle = itemsWithAngle[0]?.angle ?? 0;
  const angleOffset = -firstItemAngle / 2;

  // cumulativeAngle은 아이템의 시작 각도
  // 실제 rotateY는 아이템의 중심 각도 (cumulativeAngle + angle/2 + angleOffset)를 사용
  let cumulativeAngle = 0;
  const result: ItemWithOrientation[] = itemsWithAngle.map((metadata) => {
    // 아이템의 중심 각도 계산 (오프셋 적용)
    const centerAngle = cumulativeAngle + metadata.angle / 2 + angleOffset;

    const itemWithOrientation: ItemWithOrientation = {
      ...metadata,
      cumulativeAngle: centerAngle, // 중심 각도를 저장
    };

    cumulativeAngle += metadata.angle;

    return itemWithOrientation;
  });

  return result;
}

/**
 * ItemWithOrientation 배열에서 특정 인덱스의 메타데이터를 가져온다.
 * @param itemsMetadata - ItemWithOrientation 배열
 * @param index - 아이템 인덱스
 * @returns ItemWithOrientation 또는 null
 */
export function getItemMetadata(
  itemsMetadata: ItemWithOrientation[],
  index: number
): ItemWithOrientation | null {
  if (index < 0 || index >= itemsMetadata.length) {
    return null;
  }

  return itemsMetadata[index] ?? null;
}
