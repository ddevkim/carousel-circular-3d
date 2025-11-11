import { useEffect, useState } from 'react';
import type { CarouselItem, ImageOrientation, LQIPInfo } from '../types';
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
 * 이미지 URL에서 이미지를 로드하여 aspect ratio를 분석하고 orientation을 결정한다.
 *
 * 주의: 이 함수는 LQIP가 없는 경우에만 호출됩니다.
 * 브라우저의 이미지 캐싱 덕분에 이후 <img> 태그에서 같은 URL을 사용할 때
 * 네트워크 요청 없이 캐시에서 가져옵니다.
 *
 * @param imageUrl - 이미지 URL
 * @returns Promise<ImageOrientation>
 */
function loadImageOrientation(imageUrl: string): Promise<ImageOrientation> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const orientation = determineOrientation(aspectRatio);
      resolve(orientation);
    };

    img.onerror = () => {
      // 에러 발생 시 기본값으로 square 반환
      console.warn(`Failed to load image: ${imageUrl}. Defaulting to square orientation.`);
      resolve('square');
    };

    img.src = imageUrl;
  });
}

/**
 * 초기 orientation 맵을 구성한다 (LQIP가 있는 아이템 처리)
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
    // LQIP가 있는 경우 즉시 orientation 계산
    if ('lqip' in item && item.lqip) {
      const orientation = getOrientationFromLQIP(item.lqip);
      newMap.set(item.id, orientation);
    } else {
      // LQIP가 없는 경우 나중에 로드할 목록에 추가
      itemsToLoad.push({ id: item.id, imageUrl: item.image });
    }
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
