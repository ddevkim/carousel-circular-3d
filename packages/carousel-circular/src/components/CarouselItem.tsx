import type { CarouselItem as CarouselItemType, ItemTransform } from '../types';
import { getItemAriaLabel, renderItemContent } from '../utils/itemContentRenderer';
import { calculateItemStyle } from '../utils/itemStyleCalculator';

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
}: CarouselItemProps) {
  const content = renderItemContent(item, index);
  const ariaLabel = getItemAriaLabel(item, index);
  const isClickable = Boolean(onItemClick);

  const baseStyle = calculateItemStyle({
    itemWidth,
    itemHeight,
    transform,
    isClickable,
  });

  if (onItemClick) {
    return (
      <button
        key={item.id}
        type="button"
        className={itemClassName}
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (shouldPreventClick?.()) {
            return;
          }

          onItemClick(item, index);
        }}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div key={item.id} className={itemClassName} style={baseStyle} title={ariaLabel}>
      {content}
    </div>
  );
}
