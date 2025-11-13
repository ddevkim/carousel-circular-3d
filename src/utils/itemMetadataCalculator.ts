import type { OrientationMap } from '../hooks/useImageOrientations';
import type { CarouselItem, ImageOrientation, ItemWithOrientation } from '../types';

import { calculateContainerSize } from './orientationCalculator';

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
  // 실제 container width를 기반으로 계산하여 간격이 일정하도록 함
  const totalWidth = itemsWithSize.reduce((sum, { width }) => sum + width, 0);

  // 각 아이템의 각도 비율 = (해당 아이템의 width) / (전체 width의 합) * 360도
  // 이렇게 하면 각 container의 width + gap이 균등하게 360도를 구성
  const itemsWithAngle = itemsWithSize.map(({ item, orientation, width, height }) => {
    const angle = (width / totalWidth) * 360;

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
