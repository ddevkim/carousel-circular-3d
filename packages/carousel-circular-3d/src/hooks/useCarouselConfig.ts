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

  // 상호작용
  dragSensitivity: number;
  enableMomentum: boolean;
  momentumFriction: number;
  enableKeyboardNavigation: boolean;

  // 자동 회전
  autoRotate: boolean;
  autoRotateSpeed: number;
  autoRotateResumeDelay: number;

  // 시각 효과
  opacityRange: [number, number];
  scaleRange: [number, number];
  enableReflection: boolean;

  // 스타일
  className?: string;
  itemClassName?: string;
  containerHeight: number;

  // Lightbox
  enableLightboxWhenClick: boolean;
  lightboxOptions?: import('../types').LightboxOptions;

  // 콜백 및 접근성
  onItemClick?: (item: CarouselItem, index: number) => void;
  ariaLabel: string;
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

  // 아이템당 각도 간격 계산
  const anglePerItem = useMemo(() => {
    if (items.length === 0) return 0;
    return 360 / items.length;
  }, [items.length]);

  // Perspective 계산
  const perspective = useMemo(() => {
    const radius = props.geometry?.radius ?? DEFAULT_PROPS.RADIUS;
    const customPerspective = props.geometry?.perspective;
    return calculatePerspective(
      radius,
      customPerspective,
      PERSPECTIVE_MULTIPLIER,
      PERSPECTIVE_MIN_MULTIPLIER
    );
  }, [props.geometry?.radius, props.geometry?.perspective]);

  // config 객체 생성 - props에서 직접 참조하여 단순화
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Config 정규화는 본질적으로 많은 props를 처리해야 하므로 복잡도가 높음
  return useMemo(() => {
    const config: NormalizedCarouselConfig = {
      items,
      anglePerItem,
      radius: props.geometry?.radius ?? DEFAULT_PROPS.RADIUS,
      perspective,
      cameraAngle: props.geometry?.cameraAngle ?? DEFAULT_PROPS.CAMERA_ANGLE,
      depthIntensity: props.geometry?.depthIntensity ?? DEFAULT_PROPS.DEPTH_INTENSITY,
      dragSensitivity: props.interaction?.dragSensitivity ?? DEFAULT_PROPS.DRAG_SENSITIVITY,
      enableMomentum: props.interaction?.enableMomentum ?? DEFAULT_PROPS.ENABLE_MOMENTUM,
      momentumFriction: props.interaction?.momentumFriction ?? DEFAULT_PROPS.MOMENTUM_FRICTION,
      enableKeyboardNavigation:
        props.interaction?.enableKeyboardNavigation ?? DEFAULT_PROPS.ENABLE_KEYBOARD_NAVIGATION,
      autoRotate: props.autoRotateConfig?.enabled ?? DEFAULT_PROPS.AUTO_ROTATE,
      autoRotateSpeed: props.autoRotateConfig?.speed ?? DEFAULT_PROPS.AUTO_ROTATE_SPEED,
      autoRotateResumeDelay:
        props.autoRotateConfig?.resumeDelay ?? DEFAULT_PROPS.AUTO_ROTATE_RESUME_DELAY,
      opacityRange: props.visualEffect?.opacityRange ?? DEFAULT_PROPS.OPACITY_RANGE,
      scaleRange: props.visualEffect?.scaleRange ?? DEFAULT_PROPS.SCALE_RANGE,
      enableReflection: props.visualEffect?.enableReflection ?? false,
      className: props.style?.className,
      itemClassName: props.style?.itemClassName,
      containerHeight: props.containerHeight ?? DEFAULT_PROPS.CONTAINER_HEIGHT,
      enableLightboxWhenClick: props.enableLightboxWhenClick ?? false,
      lightboxOptions: props.lightboxOptions,
      onItemClick: props.onItemClick,
      ariaLabel: props.ariaLabel ?? DEFAULT_PROPS.ARIA_LABEL,
    };
    return config;
  }, [
    items,
    anglePerItem,
    perspective,
    props.geometry?.radius,
    props.geometry?.cameraAngle,
    props.geometry?.depthIntensity,
    props.interaction?.dragSensitivity,
    props.interaction?.enableMomentum,
    props.interaction?.momentumFriction,
    props.interaction?.enableKeyboardNavigation,
    props.autoRotateConfig?.enabled,
    props.autoRotateConfig?.speed,
    props.autoRotateConfig?.resumeDelay,
    props.visualEffect?.opacityRange,
    props.visualEffect?.scaleRange,
    props.visualEffect?.enableReflection,
    props.style?.className,
    props.style?.itemClassName,
    props.containerHeight,
    props.enableLightboxWhenClick,
    props.lightboxOptions,
    props.onItemClick,
    props.ariaLabel,
  ]);
}
