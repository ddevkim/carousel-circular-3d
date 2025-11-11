import type {
  CarouselItem as CarouselItemType,
  ImageOrientation,
  ItemTransform,
} from '../../types';
import { getItemAriaLabel, renderItemContent } from '../../utils/itemContentRenderer';
import { calculateItemStyle } from '../../utils/itemStyleCalculator';

/**
 * CarouselItem 컴포넌트 Props
 */
export interface CarouselItemProps {
  /** 아이템 데이터 */
  item: CarouselItemType;
  /** 아이템 인덱스 */
  index: number;
  /** Transform 계산 결과 */
  transform: ItemTransform;
  /** 컨테이너 높이 (px) */
  containerHeight: number;
  /** 이미지 방향 */
  orientation: ImageOrientation;
  /** 크기 스케일 범위 [최소, 최대] */
  scaleRange: [number, number];
  /** Perspective 값 (px) */
  perspective: number;
  /** 원의 반지름 (px) */
  radius: number;
  /** CSS 클래스명 (기본 .carousel-item에 추가됨) */
  itemClassName?: string;
  /** 클릭 핸들러 */
  onItemClick?: (item: CarouselItemType, index: number) => void;
  /** 클릭 차단 여부 판단 함수 */
  shouldPreventClick?: () => boolean;
  /** Lightbox 열기 핸들러 (element와 index 전달) */
  onLightboxOpen?: (index: number, element: HTMLElement) => void;
  /** 하단 반사 효과 활성화 여부 */
  enableReflection?: boolean;
}

/**
 * 캐러셀 아이템 컴포넌트
 * 개별 아이템의 렌더링을 담당한다.
 */
export function CarouselItem({
  item,
  index,
  transform,
  containerHeight,
  orientation,
  scaleRange,
  perspective,
  radius,
  itemClassName,
  onItemClick,
  shouldPreventClick,
  onLightboxOpen,
  enableReflection = false,
}: CarouselItemProps) {
  const content = renderItemContent(item, index);
  const ariaLabel = getItemAriaLabel(item, index);
  const isClickable = Boolean(onItemClick) || Boolean(onLightboxOpen);
  const finalClassName = itemClassName ? `carousel-item ${itemClassName}` : 'carousel-item';

  const baseStyle: React.CSSProperties = {
    ...calculateItemStyle({
      containerHeight,
      orientation,
      transform,
      scaleRange,
      perspective,
      radius,
      isClickable,
    }),
    // reflection이 item 밖으로 나갈 수 있도록 명시적으로 overflow visible 설정
    overflow: 'visible',
  };

  /**
   * 클릭 핸들러
   * Lightbox가 활성화된 경우 우선 처리
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (shouldPreventClick?.()) {
      return;
    }

    // Lightbox 우선 처리 (이미지가 있는 경우만)
    if (onLightboxOpen && 'image' in item && item.image) {
      onLightboxOpen(index, e.currentTarget);
      return;
    }

    // 일반 클릭 핸들러
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const itemContent = enableReflection ? (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* 원본 이미지 컨텐츠 (border-radius 클리핑) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: '0.75rem',
        }}
      >
        {content}
      </div>

      {/* Reflection 효과 - 원본 이미지 아래에 뒤집혀서 배치 */}
      <div
        style={{
          position: 'absolute',
          top: '200%',
          left: 0,
          width: '100%',
          height: '100%',
          transformOrigin: 'top',
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: '0.75rem',
        }}
        aria-hidden="true"
      >
        {content}
      </div>
    </div>
  ) : (
    content
  );

  if (isClickable) {
    return (
      <button
        key={item.id}
        type="button"
        className={finalClassName}
        style={baseStyle}
        onClick={handleClick}
        aria-label={ariaLabel}
        data-carousel-index={index}
      >
        {itemContent}
      </button>
    );
  }

  return (
    <div
      key={item.id}
      className={finalClassName}
      style={baseStyle}
      title={ariaLabel}
      data-carousel-index={index}
    >
      {itemContent}
    </div>
  );
}
