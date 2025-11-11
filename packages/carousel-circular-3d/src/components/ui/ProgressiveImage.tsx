import { useEffect, useState } from 'react';
import type { LQIPInfo } from '../../types';

/**
 * ProgressiveImage 컴포넌트 Props
 */
export interface ProgressiveImageProps {
  /** 원본 이미지 URL */
  src: string;
  /** LQIP 정보 (선택적) */
  lqip?: LQIPInfo;
  /** 이미지 alt text */
  alt?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 스마트 로딩: 이미지가 이미 캐시되어 있으면 LQIP를 건너뛰고 바로 원본 표시 (기본: false) */
  skipLQIPIfCached?: boolean;
}

/**
 * LQIP를 사용한 Progressive Image 로딩 컴포넌트
 * LQIP가 제공되면 blur 처리된 placeholder를 먼저 표시하고,
 * 원본 이미지가 로드되면 부드럽게 fade-in 한다.
 *
 * Luxury UX:
 * - LQIP는 최소 300ms 동안 표시되어 부드러운 전환 경험 제공
 * - skipLQIPIfCached=false: 이미지가 캐시되어 즉시 로드되어도 LQIP 단계를 거침
 * - skipLQIPIfCached=true: 캐시된 이미지는 바로 표시 (reflection 등에 유용)
 * - 갑작스러운 변화가 아닌 점진적 품질 향상 경험
 *
 * 이미지 다운로드 최적화:
 * - LQIP가 있는 경우: 이 컴포넌트에서만 원본 이미지를 다운로드 (1번)
 * - LQIP가 없는 경우: useImageOrientations에서 먼저 다운로드하고,
 *   이 컴포넌트에서는 브라우저 캐시를 사용 (실제 다운로드 1번)
 */
/**
 * 초기 이미지 상태 결정 함수
 * 캐시된 이미지를 미리 감지하여 올바른 초기 상태를 반환
 */
const getInitialImageState = (
  imageSrc: string,
  lqipData?: LQIPInfo,
  skipLQIPIfCachedFlag = false
): { src: string; isLoaded: boolean } => {
  // LQIP가 없으면 원본 이미지만 사용
  if (!lqipData) {
    return { src: imageSrc, isLoaded: false };
  }

  // 스마트 로딩: 이미지가 이미 캐시되어 있으면 LQIP를 건너뛰고 원본으로 시작
  if (skipLQIPIfCachedFlag) {
    const img = new Image();
    img.src = imageSrc;

    if (img.complete && img.naturalWidth > 0) {
      // 캐시된 이미지: 원본으로 바로 시작하고 로드 완료 표시
      return { src: imageSrc, isLoaded: true };
    }
  }

  // 캐시되지 않은 이미지: LQIP부터 시작
  return {
    src: `data:image/jpeg;base64,${lqipData.base64}`,
    isLoaded: false,
  };
};

export function ProgressiveImage({
  src,
  lqip,
  alt = '',
  className,
  skipLQIPIfCached = false,
}: ProgressiveImageProps) {
  const initial = getInitialImageState(src, lqip, skipLQIPIfCached);
  const [isLoaded, setIsLoaded] = useState(initial.isLoaded);
  const [currentSrc, setCurrentSrc] = useState<string>(initial.src);

  useEffect(() => {
    // LQIP가 없으면 원본 이미지만 사용 (브라우저가 자동으로 로드)
    if (!lqip) {
      return;
    }

    // 스마트 로딩: 이미지가 이미 캐시되어 있는지 확인
    if (skipLQIPIfCached) {
      const img = new Image();
      img.src = src;

      // 이미지가 이미 로드되어 있으면 (complete && naturalWidth > 0)
      if (img.complete && img.naturalWidth > 0) {
        // LQIP를 건너뛰고 바로 원본 이미지 표시
        setCurrentSrc(src);
        setIsLoaded(true);
        return;
      }
    }

    // 상태 초기화 (앨범 전환 시 또는 캐시되지 않은 경우)
    setIsLoaded(false);
    setCurrentSrc(`data:image/jpeg;base64,${lqip.base64}`);

    // LQIP가 있는 경우: 백그라운드에서 원본 이미지 로드
    const img = new Image();
    img.src = src;

    // 최소 LQIP 표시 시간 (300ms) - luxury한 전환을 위해
    // skipLQIPIfCached인 경우 최소 시간 적용 안 함
    const minDisplayTime = skipLQIPIfCached ? 0 : 300;
    const startTime = Date.now();

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    /**
     * 이미지 로드 완료 핸들러
     * 캐시된 이미지와 비캐시 이미지 모두 처리
     */
    const handleImageLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      // 최소 시간이 지나지 않았으면 대기 후 전환
      timeoutId = setTimeout(() => {
        setCurrentSrc(src);
        setIsLoaded(true);
      }, remainingTime);
    };

    img.onload = handleImageLoad;
    img.onerror = () => {
      // 로드 실패 시 LQIP 유지 (조용히 실패)
    };

    // 동기적으로 캐시 상태 확인
    // onload 핸들러가 등록되기 전에 이미지가 완료된 경우를 처리
    if (img.complete && img.naturalWidth > 0) {
      handleImageLoad();
    }

    return () => {
      // Cleanup: 이미지 로더와 타이머 정리
      img.onload = null;
      img.onerror = null;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [src, lqip, skipLQIPIfCached]);

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    // 더 부드럽고 luxury한 전환 (600ms)
    transition:
      'filter 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    // LQIP 사용 중일 때만 blur 적용
    filter: lqip && !isLoaded ? 'blur(20px)' : 'none',
    // 부드러운 스케일 효과
    transform: lqip && !isLoaded ? 'scale(1.05)' : 'scale(1)',
    // 약간의 투명도 변화로 더 부드러운 전환
    opacity: lqip && !isLoaded ? 0.95 : 1,
  };

  return <img src={currentSrc} alt={alt} className={className} style={style} />;
}
