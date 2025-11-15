import { useCallback, useMemo, useRef } from 'react';
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
  // useMemo로 메모이제이션하여 불필요한 재계산 방지
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

  // 키보드 네비게이션 Hook (설정에서 활성화되고, Lightbox가 열려있지 않고 로딩 완료 시만 동작)
  useKeyboard({
    enabled:
      isBrowser && config.enableKeyboardNavigation && !lightbox.lightboxState.isOpen && isLoaded,
    onRotateByDelta: rotation.rotateByDelta,
    onKeyboardInput: rotation.handleKeyboardInput,
  });

  // 함수 props 참조 안정화 (CarouselItem memo 최적화를 위해)
  // onItemClick과 rotation.resetSignificantDrag를 ref로 관리
  const onItemClickRef = useRef(config.onItemClick);
  onItemClickRef.current = config.onItemClick;

  const resetSignificantDragRef = useRef(rotation.resetSignificantDrag);
  resetSignificantDragRef.current = rotation.resetSignificantDrag;

  // 안정화된 핸들러 생성
  const handleItemClick = useCallback(
    (item: (typeof config.items)[0], index: number) => {
      onItemClickRef.current?.(item, index);
      resetSignificantDragRef.current();
    },
    [] // 빈 deps - ref를 통해 최신 값 참조
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
        {config.items.map((item, index) => {
          const metadata = itemsMetadata[index];
          const orientation = metadata?.orientation ?? 'square';

          const transform = calculateItemTransform({
            itemIndex: index,
            anglePerItem: metadata ? undefined : config.anglePerItem,
            cumulativeAngle: metadata?.cumulativeAngle,
            finalRotation: rotation.finalRotation,
            radius: config.radius,
            opacityRange: config.opacityRange,
            minScale: config.minScale,
            depthIntensity: config.depthIntensity,
          });

          return (
            <CarouselItem
              key={item.id}
              item={item}
              index={index}
              transform={transform}
              containerHeight={config.containerHeight}
              orientation={orientation}
              minScale={config.minScale}
              perspective={config.perspective}
              radius={config.radius}
              itemClassName={config.itemClassName}
              onItemClick={config.onItemClick ? handleItemClick : undefined}
              shouldPreventClick={rotation.checkSignificantDragNow}
              onLightboxOpen={config.enableLightboxWhenClick ? lightbox.openLightbox : undefined}
              enableReflection={config.enableReflection}
            />
          );
        })}
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
