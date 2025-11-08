import type { ReactNode } from 'react';

/**
 * 3D 기하학적 구조 설정
 */
export interface GeometryConfig {
  /** 원형 배치의 반지름 (px, 기본: 600) */
  radius?: number;
  /** 3D 원근 효과 깊이 (px, 기본: radius * 3.33, 최소: radius * 2) */
  perspective?: number;
  /** 카메라 위아래 각도 (degree, 기본: 0, 범위: 0-30, 추천: 8-15) */
  cameraAngle?: number;
  /** 개별 아이템 Z축 깊이 변동 강도 (기본: 0, 범위: 0-3, 추천: 1.0-2.0) */
  depthIntensity?: number;
}

/**
 * 아이템 크기 설정
 */
export interface ItemSizeConfig {
  /** 각 아이템의 너비 (px, 기본: 300) */
  width?: number;
  /** 각 아이템의 높이 (px, 기본: 400) */
  height?: number;
}

/**
 * 드래그 및 관성 상호작용 설정
 */
export interface InteractionConfig {
  /** 드래그 반응성 배율 (기본: 1.0, 높을수록 민감함) */
  dragSensitivity?: number;
  /** 관성 효과 활성화 여부 (기본: true) */
  enableMomentum?: boolean;
  /** 관성 감속 계수 (기본: 0.95, 0~1 사이) */
  momentumFriction?: number;
}

/**
 * 자동 회전 설정
 */
export interface AutoRotateConfig {
  /** 자동 회전 활성화 여부 (기본: false) */
  enabled?: boolean;
  /** 회전 속도 (degree/frame, 기본: 0.1) */
  speed?: number;
  /** 사용자 상호작용 후 재개 딜레이 (ms, 기본: 3000) */
  resumeDelay?: number;
}

/**
 * 시각적 효과 설정
 */
export interface VisualEffectConfig {
  /** 투명도 범위 [최소, 최대] (기본: [0.3, 1.0]) */
  opacityRange?: [number, number];
  /** 크기 스케일 범위 [최소, 최대] (기본: [0.7, 1.0]) */
  scaleRange?: [number, number];
}

/**
 * 스타일 및 클래스 설정
 */
export interface StyleConfig {
  /** 컨테이너 루트 요소의 CSS 클래스명 */
  className?: string;
  /** 각 아이템 요소의 CSS 클래스명 */
  itemClassName?: string;
}

/**
 * CarouselCircular 컴포넌트 Props
 */
export interface CarouselCircularProps {
  // ========== 필수 ==========
  /** 캐러셀에 표시할 아이템 배열 (최대 30개 권장) */
  items: CarouselItem[];

  // ========== 3D 기하학 ==========
  /** 3D 기하학 구조 설정 (반지름, 원근감 등) */
  geometry?: GeometryConfig;
  /** 아이템 크기 설정 */
  itemSize?: ItemSizeConfig;

  // ========== 상호작용 ==========
  /** 드래그 및 관성 효과 설정 */
  interaction?: InteractionConfig;
  /** 자동 회전 설정 */
  autoRotateConfig?: AutoRotateConfig;

  // ========== 시각 효과 ==========
  /** 투명도 및 스케일 효과 설정 */
  visualEffect?: VisualEffectConfig;

  // ========== 스타일링 ==========
  /** CSS 클래스명 설정 */
  style?: StyleConfig;

  // ========== 콜백 ==========
  /** 아이템 클릭 시 호출되는 콜백 함수 */
  onItemClick?: (item: CarouselItem, index: number) => void;

  // ========== 접근성 ==========
  /** 컨테이너 ARIA 레이블 (스크린 리더용, 기본: "Circular Carousel") */
  ariaLabel?: string;
  /** 키보드 방향키 회전 각도 (기본: 360 / items.length) */
  keyboardRotationStep?: number;
}

/**
 * CarouselItem 베이스 인터페이스
 */
interface CarouselItemBase {
  /** 고유 식별자 */
  id: string | number;
  /** 이미지 alt text 또는 aria-label */
  alt?: string;
  /** 아이템 제목 */
  title?: string;
  /** 추가 메타데이터 */
  [key: string]: unknown;
}

/**
 * 커스텀 콘텐츠를 사용하는 CarouselItem
 * content가 제공되면 image는 무시됨
 */
export interface CarouselItemWithContent extends CarouselItemBase {
  /** 커스텀 콘텐츠 (ReactNode) */
  content: ReactNode;
  /** image와 배타적 (사용 불가) */
  image?: never;
}

/**
 * 이미지 URL을 사용하는 CarouselItem
 */
export interface CarouselItemWithImage extends CarouselItemBase {
  /** 이미지 URL */
  image: string;
  /** content와 배타적 (사용 불가) */
  content?: never;
}

/**
 * CarouselItem Union Type
 * content 또는 image 중 하나는 필수
 */
export type CarouselItem = CarouselItemWithContent | CarouselItemWithImage;

/**
 * 아이템 변환 결과 (3D 위치 및 시각 효과)
 */
export interface ItemTransform {
  /** CSS transform 문자열 */
  transform: string;
  /** 계산된 opacity 값 */
  opacity: number;
  /** 계산된 z-index 값 */
  zIndex: number;
}
