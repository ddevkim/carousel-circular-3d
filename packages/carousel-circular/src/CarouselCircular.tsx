import { useCallback } from 'react';
import { CarouselContainer } from './components/CarouselContainer';
import { CarouselItem } from './components/CarouselItem';
import { useCarouselConfig } from './hooks/useCarouselConfig';
import { useCarouselRotation } from './hooks/useCarouselRotation';
import { useKeyboard } from './hooks/useKeyboard';
import type { CarouselCircularProps } from './types';
import { calculateItemTransform } from './utils/transformCalculator';

/**
 * CarouselCircular 컴포넌트
 * 3D 원형 캐러셀 컴포넌트
 * @param props - CarouselCircularProps
 */
export function CarouselCircular(props: CarouselCircularProps) {
  // SSR-safe 체크
  const isBrowser = typeof window !== 'undefined';

  // Props 구조화 및 기본값 적용
  const config = useCarouselConfig(props);

  // 회전 상태 통합 관리
  const rotation = useCarouselRotation({
    radius: config.radius,
    dragSensitivity: config.dragSensitivity,
    enableMomentum: config.enableMomentum,
    momentumFriction: config.momentumFriction,
    autoRotate: config.autoRotate,
    autoRotateSpeed: config.autoRotateSpeed,
    autoRotateResumeDelay: config.autoRotateResumeDelay,
    itemCount: config.items.length,
    isBrowser,
  });

  // 키보드 네비게이션 Hook
  useKeyboard({
    enabled: isBrowser,
    onRotateByDelta: rotation.rotateByDelta,
    onKeyboardInput: rotation.handleKeyboardInput,
  });

  /**
   * 드래그가 수행된 경우 클릭 핸들러를 차단한다.
   * checkSignificantDragNow()를 사용하여 현재 시점의 상태를 동기적으로 판단
   * @returns 클릭을 취소해야 하면 true, 아니면 false
   */
  const shouldPreventItemClick = useCallback((): boolean => {
    return rotation.checkSignificantDragNow();
  }, [rotation.checkSignificantDragNow, rotation]);

  /**
   * 아이템별 transform 계산
   * @param itemIndex - 아이템 인덱스
   * @returns ItemTransform 객체
   */
  const calculateTransform = useCallback(
    (itemIndex: number) => {
      return calculateItemTransform({
        itemIndex,
        anglePerItem: config.anglePerItem,
        finalRotation: rotation.finalRotation,
        radius: config.radius,
        opacityRange: config.opacityRange,
        scaleRange: config.scaleRange,
        depthIntensity: config.depthIntensity,
      });
    },
    [
      config.anglePerItem,
      rotation.finalRotation,
      config.radius,
      config.opacityRange,
      config.scaleRange,
      config.depthIntensity,
    ]
  );

  /**
   * 아이템 렌더링
   * @param item - CarouselItem
   * @param index - 아이템 인덱스
   * @returns 렌더링된 아이템 컴포넌트
   */
  const renderItem = useCallback(
    (item: (typeof config.items)[0], index: number) => {
      const transform = calculateTransform(index);

      return (
        <CarouselItem
          key={item.id}
          item={item}
          index={index}
          transform={transform}
          itemWidth={config.itemWidth}
          itemHeight={config.itemHeight}
          itemClassName={config.itemClassName}
          onItemClick={(item, index) => {
            config.onItemClick?.(item, index);
            rotation.resetSignificantDrag();
          }}
          shouldPreventClick={shouldPreventItemClick}
        />
      );
    },
    [
      calculateTransform,
      config.itemWidth,
      config.itemHeight,
      config.itemClassName,
      config.onItemClick,
      shouldPreventItemClick,
      rotation.resetSignificantDrag,
      rotation,
      config,
    ]
  );

  return (
    <CarouselContainer
      className={config.className}
      perspective={config.perspective}
      cameraAngle={config.cameraAngle}
      finalRotation={rotation.finalRotation}
      isDragging={rotation.isDragging}
      isBrowser={isBrowser}
      ariaLabel={config.ariaLabel}
      onMouseEnter={rotation.handleMouseEnter}
      onMouseLeave={rotation.handleMouseLeave}
      onMouseDown={rotation.handleMouseDown}
      onTouchStart={rotation.handleTouchStart}
    >
      {config.items.map((item, index) => renderItem(item, index))}
    </CarouselContainer>
  );
}
