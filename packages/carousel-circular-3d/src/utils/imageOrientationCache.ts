import type { ImageOrientation } from '../types';
import { determineOrientation } from './orientationCalculator';

/**
 * 이미지 URL을 key로 하는 orientation 캐시
 * 앨범이 변경되어도 동일한 이미지는 재분석하지 않음
 */
const IMAGE_ORIENTATION_CACHE = new Map<string, ImageOrientation>();

/**
 * 캐시에서 orientation을 가져온다
 * @param imageUrl - 이미지 URL
 * @returns ImageOrientation 또는 undefined
 */
export function getCachedOrientation(imageUrl: string): ImageOrientation | undefined {
  return IMAGE_ORIENTATION_CACHE.get(imageUrl);
}

/**
 * orientation을 캐시에 저장한다
 * @param imageUrl - 이미지 URL
 * @param orientation - 이미지 방향
 */
export function setCachedOrientation(imageUrl: string, orientation: ImageOrientation): void {
  IMAGE_ORIENTATION_CACHE.set(imageUrl, orientation);
}

/**
 * 캐시에 특정 이미지가 존재하는지 확인한다
 * @param imageUrl - 이미지 URL
 * @returns 존재 여부
 */
export function hasCachedOrientation(imageUrl: string): boolean {
  return IMAGE_ORIENTATION_CACHE.has(imageUrl);
}

/**
 * 이미지 URL에서 이미지를 로드하여 aspect ratio를 분석하고 orientation을 결정한다.
 * 캐시를 먼저 확인하여 이미 분석된 이미지는 재분석하지 않는다.
 *
 * 주의: 브라우저의 이미지 캐싱 덕분에 이후 <img> 태그에서 같은 URL을 사용할 때
 * 네트워크 요청 없이 캐시에서 가져옵니다.
 *
 * @param imageUrl - 이미지 URL
 * @returns Promise<ImageOrientation>
 */
export function loadImageOrientation(imageUrl: string): Promise<ImageOrientation> {
  // 캐시 체크 - 이미 분석된 이미지는 즉시 반환
  const cached = getCachedOrientation(imageUrl);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  // 캐시에 없는 경우에만 이미지 로드 및 분석
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const orientation = determineOrientation(aspectRatio);

      // 캐시에 저장
      setCachedOrientation(imageUrl, orientation);

      resolve(orientation);
    };

    img.onerror = () => {
      // 에러 발생 시 기본값으로 square 반환 및 캐싱
      console.warn(`Failed to load image: ${imageUrl}. Defaulting to square orientation.`);
      const defaultOrientation = 'square';
      setCachedOrientation(imageUrl, defaultOrientation);
      resolve(defaultOrientation);
    };

    img.src = imageUrl;
  });
}

/**
 * 전체 캐시를 초기화한다 (테스트 또는 메모리 관리 용도)
 */
export function clearOrientationCache(): void {
  IMAGE_ORIENTATION_CACHE.clear();
}

/**
 * 캐시 크기를 반환한다 (디버깅 용도)
 * @returns 캐시된 이미지 수
 */
export function getOrientationCacheSize(): number {
  return IMAGE_ORIENTATION_CACHE.size;
}
