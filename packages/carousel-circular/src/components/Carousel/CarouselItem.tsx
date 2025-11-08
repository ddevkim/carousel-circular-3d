import type { CarouselItem as CarouselItemType, ItemTransform } from '../../types';
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
  /** 아이템 너비 (px) */
  itemWidth: number;
  /** 아이템 높이 (px) */
  itemHeight: number;
  /** CSS 클래스명 */
  itemClassName?: string;
  /** 클릭 핸들러 */
  onItemClick?: (item: CarouselItemType, index: number) => void;
  /** 클릭 차단 여부 판단 함수 */
  shouldPreventClick?: () => boolean;
  /** Lightbox 열기 핸들러 (element와 index 전달) */
  onLightboxOpen?: (index: number, element: HTMLElement) => void;
}

/**
 * 캐러셀 아이템 컴포넌트
 * 개별 아이템의 렌더링을 담당한다.
 */
export function CarouselItem({
  item,
  index,
  transform,
  itemWidth,
  itemHeight,
  itemClassName,
  onItemClick,
  shouldPreventClick,
  onLightboxOpen,
}: CarouselItemProps) {
  const content = renderItemContent(item, index);
  const ariaLabel = getItemAriaLabel(item, index);
  const isClickable = Boolean(onItemClick) || Boolean(onLightboxOpen);

  const baseStyle = calculateItemStyle({
    itemWidth,
    itemHeight,
    transform,
    isClickable,
  });

  console.log(itemWidth, itemHeight);

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

  if (isClickable) {
    return (
      <button
        key={item.id}
        type="button"
        className={itemClassName}
        style={baseStyle}
        onClick={handleClick}
        aria-label={ariaLabel}
        data-carousel-index={index}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      key={item.id}
      className={itemClassName}
      style={baseStyle}
      title={ariaLabel}
      data-carousel-index={index}
    >
      {content}
    </div>
  );
}
