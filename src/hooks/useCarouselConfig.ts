import { useMemo, useRef } from 'react';
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
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Config 정규화 함수는 모든 props를 처리해야 하므로 복잡도가 높을 수밖에 없음
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

  // 상호작용 설정 (드래그, 관성, 키보드)
  const dragSensitivity = props.interaction?.dragSensitivity ?? DEFAULT_PROPS.DRAG_SENSITIVITY;
  const enableMomentum = props.interaction?.enableMomentum ?? DEFAULT_PROPS.ENABLE_MOMENTUM;
  const momentumFriction = props.interaction?.momentumFriction ?? DEFAULT_PROPS.MOMENTUM_FRICTION;
  const enableKeyboardNavigation =
    props.interaction?.enableKeyboardNavigation ?? DEFAULT_PROPS.ENABLE_KEYBOARD_NAVIGATION;

  // 자동 회전 설정
  const autoRotate = props.autoRotateConfig?.enabled ?? DEFAULT_PROPS.AUTO_ROTATE;
  const autoRotateSpeed = props.autoRotateConfig?.speed ?? DEFAULT_PROPS.AUTO_ROTATE_SPEED;
  const autoRotateResumeDelay =
    props.autoRotateConfig?.resumeDelay ?? DEFAULT_PROPS.AUTO_ROTATE_RESUME_DELAY;

  // 시각 효과 설정 (투명도, 스케일, 반사)
  const opacityRange = props.visualEffect?.opacityRange ?? DEFAULT_PROPS.OPACITY_RANGE;
  const scaleRange = props.visualEffect?.scaleRange ?? DEFAULT_PROPS.SCALE_RANGE;
  const enableReflection = props.visualEffect?.enableReflection ?? false;

  // 스타일 설정 (CSS 클래스명)
  const className = props.style?.className;
  const itemClassName = props.style?.itemClassName;
  const containerHeight = props.containerHeight ?? DEFAULT_PROPS.CONTAINER_HEIGHT;

  // Lightbox 설정
  const enableLightboxWhenClick = props.enableLightboxWhenClick ?? false;

  // lightboxOptions의 참조 안정화 (깊은 비교 최소화)
  const lightboxOptionsRef = useRef(props.lightboxOptions);
  const lightboxOptionsSignature = useMemo(() => {
    return props.lightboxOptions ? JSON.stringify(props.lightboxOptions) : '';
  }, [props.lightboxOptions]);

  // signature가 변경되었을 때만 ref 업데이트 (한 번만 비교)
  if (props.lightboxOptions && lightboxOptionsSignature !== JSON.stringify(lightboxOptionsRef.current)) {
    lightboxOptionsRef.current = props.lightboxOptions;
  }
  const lightboxOptions = lightboxOptionsRef.current;

  // 콜백 및 접근성
  // onItemClick은 함수이므로 참조 안정화 (사용자가 useCallback으로 감싸지 않았을 수 있음)
  // ref를 통해 최신 함수를 유지하면서도 의존성 배열에는 포함하지 않음
  const onItemClickRef = useRef(props.onItemClick);
  onItemClickRef.current = props.onItemClick;

  // 안정적인 래퍼 함수 생성 (존재 여부만 체크)
  const hasOnItemClick = Boolean(props.onItemClick);
  const onItemClick = useMemo(
    () =>
      hasOnItemClick
        ? (item: CarouselItem, index: number) => {
            onItemClickRef.current?.(item, index);
          }
        : undefined,
    [hasOnItemClick]
  );

  const ariaLabel = props.ariaLabel ?? DEFAULT_PROPS.ARIA_LABEL;

  // config 객체 메모이제이션하여 불필요한 리렌더링 방지
  return useMemo(
    () => ({
      items,
      anglePerItem,
      radius,
      perspective,
      cameraAngle,
      depthIntensity,
      dragSensitivity,
      enableMomentum,
      momentumFriction,
      enableKeyboardNavigation,
      autoRotate,
      autoRotateSpeed,
      autoRotateResumeDelay,
      opacityRange,
      scaleRange,
      enableReflection,
      className,
      itemClassName,
      containerHeight,
      enableLightboxWhenClick,
      lightboxOptions,
      onItemClick,
      ariaLabel,
    }),
    [
      items,
      anglePerItem,
      radius,
      perspective,
      cameraAngle,
      depthIntensity,
      dragSensitivity,
      enableMomentum,
      momentumFriction,
      enableKeyboardNavigation,
      autoRotate,
      autoRotateSpeed,
      autoRotateResumeDelay,
      opacityRange,
      scaleRange,
      enableReflection,
      className,
      itemClassName,
      containerHeight,
      enableLightboxWhenClick,
      lightboxOptions,
      onItemClick,
      ariaLabel,
    ]
  );
}
