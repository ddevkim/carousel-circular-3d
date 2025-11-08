import type { ReactNode } from 'react';
import { pxToRem } from '../utils/helpers';

/**
 * CarouselContainer 컴포넌트 Props
 */
export interface CarouselContainerProps {
  /** 컨테이너 CSS 클래스명 */
  className?: string;
  /** Perspective 값 (px) */
  perspective: number;
  /** 카메라 각도 (degree) */
  cameraAngle: number;
  /** 최종 회전 각도 (degree) */
  finalRotation: number;
  /** 드래그 중 여부 */
  isDragging: boolean;
  /** 브라우저 환경 여부 */
  isBrowser: boolean;
  /** 접근성 레이블 */
  ariaLabel: string;
  /** 마우스 enter 핸들러 */
  onMouseEnter?: () => void;
  /** 마우스 leave 핸들러 */
  onMouseLeave?: () => void;
  /** 마우스 다운 핸들러 */
  onMouseDown?: (e: React.MouseEvent) => void;
  /** 터치 시작 핸들러 */
  onTouchStart?: (e: React.TouchEvent) => void;
  /** 자식 요소 */
  children: ReactNode;
}

/**
 * 캐러셀 컨테이너 컴포넌트
 * SSR과 브라우저 렌더링을 통합하여 중복을 제거한다.
 */
export function CarouselContainer({
  className,
  perspective,
  cameraAngle,
  finalRotation,
  isDragging,
  isBrowser,
  ariaLabel,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onTouchStart,
  children,
}: CarouselContainerProps) {
  const containerStyle: React.CSSProperties = {
    perspective: `${pxToRem(perspective)}rem`,
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const rotationContainerStyle: React.CSSProperties = {
    transformStyle: 'preserve-3d',
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  // 브라우저 환경에서는 상호작용 활성화
  if (isBrowser) {
    containerStyle.cursor = isDragging ? 'grabbing' : 'grab';
    containerStyle.isolation = 'isolate';
    rotationContainerStyle.transform = `rotateX(-${cameraAngle}deg) rotateY(${finalRotation}deg)`;
    rotationContainerStyle.transition = 'transform 0s';
    rotationContainerStyle.willChange = 'transform';
  } else {
    // SSR 환경에서는 기본 상태
    rotationContainerStyle.transform = 'rotateY(0deg)';
    rotationContainerStyle.pointerEvents = 'none';
  }

  return (
    <section
      className={className}
      style={containerStyle}
      onMouseEnter={isBrowser ? onMouseEnter : undefined}
      onMouseLeave={isBrowser ? onMouseLeave : undefined}
      onMouseDown={isBrowser ? onMouseDown : undefined}
      onTouchStart={isBrowser ? onTouchStart : undefined}
      aria-label={ariaLabel}
      aria-live={isBrowser ? 'polite' : undefined}
    >
      <div style={rotationContainerStyle}>{children}</div>
    </section>
  );
}
