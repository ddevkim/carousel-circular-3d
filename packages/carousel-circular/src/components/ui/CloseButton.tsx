import './button.css';

/**
 * CloseButton 컴포넌트 Props
 */
interface CloseButtonProps {
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 애니메이션 지속 시간 (ms) */
  animationDuration?: number;
}

/**
 * Lightbox 우측 상단 닫기 버튼 컴포넌트
 * 투명도와 blur 효과가 적용된 원형 X 버튼
 * CSS :hover를 사용하여 브라우저 네이티브 최적화 활용
 * @param props - CloseButton Props
 */
export function CloseButton({ onClick, animationDuration = 500 }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close lightbox"
      className="carousel-circular-button carousel-circular-close-button"
      style={
        {
          '--button-transition-duration': `${animationDuration * 0.4}ms`,
        } as React.CSSProperties
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M 2 18 L 18 2" />
        <path d="M 18 18 L 2 2" />
      </svg>
    </button>
  );
}
