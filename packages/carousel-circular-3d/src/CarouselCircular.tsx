import { useCallback, useMemo } from 'react';
import { CarouselContainer, CarouselItem } from './components/Carousel';
import { Lightbox } from './components/Lightbox';
import { useCarouselConfig } from './hooks/useCarouselConfig';
import { useCarouselRotation } from './hooks/useCarouselRotation';
import { useImageOrientations } from './hooks/useImageOrientations';
import { useKeyboard } from './hooks/useKeyboard';
import { useLightbox } from './hooks/useLightbox';
import type { CarouselCircularProps } from './types';
import { calculateItemsMetadata } from './utils/itemMetadataCalculator';
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

  // 이미지 방향 분석 (각 이미지의 orientation 결정)
  const { orientationMap, isLoaded } = useImageOrientations(config.items);

  // 아이템 메타데이터 계산 (orientation 기반 크기 및 각도)
  // containerHeight를 기준으로 아이템 크기 동적 계산
  // 로딩 완료 후에만 계산하여 일관된 각도 사용
  const itemsMetadata = useMemo(() => {
    if (!isLoaded) {
      return [];
    }
    return calculateItemsMetadata(config.items, orientationMap, config.containerHeight);
  }, [config.items, orientationMap, config.containerHeight, isLoaded]);

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
    itemsMetadata,
    isBrowser,
  });

  // Lightbox 상태 관리 Hook
  const lightbox = useLightbox({
    enabled: config.enableLightboxWhenClick && isBrowser,
    itemCount: config.items.length,
    onRotateCarousel: rotation.rotateByDelta,
    options: config.lightboxOptions,
  });

  // 키보드 네비게이션 Hook (Lightbox가 열려있지 않고 로딩 완료 시만 동작)
  useKeyboard({
    enabled: isBrowser && !lightbox.lightboxState.isOpen && isLoaded,
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
      // itemsMetadata가 있으면 동적 각도 사용, 없으면 고정 각도 사용
      const metadata = itemsMetadata[itemIndex];

      return calculateItemTransform({
        itemIndex,
        anglePerItem: metadata ? undefined : config.anglePerItem,
        cumulativeAngle: metadata?.cumulativeAngle,
        finalRotation: rotation.finalRotation,
        radius: config.radius,
        opacityRange: config.opacityRange,
        scaleRange: config.scaleRange,
        depthIntensity: config.depthIntensity,
      });
    },
    [
      itemsMetadata,
      config.anglePerItem,
      rotation.finalRotation,
      config.radius,
      config.opacityRange,
      config.scaleRange,
      config.depthIntensity,
    ]
  );

  /**
   * Lightbox 열기 핸들러
   * @param index - 아이템 인덱스
   * @param element - 클릭된 요소
   */
  const handleLightboxOpen = useCallback(
    (index: number, element: HTMLElement) => {
      if (config.enableLightboxWhenClick) {
        lightbox.openLightbox(index, element);
      }
    },
    [config.enableLightboxWhenClick, lightbox]
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
      const metadata = itemsMetadata[index];

      // metadata에서 orientation 추출 (없으면 기본값 square 사용)
      const orientation = metadata?.orientation ?? 'square';

      return (
        <CarouselItem
          key={item.id}
          item={item}
          index={index}
          transform={transform}
          containerHeight={config.containerHeight}
          orientation={orientation}
          scaleRange={config.scaleRange}
          perspective={config.perspective}
          radius={config.radius}
          itemClassName={config.itemClassName}
          onItemClick={(item, index) => {
            config.onItemClick?.(item, index);
            rotation.resetSignificantDrag();
          }}
          shouldPreventClick={shouldPreventItemClick}
          onLightboxOpen={config.enableLightboxWhenClick ? handleLightboxOpen : undefined}
          enableReflection={config.enableReflection}
        />
      );
    },
    [
      calculateTransform,
      itemsMetadata,
      config.containerHeight,
      config.scaleRange,
      config.perspective,
      config.radius,
      config.itemClassName,
      config.onItemClick,
      config.enableLightboxWhenClick,
      config.enableReflection,
      shouldPreventItemClick,
      handleLightboxOpen,
      rotation.resetSignificantDrag,
    ]
  );

  // 로딩 중일 때는 빈 컨테이너만 렌더링
  if (!isLoaded) {
    return (
      <CarouselContainer
        className={config.className}
        perspective={config.perspective}
        cameraAngle={config.cameraAngle}
        finalRotation={0}
        isBrowser={isBrowser}
        ariaLabel={config.ariaLabel}
        height={config.containerHeight}
      >
        {/* 로딩 중 표시 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '1rem',
          }}
        >
          Loading images...
        </div>
      </CarouselContainer>
    );
  }

  return (
    <>
      <CarouselContainer
        className={config.className}
        perspective={config.perspective}
        cameraAngle={config.cameraAngle}
        finalRotation={rotation.finalRotation}
        isBrowser={isBrowser}
        ariaLabel={config.ariaLabel}
        height={config.containerHeight}
        onMouseEnter={rotation.handleMouseEnter}
        onMouseLeave={rotation.handleMouseLeave}
        onMouseDown={rotation.handleMouseDown}
        onTouchStart={rotation.handleTouchStart}
      >
        {config.items.map((item, index) => renderItem(item, index))}
      </CarouselContainer>

      {/* Lightbox */}
      {config.enableLightboxWhenClick && (
        <Lightbox
          lightboxState={lightbox.lightboxState}
          items={config.items}
          onClose={lightbox.closeLightbox}
          onNavigate={lightbox.navigateLightbox}
          options={config.lightboxOptions}
        />
      )}
    </>
  );
}
