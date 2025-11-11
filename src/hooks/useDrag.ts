import { useCallback, useEffect, useRef, useState } from 'react';
import { DRAG_CONSTANTS } from '../constants';

/**
 * useDrag Hook Props
 */
interface UseDragProps {
  radius: number;
  dragSensitivity: number;
  enableMomentum: boolean;
  momentumFriction: number;
  onMomentumEnd?: () => void;
}

/**
 * useDrag Hook 반환값
 */
interface UseDragReturn {
  rotation: number;
  isDragging: boolean;
  isMomentumActive: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
}

/**
 * 드래그 및 관성 애니메이션 처리 Hook
 * @param props - useDrag Hook Props
 * @returns 드래그 상태 및 핸들러
 */
export function useDrag({
  radius,
  dragSensitivity,
  enableMomentum,
  momentumFriction,
  onMomentumEnd,
}: UseDragProps): UseDragReturn {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMomentumActive, setIsMomentumActive] = useState(false);

  const dragStartXRef = useRef(0);
  const lastRotationRef = useRef(0);
  const velocityRef = useRef(0);
  const previousDeltaRotationRef = useRef(0);
  const hasMovedRef = useRef(false);
  const momentumAnimationIdRef = useRef<number | null>(null);

  /**
   * 관성 애니메이션 시작
   */
  const startMomentumAnimation = useCallback(() => {
    setIsMomentumActive(true);

    const animateMomentum = () => {
      setRotation((prev) => prev + velocityRef.current);
      velocityRef.current *= momentumFriction;

      if (Math.abs(velocityRef.current) < DRAG_CONSTANTS.MOMENTUM_STOP_THRESHOLD) {
        setIsMomentumActive(false);
        onMomentumEnd?.();
        return;
      }

      momentumAnimationIdRef.current = requestAnimationFrame(animateMomentum);
    };

    momentumAnimationIdRef.current = requestAnimationFrame(animateMomentum);
  }, [momentumFriction, onMomentumEnd]);

  /**
   * 관성 애니메이션 중단
   */
  const stopMomentumAnimation = useCallback(() => {
    if (momentumAnimationIdRef.current !== null) {
      cancelAnimationFrame(momentumAnimationIdRef.current);
      momentumAnimationIdRef.current = null;
      setIsMomentumActive(false);
    }
  }, []);

  /**
   * 드래그 시작 핸들러 (공통)
   */
  const handleDragStart = useCallback(
    (clientX: number) => {
      stopMomentumAnimation();

      dragStartXRef.current = clientX;
      lastRotationRef.current = rotation;
      velocityRef.current = 0;
      previousDeltaRotationRef.current = 0;
      hasMovedRef.current = false;
      setIsDragging(true);
    },
    [rotation, stopMomentumAnimation]
  );

  /**
   * 드래그 이동 핸들러 (공통)
   */
  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const deltaX = clientX - dragStartXRef.current;

      // 최소 이동 거리 확인 (클릭 오동작 방지)
      if (Math.abs(deltaX) < DRAG_CONSTANTS.DRAG_START_DISTANCE && !hasMovedRef.current) {
        return;
      }

      hasMovedRef.current = true;

      // 드래그 거리를 회전 각도로 변환
      // 원의 둘레 기준: 2πr만큼 드래그 = 360도 회전
      const circumference = 2 * Math.PI * radius;
      const deltaRotation = (deltaX / circumference) * 360 * dragSensitivity;
      const newRotation = lastRotationRef.current + deltaRotation;

      // 속도 계산 (관성용)
      velocityRef.current = deltaRotation - previousDeltaRotationRef.current;
      previousDeltaRotationRef.current = deltaRotation;

      setRotation(newRotation);
    },
    [isDragging, radius, dragSensitivity]
  );

  /**
   * 드래그 종료 핸들러 (공통)
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    hasMovedRef.current = false;

    if (enableMomentum && Math.abs(velocityRef.current) > DRAG_CONSTANTS.MOMENTUM_START_THRESHOLD) {
      startMomentumAnimation();
    } else {
      onMomentumEnd?.();
    }
  }, [enableMomentum, startMomentumAnimation, onMomentumEnd]);

  /**
   * 마우스 다운 핸들러
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  /**
   * 터치 시작 핸들러 (멀티터치는 첫 번째만 추적)
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // 핀치줌 방지
        return;
      }
      handleDragStart(e.touches[0]?.clientX ?? 0);
    },
    [handleDragStart]
  );

  /**
   * 전역 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // 핀치줌 방지
        return;
      }
      // 성능 최적화: 불필요한 preventDefault 제거 (passive: true로 변경 가능)
      // 단, 스크롤 방지가 필요한 경우에만 preventDefault 호출
      e.preventDefault();
      handleDragMove(e.touches[0]?.clientX ?? 0);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    // 성능 최적화: 마우스 이벤트는 passive 적용
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    // touchmove는 preventDefault 사용으로 passive: false 유지
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      stopMomentumAnimation();
    };
  }, [stopMomentumAnimation]);

  return {
    rotation,
    isDragging,
    isMomentumActive,
    handleMouseDown,
    handleTouchStart,
  };
}
