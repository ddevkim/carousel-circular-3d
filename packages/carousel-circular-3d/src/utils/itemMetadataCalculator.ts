import type { OrientationMap } from '../hooks/useImageOrientations';
import type { CarouselItem, ImageOrientation, ItemWithOrientation } from '../types';

import { calculateContainerSize } from './orientationCalculator';

/**
 * 아이템의 방향과 크기 정보
 */
interface ItemSizeData {
  item: CarouselItem;
  orientation: ImageOrientation;
  width: number;
  height: number;
}

/**
 * 단일 아이템의 orientation과 크기를 계산한다.
 * @param item - 캐러셀 아이템
 * @param orientationMap - orientation 맵
 * @param baseHeight - 기준 높이 (px)
 * @returns 아이템 크기 데이터
 */
function calculateItemSize(
  item: CarouselItem,
  orientationMap: OrientationMap,
  baseHeight: number
): ItemSizeData {
  const orientation: ImageOrientation = orientationMap.get(item.id) ?? 'square';
  const { width, height } = calculateContainerSize(orientation, baseHeight);

  return { item, orientation, width, height };
}

/**
 * 모든 아이템의 크기 데이터와 총 너비를 계산한다.
 * @param items - 아이템 배열
 * @param orientationMap - orientation 맵
 * @param baseHeight - 기준 높이 (px)
 * @returns { itemsData, totalWidth }
 */
function calculateAllItemsSizeData(
  items: CarouselItem[],
  orientationMap: OrientationMap,
  baseHeight: number
): { itemsData: ItemSizeData[]; totalWidth: number } {
  const itemCount = items.length;
  const itemsData: ItemSizeData[] = new Array(itemCount);
  let totalWidth = 0;

  for (let i = 0; i < itemCount; i++) {
    const item = items[i];
    if (!item) continue;

    const sizeData = calculateItemSize(item, orientationMap, baseHeight);
    itemsData[i] = sizeData;
    totalWidth += sizeData.width;
  }

  return { itemsData, totalWidth };
}

/**
 * 첫 번째 아이템을 0도 중앙에 배치하기 위한 각도 오프셋을 계산한다.
 * @param firstItemWidth - 첫 아이템 너비
 * @param totalWidth - 전체 너비
 * @returns 각도 오프셋 (degree)
 */
function calculateAngleOffset(firstItemWidth: number, totalWidth: number): number {
  const firstItemAngle = (firstItemWidth / totalWidth) * 360;
  return -firstItemAngle / 2;
}

/**
 * 아이템의 각도와 중심 각도를 계산한다.
 * @param itemWidth - 아이템 너비
 * @param totalWidth - 전체 너비
 * @param cumulativeAngle - 누적 각도
 * @param angleOffset - 각도 오프셋
 * @returns { angle, centerAngle }
 */
function calculateItemAngles(
  itemWidth: number,
  totalWidth: number,
  cumulativeAngle: number,
  angleOffset: number
): { angle: number; centerAngle: number } {
  const angle = (itemWidth / totalWidth) * 360;
  const centerAngle = cumulativeAngle + angle / 2 + angleOffset;

  return { angle, centerAngle };
}

/**
 * 크기 데이터를 ItemWithOrientation으로 변환한다.
 * @param sizeData - 아이템 크기 데이터
 * @param angle - 아이템 각도
 * @param centerAngle - 중심 각도
 * @returns ItemWithOrientation
 */
function createItemWithOrientation(
  sizeData: ItemSizeData,
  angle: number,
  centerAngle: number
): ItemWithOrientation {
  return {
    item: sizeData.item,
    orientation: sizeData.orientation,
    width: sizeData.width,
    height: sizeData.height,
    angle,
    cumulativeAngle: centerAngle,
  };
}

/**
 * 아이템 배열과 orientation 맵을 기반으로 각 아이템의 메타데이터를 계산한다.
 *
 * 계산 과정:
 * 1. 각 아이템의 orientation과 크기 계산
 * 2. 전체 너비 대비 각 아이템의 각도 비율 계산
 * 3. 첫 번째 아이템을 0도 중앙에 배치하기 위한 오프셋 적용
 * 4. 누적 각도를 기반으로 각 아이템의 최종 위치 계산
 *
 * 성능 최적화:
 * - 단일 패스로 모든 계산 수행 (O(n))
 * - 중간 배열 최소화
 * - 각 단계를 명확한 책임을 가진 함수로 분리
 *
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
  const itemCount = items.length;
  if (itemCount === 0) return [];

  // 1단계: 모든 아이템의 크기 데이터와 총 너비 계산
  const { itemsData, totalWidth } = calculateAllItemsSizeData(items, orientationMap, baseHeight);

  // 2단계: 각도 오프셋 계산
  const firstData = itemsData[0];
  if (!firstData) return [];

  const angleOffset = calculateAngleOffset(firstData.width, totalWidth);

  // 3단계: 각 아이템의 각도와 위치 계산
  const result: ItemWithOrientation[] = new Array(itemCount);
  let cumulativeAngle = 0;

  for (let i = 0; i < itemCount; i++) {
    const data = itemsData[i];
    if (!data) continue;

    const { angle, centerAngle } = calculateItemAngles(
      data.width,
      totalWidth,
      cumulativeAngle,
      angleOffset
    );

    result[i] = createItemWithOrientation(data, angle, centerAngle);
    cumulativeAngle += angle;
  }

  return result;
}
