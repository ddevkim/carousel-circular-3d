import { NavigationButton } from '../ui/NavigationButton';

interface LightboxNavigationProps {
  onNavigate: (direction: 'prev' | 'next') => void;
  animationDuration: number;
}

/**
 * Lightbox 네비게이션 컴포넌트
 * 이전/다음 이미지로 이동하는 버튼 제공
 * @param props - LightboxNavigation Props
 */
export function LightboxNavigation({ onNavigate, animationDuration }: LightboxNavigationProps) {
  return (
    <>
      <NavigationButton
        direction="prev"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('prev');
        }}
        animationDuration={animationDuration}
      />
      <NavigationButton
        direction="next"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('next');
        }}
        animationDuration={animationDuration}
      />
    </>
  );
}
