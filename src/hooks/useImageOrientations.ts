import { useEffect, useState } from 'react';
import type { CarouselItem, ImageOrientation, LQIPInfo } from '../types';
import {
  getCachedOrientation,
  loadImageOrientation,
  setCachedOrientation,
} from '../utils/imageOrientationCache';
import { determineOrientation } from '../utils/orientationCalculator';

/**
 * 이미지 방향 정보를 담는 맵
 */
export type OrientationMap = Map<string | number, ImageOrientation>;

/**
 * useImageOrientations Hook의 반환 타입
 */
export interface UseImageOrientationsReturn {
  /** 이미지 방향 맵 */
  orientationMap: OrientationMap;
  /** 로딩 완료 여부 */
  isLoaded: boolean;
}

/**
 * LQIP 정보로부터 orientation을 즉시 계산한다.
 * @param lqip - LQIP 정보
 * @returns ImageOrientation
 */
function getOrientationFromLQIP(lqip: LQIPInfo): ImageOrientation {
  const aspectRatio = lqip.width / lqip.height;
  return determineOrientation(aspectRatio);
}

/**
 * 초기 orientation 맵을 구성한다 (LQIP 및 캐시 활용)
 * @param items - CarouselItem 배열
 * @returns { newMap, itemsToLoad } - 초기 맵과 로드할 아이템 목록
 */
function buildInitialOrientationMap(items: CarouselItem[]): {
  newMap: Map<string | number, ImageOrientation>;
  itemsToLoad: Array<{ id: string | number; imageUrl: string }>;
} {
  const newMap = new Map<string | number, ImageOrientation>();
  const itemsToLoad: Array<{ id: string | number; imageUrl: string }> = [];

  // 이미지가 있는 아이템 처리
  const imageItems = items.filter(
    (item): item is CarouselItem & { image: string } => 'image' in item && Boolean(item.image)
  );

  for (const item of imageItems) {
    // 1순위: 글로벌 캐시 확인 (가장 빠름)
    const cachedOrientation = getCachedOrientation(item.image);
    if (cachedOrientation !== undefined) {
      newMap.set(item.id, cachedOrientation);
      continue;
    }

    // 2순위: LQIP가 있는 경우 즉시 orientation 계산 후 캐시 저장
    if ('lqip' in item && item.lqip) {
      const orientation = getOrientationFromLQIP(item.lqip);
      newMap.set(item.id, orientation);
      // LQIP로 계산한 orientation도 캐시에 저장
      setCachedOrientation(item.image, orientation);
      continue;
    }

    // 3순위: LQIP도 캐시도 없는 경우 나중에 로드할 목록에 추가
    itemsToLoad.push({ id: item.id, imageUrl: item.image });
  }

  // content만 있는 아이템은 기본값으로 square 설정
  for (const item of items) {
    if (!newMap.has(item.id) && !('image' in item)) {
      newMap.set(item.id, 'square');
    }
  }

  return { newMap, itemsToLoad };
}

/**
 * 모든 아이템의 이미지 방향을 분석하는 Hook
 * LQIP가 제공되는 경우 즉시 orientation을 계산하고, 그렇지 않으면 이미지를 로드한다.
 * @param items - CarouselItem 배열
 * @returns { orientationMap, isLoaded } - 방향 맵과 로딩 완료 여부
 */
export function useImageOrientations(items: CarouselItem[]): UseImageOrientationsReturn {
  const [orientationMap, setOrientationMap] = useState<OrientationMap>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadOrientations = async () => {
      const { newMap, itemsToLoad } = buildInitialOrientationMap(items);

      // 모든 아이템이 LQIP를 가지고 있거나 content인 경우
      if (itemsToLoad.length === 0) {
        setOrientationMap(newMap);
        setIsLoaded(true);
        return;
      }

      // LQIP가 없는 아이템들만 이미지를 로드해야 함
      // 로딩 전에 초기 맵 설정 (LQIP가 있는 아이템은 이미 orientation 계산됨)
      setOrientationMap(new Map(newMap));
      setIsLoaded(itemsToLoad.length === 0); // LQIP 없는 아이템이 있으면 아직 로딩 중

      // LQIP가 없는 아이템들을 병렬로 로드하여 orientation 결정
      await Promise.all(
        itemsToLoad.map(async ({ id, imageUrl }) => {
          const orientation = await loadImageOrientation(imageUrl);
          newMap.set(id, orientation);
        })
      );

      // 모든 로딩 완료 후 최종 맵 설정
      setOrientationMap(newMap);
      setIsLoaded(true);
    };

    // 로딩 시작
    setIsLoaded(false);
    loadOrientations();
  }, [items]);

  return { orientationMap, isLoaded };
}
