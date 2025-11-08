import './button.css';

/**
 * NavigationButton 컴포넌트 Props
 */
interface NavigationButtonProps {
  /** 방향 (prev 또는 next) */
  direction: 'prev' | 'next';
  /** 클릭 핸들러 */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 애니메이션 지속 시간 (ms) */
  animationDuration?: number;
}

/**
 * Lightbox 좌우 네비게이션 버튼 컴포넌트
 * 투명도와 blur 효과가 적용된 원형 화살표 버튼
 * CSS :hover를 사용하여 브라우저 네이티브 최적화 활용
 * @param props - NavigationButton Props
 */
export function NavigationButton({
  direction,
  onClick,
  animationDuration = 500,
}: NavigationButtonProps) {
  const ariaLabel = direction === 'prev' ? 'Previous image' : 'Next image';
  const className = `carousel-circular-button carousel-circular-nav-button carousel-circular-nav-button--${direction}`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      style={
        {
          '--button-transition-duration': `${animationDuration * 0.4}ms`,
        } as React.CSSProperties
      }
    >
      {direction === 'prev' ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M 12 2 L 6 12 L 12 22" />
        </svg>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M 10 2 L 16 12 L 10 22" />
        </svg>
      )}
    </button>
  );
}

