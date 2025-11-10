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
}

/**
 * LQIP를 사용한 Progressive Image 로딩 컴포넌트
 * LQIP가 제공되면 blur 처리된 placeholder를 먼저 표시하고,
 * 원본 이미지가 로드되면 부드럽게 fade-in 한다.
 *
 * 이미지 다운로드 최적화:
 * - LQIP가 있는 경우: 이 컴포넌트에서만 원본 이미지를 다운로드 (1번)
 * - LQIP가 없는 경우: useImageOrientations에서 먼저 다운로드하고,
 *   이 컴포넌트에서는 브라우저 캐시를 사용 (실제 다운로드 1번)
 */
export function ProgressiveImage({ src, lqip, alt = '', className }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(
    lqip ? `data:image/jpeg;base64,${lqip.base64}` : src
  );

  useEffect(() => {
    // LQIP가 없으면 원본 이미지만 사용 (브라우저가 자동으로 로드)
    if (!lqip) {
      return;
    }

    // LQIP가 있는 경우: 백그라운드에서 원본 이미지 로드
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      // 로드 실패 시 LQIP 유지
      console.warn(`Failed to load image: ${src}`);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lqip]);

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition:
      'filter 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    // LQIP 사용 중일 때만 blur 적용
    filter: lqip && !isLoaded ? 'blur(20px)' : 'none',
    // 부드러운 스케일 효과
    transform: lqip && !isLoaded ? 'scale(1.05)' : 'scale(1)',
  };

  return <img src={currentSrc} alt={alt} className={className} style={style} />;
}
