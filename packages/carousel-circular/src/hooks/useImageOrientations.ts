import { useEffect, useState } from 'react';
import type { CarouselItem, ImageOrientation } from '../types';
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
 * 이미지 URL에서 이미지를 로드하여 aspect ratio를 분석하고 orientation을 결정한다.
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
 * 모든 아이템의 이미지 방향을 분석하는 Hook
 * @param items - CarouselItem 배열
 * @returns { orientationMap, isLoaded } - 방향 맵과 로딩 완료 여부
 */
export function useImageOrientations(items: CarouselItem[]): UseImageOrientationsReturn {
  const [orientationMap, setOrientationMap] = useState<OrientationMap>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 로딩 시작 시 상태 초기화
    setIsLoaded(false);

    const loadOrientations = async () => {
      const newMap = new Map<string | number, ImageOrientation>();

      // 이미지가 있는 아이템만 필터링
      const imageItems = items.filter(
        (item): item is CarouselItem & { image: string } => 'image' in item && Boolean(item.image)
      );

      // 모든 이미지를 병렬로 로드
      await Promise.all(
        imageItems.map(async (item) => {
          const orientation = await loadImageOrientation(item.image);
          newMap.set(item.id, orientation);
        })
      );

      // content만 있는 아이템은 기본값으로 square 설정
      for (const item of items) {
        if (!newMap.has(item.id)) {
          newMap.set(item.id, 'square');
        }
      }

      setOrientationMap(newMap);
      setIsLoaded(true);
    };

    loadOrientations();
  }, [items]);

  return { orientationMap, isLoaded };
}
