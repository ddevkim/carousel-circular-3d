import type { ItemWithOrientation } from '../types';

/**
 * itemsMetadata 계산 결과를 캐싱하는 맵
 * key: "id1,id2,id3-containerHeight" 형식
 * value: ItemWithOrientation[]
 */
const ITEMS_METADATA_CACHE = new Map<string, ItemWithOrientation[]>();

/**
 * 아이템 ID 배열과 containerHeight로부터 캐시 키를 생성한다
 * @param itemIds - 아이템 ID 배열
 * @param containerHeight - 컨테이너 높이
 * @returns 캐시 키 문자열
 */
export function generateMetadataCacheKey(
  itemIds: Array<string | number>,
  containerHeight: number
): string {
  return `${itemIds.join(',')}-${containerHeight}`;
}

/**
 * 캐시에서 itemsMetadata를 가져온다
 * @param cacheKey - 캐시 키
 * @returns ItemWithOrientation[] 또는 undefined
 */
export function getCachedMetadata(cacheKey: string): ItemWithOrientation[] | undefined {
  return ITEMS_METADATA_CACHE.get(cacheKey);
}

/**
 * itemsMetadata를 캐시에 저장한다
 * @param cacheKey - 캐시 키
 * @param metadata - ItemWithOrientation 배열
 */
export function setCachedMetadata(cacheKey: string, metadata: ItemWithOrientation[]): void {
  // LRU 방식으로 캐시 크기 제한 (최대 50개)
  if (ITEMS_METADATA_CACHE.size >= 50) {
    // 가장 오래된 항목 삭제
    const firstKey = ITEMS_METADATA_CACHE.keys().next().value;
    if (firstKey !== undefined) {
      ITEMS_METADATA_CACHE.delete(firstKey);
    }
  }

  ITEMS_METADATA_CACHE.set(cacheKey, metadata);
}

/**
 * 전체 메타데이터 캐시를 초기화한다 (테스트 또는 메모리 관리 용도)
 */
export function clearMetadataCache(): void {
  ITEMS_METADATA_CACHE.clear();
}

/**
 * 캐시 크기를 반환한다 (디버깅 용도)
 * @returns 캐시된 메타데이터 수
 */
export function getMetadataCacheSize(): number {
  return ITEMS_METADATA_CACHE.size;
}
