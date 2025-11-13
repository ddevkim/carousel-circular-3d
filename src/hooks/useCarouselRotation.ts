import { useCallback, useRef, useState } from 'react';
import type { ItemWithOrientation } from '../types';
import { normalizeAngle180, normalizeAngle360 } from '../utils/helpers';
import { useAutoRotate } from './useAutoRotate';
import { useDrag } from './useDrag';
import { useRotateToIndex } from './useRotateToIndex';

/**
 * 유의미한 회전 변화를 판단하는 임계값 (degree)
 * 이 값 이상의 회전이 발생하면 드래그로 간주하여 클릭을 방지한다.
 */
const SIGNIFICANT_ROTATION_THRESHOLD_DEGREES = 1;

/**
 * 회전 상태 통합 훅 파라미터
 */
export interface UseCarouselRotationParams {
  /** 원의 반지름 (px) */
  radius: number;
  /** 드래그 민감도 배율 */
  dragSensitivity: number;
  /** 관성 효과 활성화 여부 */
  enableMomentum: boolean;
  /** 관성 마찰 계수 */
  momentumFriction: number;
  /** 자동 회전 활성화 여부 */
  autoRotate: boolean;
  /** 자동 회전 속도 (degree/frame) */
  autoRotateSpeed: number;
  /** 자동 회전 재개 딜레이 (ms) */
  autoRotateResumeDelay: number;
  /** 아이템 총 개수 */
  itemCount: number;
  /** 아이템 메타데이터 (orientation 기반 각도 정보) */
  itemsMetadata: ItemWithOrientation[];
  /** 브라우저 환경 여부 */
  isBrowser: boolean;
}

/**
 * 회전 상태 통합 훅 반환값
 */
export interface UseCarouselRotationReturn {
  /** 최종 회전 각도 (dragRotation + autoRotation + keyboardRotation) */
  finalRotation: number;
  /** 드래그 중 여부 */
  isDragging: boolean;
  /** 관성 애니메이션 진행 중 여부 */
  isMomentumActive: boolean;
  /** 현재 시점에서 유의미한 드래그 여부를 동기적으로 계산 (클릭 방지 판단용) */
  checkSignificantDragNow: () => boolean;
  /** 마우스 다운 핸들러 */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** 터치 시작 핸들러 */
  handleTouchStart: (e: React.TouchEvent) => void;
  /** 마우스 enter 핸들러 */
  handleMouseEnter: () => void;
  /** 마우스 leave 핸들러 */
  handleMouseLeave: () => void;
  /** 키보드 입력 핸들러 */
  handleKeyboardInput: () => void;
  /** 키보드 회전 함수 */
  rotateByDelta: (indexDelta: number) => void;
  /** 유의미한 드래그 상태 리셋 */
  resetSignificantDrag: () => void;
}

/**
 * 드래그, 자동 회전, 키보드 회전을 통합 관리하는 훅
 * @param params - 훅 파라미터
 * @returns 통합된 회전 상태 및 핸들러
 */
export function useCarouselRotation(params: UseCarouselRotationParams): UseCarouselRotationReturn {
  const {
    radius,
    dragSensitivity,
    enableMomentum,
    momentumFriction,
    autoRotate,
    autoRotateSpeed,
    autoRotateResumeDelay,
    itemCount,
    itemsMetadata,
    isBrowser,
  } = params;

  // mousedown 시점의 rotation 각도 저장 (클릭 방지 판단용)
  const mouseDownRotationRef = useRef<number | null>(null);

  // 자동 회전 상태
  const [autoRotation, setAutoRotation] = useState(0);
  const handleAutoRotate = useCallback((delta: number) => {
    setAutoRotation((prev) => prev + delta);
  }, []); // Empty deps - function logic is stable, uses setState updater function

  // 자동 회전 Hook
  const autoRotateControl = useAutoRotate({
    enabled: autoRotate && isBrowser,
    speed: autoRotateSpeed,
    resumeDelay: autoRotateResumeDelay,
    onRotate: handleAutoRotate,
  });

  // 드래그 Hook
  const {
    rotation: dragRotation,
    isDragging,
    isMomentumActive,
    handleMouseDown: dragHandleMouseDown,
    handleTouchStart: dragHandleTouchStart,
  } = useDrag({
    radius,
    dragSensitivity,
    enableMomentum,
    momentumFriction,
    onMomentumEnd: () => {
      if (autoRotate) {
        autoRotateControl.scheduleResume();
      }
    },
  });

  // 키보드 회전 애니메이션 Hook
  const rotateToIndexHook = useRotateToIndex({
    itemCount,
    itemsMetadata,
    dragAndAutoRotation: dragRotation + autoRotation,
    isDragging,
    isMomentumActive,
    enabled: isBrowser,
  });

  // 최종 회전 각도 (dragRotation + autoRotation + keyboardRotation)
  const finalRotation = dragRotation + autoRotation + rotateToIndexHook.keyboardRotation;

  // mousedown 시 현재 rotation 저장
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      mouseDownRotationRef.current = normalizeAngle360(finalRotation);
      dragHandleMouseDown(e);
    },
    [finalRotation, dragHandleMouseDown]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      mouseDownRotationRef.current = normalizeAngle360(finalRotation);
      dragHandleTouchStart(e);
    },
    [finalRotation, dragHandleTouchStart]
  );

  // 현재 시점에서 유의미한 드래그 여부를 동기적으로 계산
  const checkSignificantDragNow = useCallback((): boolean => {
    // 드래그 중이거나 관성 진행 중이면 방지
    if (isDragging || isMomentumActive) {
      return true;
    }

    // mousedown 시점의 각도와 현재 각도 비교
    if (mouseDownRotationRef.current !== null) {
      const startRotation = mouseDownRotationRef.current;
      const endRotation = normalizeAngle360(finalRotation);
      const rotationDelta = normalizeAngle180(endRotation - startRotation);
      return Math.abs(rotationDelta) >= SIGNIFICANT_ROTATION_THRESHOLD_DEGREES;
    }

    return false;
  }, [isDragging, isMomentumActive, finalRotation]);

  // 유의미한 드래그 상태 리셋 함수
  const resetSignificantDrag = useCallback(() => {
    mouseDownRotationRef.current = null;
  }, []);

  // 키보드 입력 시 자동 회전 재개 스케줄
  const handleKeyboardInput = useCallback(() => {
    autoRotateControl.scheduleResume();
  }, [autoRotateControl]);

  // 마우스 enter/leave 핸들러
  const handleMouseEnter = useCallback(() => {
    autoRotateControl.pause();
  }, [autoRotateControl]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging && !isMomentumActive) {
      autoRotateControl.scheduleResume();
    }
  }, [isDragging, isMomentumActive, autoRotateControl]);

  return {
    finalRotation,
    isDragging,
    isMomentumActive,
    checkSignificantDragNow,
    handleMouseDown,
    handleTouchStart,
    handleMouseEnter,
    handleMouseLeave,
    handleKeyboardInput,
    rotateByDelta: rotateToIndexHook.rotateByDelta,
    resetSignificantDrag,
  };
}
