import { useMemo } from 'react';
import { DEFAULT_PROPS, PERSPECTIVE_MIN_MULTIPLIER, PERSPECTIVE_MULTIPLIER } from '../constants';
import type { CarouselCircularProps, CarouselItem } from '../types';
import { calculatePerspective } from '../utils/helpers';

/**
 * 정규화된 캐러셀 설정 객체
 */
export interface NormalizedCarouselConfig {
  // 필수
  items: CarouselItem[];
  /** 아이템당 각도 간격 (degree) */
  anglePerItem: number;

  // 3D 기하학
  radius: number;
  perspective: number;
  cameraAngle: number;
  depthIntensity: number;

  // 아이템 크기
  itemWidth: number;
  itemHeight: number;

  // 상호작용
  dragSensitivity: number;
  enableMomentum: boolean;
  momentumFriction: number;

  // 자동 회전
  autoRotate: boolean;
  autoRotateSpeed: number;
  autoRotateResumeDelay: number;

  // 시각 효과
  opacityRange: [number, number];
  scaleRange: [number, number];

  // 스타일
  className?: string;
  itemClassName?: string;

  // Lightbox
  enableLightboxWhenClick: boolean;
  lightboxOptions?: import('../types').LightboxOptions;

  // 콜백 및 접근성
  onItemClick?: (item: CarouselItem, index: number) => void;
  ariaLabel: string;
  keyboardRotationStep?: number;
}

/**
 * Props를 구조화하고 기본값을 적용하여 정규화된 설정 객체를 반환한다.
 * @param props - CarouselCircularProps
 * @returns 정규화된 설정 객체
 */
export function useCarouselConfig(props: CarouselCircularProps): NormalizedCarouselConfig {
  const { items: rawItems } = props;

  // 아이템 수 제한 (30개 초과 시 slice + warning)
  const items = useMemo(() => {
    if (rawItems.length > DEFAULT_PROPS.MAX_ITEMS) {
      console.warn(
        `CarouselCircular: ${rawItems.length} items provided, but maximum is ${DEFAULT_PROPS.MAX_ITEMS}. Slicing to ${DEFAULT_PROPS.MAX_ITEMS} items.`
      );
      return rawItems.slice(0, DEFAULT_PROPS.MAX_ITEMS);
    }
    return rawItems;
  }, [rawItems]);

  // 아이템당 각도 간격 (정적 계산)
  const anglePerItem = useMemo(() => {
    if (items.length === 0) return 0;
    return 360 / items.length;
  }, [items.length]);

  // 3D 기하학 설정
  const radius = props.geometry?.radius ?? DEFAULT_PROPS.RADIUS;
  const customPerspective = props.geometry?.perspective;
  const cameraAngle = props.geometry?.cameraAngle ?? DEFAULT_PROPS.CAMERA_ANGLE;
  const depthIntensity = props.geometry?.depthIntensity ?? DEFAULT_PROPS.DEPTH_INTENSITY;

  // Perspective 계산 (radius나 customPerspective 변경 시만 재계산)
  const perspective = useMemo(
    () =>
      calculatePerspective(
        radius,
        customPerspective,
        PERSPECTIVE_MULTIPLIER,
        PERSPECTIVE_MIN_MULTIPLIER
      ),
    [radius, customPerspective]
  );

  // 아이템 크기 설정
  const itemWidth = props.itemSize?.width ?? DEFAULT_PROPS.ITEM_WIDTH;
  const itemHeight = props.itemSize?.height ?? DEFAULT_PROPS.ITEM_HEIGHT;

  // 상호작용 설정 (드래그, 관성)
  const dragSensitivity = props.interaction?.dragSensitivity ?? DEFAULT_PROPS.DRAG_SENSITIVITY;
  const enableMomentum = props.interaction?.enableMomentum ?? DEFAULT_PROPS.ENABLE_MOMENTUM;
  const momentumFriction = props.interaction?.momentumFriction ?? DEFAULT_PROPS.MOMENTUM_FRICTION;

  // 자동 회전 설정
  const autoRotate = props.autoRotateConfig?.enabled ?? DEFAULT_PROPS.AUTO_ROTATE;
  const autoRotateSpeed = props.autoRotateConfig?.speed ?? DEFAULT_PROPS.AUTO_ROTATE_SPEED;
  const autoRotateResumeDelay =
    props.autoRotateConfig?.resumeDelay ?? DEFAULT_PROPS.AUTO_ROTATE_RESUME_DELAY;

  // 시각 효과 설정 (투명도, 스케일)
  const opacityRange = props.visualEffect?.opacityRange ?? DEFAULT_PROPS.OPACITY_RANGE;
  const scaleRange = props.visualEffect?.scaleRange ?? DEFAULT_PROPS.SCALE_RANGE;

  // 스타일 설정 (CSS 클래스명)
  const className = props.style?.className;
  const itemClassName = props.style?.itemClassName;

  // Lightbox 설정
  const enableLightboxWhenClick = props.enableLightboxWhenClick ?? false;
  const lightboxOptions = props.lightboxOptions;

  // 콜백 및 접근성
  const onItemClick = props.onItemClick;
  const ariaLabel = props.ariaLabel ?? DEFAULT_PROPS.ARIA_LABEL;
  const keyboardRotationStep = props.keyboardRotationStep;

  return {
    items,
    anglePerItem,
    radius,
    perspective,
    cameraAngle,
    depthIntensity,
    itemWidth,
    itemHeight,
    dragSensitivity,
    enableMomentum,
    momentumFriction,
    autoRotate,
    autoRotateSpeed,
    autoRotateResumeDelay,
    opacityRange,
    scaleRange,
    className,
    itemClassName,
    enableLightboxWhenClick,
    lightboxOptions,
    onItemClick,
    ariaLabel,
    keyboardRotationStep,
  };
}
