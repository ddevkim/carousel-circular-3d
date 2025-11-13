import { useEffect, useMemo, useState } from 'react';
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
 * Scheduler.yield() polyfill
 * 브라우저에 렌더링 기회를 제공하는 진정한 yield
 */
const yieldToMain = (): Promise<void> => {
  // Chrome 94+: Scheduler API 사용
  // biome-ignore lint/suspicious/noExplicitAny: Scheduler API는 아직 TypeScript 타입이 없음
  if ('scheduler' in window && 'yield' in (window.scheduler as any)) {
    // biome-ignore lint/suspicious/noExplicitAny: Scheduler API는 아직 TypeScript 타입이 없음
    return (window.scheduler as any).yield();
  }

  // 폴백: setTimeout(0)으로 매크로태스크 큐에 양보
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * 화면 중앙 아이템을 우선 처리하기 위한 순서를 생성한다.
 *
 * 우선순위:
 * 1. 중앙 아이템 (index 0)
 * 2. 주변 아이템 (index ±1, ±2)
 * 3. 나머지 아이템
 *
 * @param totalItems - 전체 아이템 수
 * @returns 처리 순서 인덱스 배열
 */
function createPriorityProcessingOrder(totalItems: number): number[] {
  const priorityOrder: number[] = [];

  // 중앙 아이템
  if (totalItems > 0) {
    priorityOrder.push(0);
  }

  // 주변 아이템 (좌우 2개씩, 총 4개)
  const surroundingRange = Math.min(2, Math.floor(totalItems / 2));
  for (let offset = 1; offset <= surroundingRange; offset++) {
    // 오른쪽 아이템
    if (offset < totalItems) {
      priorityOrder.push(offset);
    }
    // 왼쪽 아이템
    const leftIndex = totalItems - offset;
    if (leftIndex !== offset && leftIndex >= 0) {
      priorityOrder.push(leftIndex);
    }
  }

  // 나머지 아이템 (중앙 +/- 2 이후)
  for (let i = 3; i < totalItems - 2; i++) {
    priorityOrder.push(i);
  }

  return priorityOrder;
}

/**
 * 단일 아이템의 orientation을 처리한다.
 *
 * 처리 우선순위:
 * 1. 글로벌 캐시 확인
 * 2. LQIP로 즉시 계산
 * 3. 나중에 로드할 목록에 추가
 *
 * @param item - 이미지가 있는 캐러셀 아이템
 * @param orientationMap - orientation 맵
 * @param itemsToLoad - 로드할 아이템 목록
 */
function processItemOrientation(
  item: CarouselItem & { image: string },
  orientationMap: Map<string | number, ImageOrientation>,
  itemsToLoad: Array<{ id: string | number; imageUrl: string }>
): void {
  // 1순위: 글로벌 캐시 확인 (가장 빠름)
  const cachedOrientation = getCachedOrientation(item.image);
  if (cachedOrientation !== undefined) {
    orientationMap.set(item.id, cachedOrientation);
    return;
  }

  // 2순위: LQIP가 있는 경우 즉시 orientation 계산 후 캐시 저장
  if ('lqip' in item && item.lqip) {
    const orientation = getOrientationFromLQIP(item.lqip);
    orientationMap.set(item.id, orientation);
    setCachedOrientation(item.image, orientation);
    return;
  }

  // 3순위: LQIP도 캐시도 없는 경우 나중에 로드할 목록에 추가
  itemsToLoad.push({ id: item.id, imageUrl: item.image });
}

/**
 * 작업 시간을 체크하고 필요시 브라우저에 양보한다.
 * @param startTime - 작업 시작 시간
 * @param maxWorkTime - 최대 작업 시간 (ms)
 * @param currentIndex - 현재 인덱스 (첫 N개는 즉시 처리)
 * @param immediateProcessCount - 즉시 처리할 아이템 수
 * @returns 새로운 작업 시작 시간
 */
async function yieldIfNeeded(
  startTime: number,
  maxWorkTime: number,
  currentIndex: number,
  immediateProcessCount: number
): Promise<number> {
  const elapsed = performance.now() - startTime;

  // 첫 N개는 즉시 처리 (가시 영역)
  if (elapsed > maxWorkTime && currentIndex >= immediateProcessCount) {
    await yieldToMain();
    return performance.now(); // 새로운 시작 시간
  }

  return startTime; // 기존 시작 시간 유지
}

/**
 * 초기 orientation 맵을 구성한다 (LQIP 및 캐시 활용)
 * 배치 처리를 통해 메인 스레드 블로킹을 최소화
 *
 * 성능 최적화:
 * - Scheduler.yield()로 진정한 메인 스레드 양보
 * - 동적 배치 크기 조정 (작업 시간 기반)
 * - 총 작업 시간이 5ms 초과 시 yield
 *
 * @param items - CarouselItem 배열
 * @returns { newMap, itemsToLoad } - 초기 맵과 로드할 아이템 목록
 */
async function buildInitialOrientationMap(items: CarouselItem[]): Promise<{
  newMap: Map<string | number, ImageOrientation>;
  itemsToLoad: Array<{ id: string | number; imageUrl: string }>;
}> {
  const newMap = new Map<string | number, ImageOrientation>();
  const itemsToLoad: Array<{ id: string | number; imageUrl: string }> = [];

  // 이미지가 있는 아이템 처리
  const imageItems = items.filter(
    (item): item is CarouselItem & { image: string } => 'image' in item && Boolean(item.image)
  );

  // 우선순위 기반 처리 순서 생성
  const priorityOrder = createPriorityProcessingOrder(imageItems.length);

  // 상수: 성능 제어 파라미터
  const MAX_WORK_TIME_MS = 5; // 5ms마다 브라우저에 제어권 양보
  const IMMEDIATE_PROCESS_COUNT = 5; // 첫 5개는 즉시 처리 (가시 영역)

  let workStartTime = performance.now();

  // 우선순위 순서대로 아이템 처리
  for (let idx = 0; idx < priorityOrder.length; idx++) {
    const itemIndex = priorityOrder[idx];
    if (itemIndex === undefined) continue;

    // 브라우저에 양보 (필요시)
    workStartTime = await yieldIfNeeded(
      workStartTime,
      MAX_WORK_TIME_MS,
      idx,
      IMMEDIATE_PROCESS_COUNT
    );

    const item = imageItems[itemIndex];
    if (!item) continue;

    // 아이템의 orientation 처리
    processItemOrientation(item, newMap, itemsToLoad);
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

  // items 배열의 실제 내용이 변경되었을 때만 effect를 다시 실행하도록
  // ID와 이미지 URL 기반으로 안정적인 의존성 생성
  const itemsSignature = useMemo(() => {
    return items
      .map((item) => {
        const id = item.id;
        const image = 'image' in item ? item.image : '';
        const lqipKey =
          'lqip' in item &&
          item.lqip &&
          typeof item.lqip === 'object' &&
          'width' in item.lqip &&
          'height' in item.lqip
            ? `${item.lqip.width}x${item.lqip.height}`
            : '';
        return `${id}:${image}:${lqipKey}`;
      })
      .join('|');
  }, [items]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: items 대신 itemsSignature를 사용하여 불필요한 재실행 방지
  useEffect(() => {
    let isCancelled = false;

    const loadOrientations = async () => {
      // 배치 처리로 메인 스레드 블로킹 최소화
      const { newMap, itemsToLoad } = await buildInitialOrientationMap(items);

      // 컴포넌트가 언마운트되었으면 중단
      if (isCancelled) return;

      // 모든 아이템이 LQIP를 가지고 있거나 content인 경우
      if (itemsToLoad.length === 0) {
        // 메인 스레드 블로킹을 피하기 위해 마이크로태스크에서 처리
        queueMicrotask(() => {
          if (!isCancelled) {
            setOrientationMap(newMap);
            setIsLoaded(true);
          }
        });
        return;
      }

      // LQIP가 없는 아이템들만 이미지를 로드해야 함
      // 로딩 전에 초기 맵 설정 (LQIP가 있는 아이템은 이미 orientation 계산됨)
      queueMicrotask(() => {
        if (!isCancelled) {
          setOrientationMap(new Map(newMap));
        }
      });

      // LQIP가 없는 아이템들을 병렬로 로드하여 orientation 결정
      await Promise.all(
        itemsToLoad.map(async ({ id, imageUrl }) => {
          const orientation = await loadImageOrientation(imageUrl);
          if (!isCancelled) {
            newMap.set(id, orientation);
          }
        })
      );

      // 컴포넌트가 언마운트되었으면 중단
      if (isCancelled) return;

      // 모든 로딩 완료 후 최종 맵 설정 (마이크로태스크에서 처리)
      queueMicrotask(() => {
        if (!isCancelled) {
          setOrientationMap(new Map(newMap));
          setIsLoaded(true);
        }
      });
    };

    // 로딩 시작 - setState 호출 전에 isCancelled 체크
    // requestIdleCallback으로 메인 스레드 여유 시간에 처리
    if (!isCancelled) {
      setIsLoaded(false);

      if ('requestIdleCallback' in window) {
        const idleCallbackId = requestIdleCallback(() => {
          if (!isCancelled) {
            loadOrientations();
          }
        });

        return () => {
          isCancelled = true;
          cancelIdleCallback(idleCallbackId);
        };
      } else {
        // requestIdleCallback 미지원 브라우저 폴백
        const timeoutId = setTimeout(() => {
          if (!isCancelled) {
            loadOrientations();
          }
        }, 0);

        return () => {
          isCancelled = true;
          clearTimeout(timeoutId);
        };
      }
    }

    // cleanup 함수로 진행 중인 작업 취소
    return () => {
      isCancelled = true;
    };
  }, [itemsSignature]); // items 대신 itemsSignature 사용하여 무한 루프 방지

  return { orientationMap, isLoaded };
}
