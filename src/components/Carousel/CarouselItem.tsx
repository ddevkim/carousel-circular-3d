import { memo, useMemo } from 'react';
import type {
  CarouselItem as CarouselItemType,
  ImageOrientation,
  ItemTransform,
} from '../../types';
import { getItemAriaLabel, renderItemContent } from '../../utils/itemContentRenderer';
import { calculateItemStyle } from '../../utils/itemStyleCalculator';

/**
 * Reflection 컴포넌트 Props
 */
interface ReflectionProps {
  /** 아이템 데이터 */
  item: CarouselItemType;
  /** 아이템 인덱스 */
  index: number;
}

/**
 * Reflection 효과만 담당하는 컴포넌트
 * enableReflection 변경 시 이 컴포넌트만 마운트/언마운트됨
 * 이미지가 이미 로드되어 있으면 LQIP를 건너뛰고 바로 원본 이미지 표시
 */
const Reflection = memo(function Reflection({ item, index }: ReflectionProps) {
  // 스마트 로딩: 이미 캐시된 이미지는 LQIP 건너뛰기
  const reflectionContent = renderItemContent(item, index, true);

  return (
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
      {reflectionContent}
    </div>
  );
});

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
 *
 * 성능 최적화:
 * - React.memo로 불필요한 리렌더 방지
 * - 함수 props는 부모에서 ref로 안정화되어 있음
 * - transform 객체는 항상 새로 생성되지만, 내용이 같으면 리렌더 스킵
 */
function CarouselItemComponent({
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
  // 원본 이미지 컨텐츠: 캐시된 이미지는 LQIP 건너뛰기 (skipLQIPIfCached = true)
  // useMemo로 메모이제이션하여 불필요한 재계산 방지
  const content = useMemo(() => renderItemContent(item, index, true), [item, index]);

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

  // 원본 이미지 컨텐츠 (항상 LQIP 경유 - 부드러운 전환)
  const imageContent = (
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
  );

  // Wrapper: reflection 여부와 관계없이 동일한 구조
  const itemContent = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* 원본 이미지 컨텐츠 */}
      {imageContent}

      {/* Reflection: enableReflection이 true일 때만 렌더링 */}
      {/* 스마트 로딩: 이미 로드된 이미지는 LQIP 건너뛰기 */}
      {enableReflection && <Reflection item={item} index={index} />}
    </div>
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

/**
 * Transform 객체 비교 함수
 * transform의 실제 값들을 비교하여 불필요한 리렌더 방지
 */
function areTransformsEqual(prevTransform: ItemTransform, nextTransform: ItemTransform): boolean {
  return (
    prevTransform.transform === nextTransform.transform &&
    prevTransform.opacity === nextTransform.opacity &&
    prevTransform.zIndex === nextTransform.zIndex
  );
}

/**
 * Props 비교 함수
 * 함수 참조는 이미 안정화되어 있으므로 얕은 비교만 수행
 * transform은 깊은 비교 수행
 */
function arePropsEqual(prev: CarouselItemProps, next: CarouselItemProps): boolean {
  // item.id가 다르면 완전히 다른 아이템
  if (prev.item.id !== next.item.id) return false;

  // transform 깊은 비교
  if (!areTransformsEqual(prev.transform, next.transform)) return false;

  // 나머지 props 얕은 비교
  return (
    prev.index === next.index &&
    prev.containerHeight === next.containerHeight &&
    prev.orientation === next.orientation &&
    prev.scaleRange === next.scaleRange &&
    prev.perspective === next.perspective &&
    prev.radius === next.radius &&
    prev.itemClassName === next.itemClassName &&
    prev.enableReflection === next.enableReflection &&
    // 함수 props는 ref로 안정화되어 있으므로 참조 비교로 충분
    prev.onItemClick === next.onItemClick &&
    prev.shouldPreventClick === next.shouldPreventClick &&
    prev.onLightboxOpen === next.onLightboxOpen
  );
}

/**
 * 메모이제이션된 CarouselItem 컴포넌트
 * 앨범 변경 시 불필요한 리렌더 방지
 */
export const CarouselItem = memo(CarouselItemComponent, arePropsEqual);
