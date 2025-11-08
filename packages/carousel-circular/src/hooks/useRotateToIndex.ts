import { useCallback, useEffect, useRef, useState } from 'react';
import { KEYBOARD_ROTATION_DURATION } from '../constants';
import {
  cancelRotationAnimation,
  createRotationAnimationState,
  type RotationAnimationState,
  type RotationDirection,
  startRotationAnimation,
} from '../utils/rotationAnimation';

/**
 * useRotateToIndex Hook Props
 */
interface UseRotateToIndexProps {
  /** 아이템 총 개수 */
  itemCount: number;
  /** 활성화 여부 (기본: true) */
  enabled?: boolean;
}

/**
 * useRotateToIndex Hook 반환값
 */
interface UseRotateToIndexReturn {
  /** 상대적 인덱스 이동 (delta, direction) */
  rotateByDelta: (indexDelta: number, direction?: RotationDirection) => void;
  /** 애니메이션된 회전 각도 (누적) */
  keyboardRotation: number;
  /** 애니메이션 진행 중 여부 */
  isAnimating: boolean;
  /** 현재 타겟 인덱스 */
  currentTargetIndex: number;
}

/**
 * 상대적 인덱스 이동으로 회전 애니메이션을 수행하는 Hook
 * delta만큼 인덱스를 이동하여 ease-out 애니메이션 적용
 * @param props - useRotateToIndex Hook Props
 * @returns 회전 제어 함수 및 애니메이션 상태
 */
export function useRotateToIndex({
  itemCount,
  enabled = true,
}: UseRotateToIndexProps): UseRotateToIndexReturn {
  const [keyboardRotation, setKeyboardRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const animationStateRef = useRef<RotationAnimationState>(createRotationAnimationState());

  /**
   * 상대적 인덱스 이동
   * @param indexDelta - 이동할 인덱스 개수 (+1, -1 등)
   * @param direction - 회전 방향 (optional, default: 'auto')
   *                    'clockwise': 항상 시계방향 (양수)
   *                    'counterClockwise': 항상 반시계방향 (음수)
   *                    'auto': 최단 거리 (기본값)
   */
  const rotateByDelta = useCallback(
    (indexDelta: number, direction?: RotationDirection) => {
      if (!enabled || itemCount === 0) return;

      // 아이템당 각도 간격
      const anglePerItem = 360 / itemCount;

      // 새로운 타겟 인덱스 계산
      const newTargetIndex = (currentTargetIndex + indexDelta + itemCount) % itemCount;

      // 타겟 인덱스의 절대 각도 (정확한 목표 위치)
      const absoluteTargetAngle = newTargetIndex * anglePerItem;

      // 현재 실시간 각도 (애니메이션 진행 중이면 currentAngle, 아니면 keyboardRotation)
      const currentRealTimeAngle = isAnimating
        ? animationStateRef.current.currentAngle
        : keyboardRotation;

      // 명시된 방향이 없으면 'auto' 사용
      const rotationDirection = direction ?? 'auto';

      // 타겟 인덱스 업데이트
      setCurrentTargetIndex(newTargetIndex);

      // 애니메이션 시작
      setIsAnimating(true);

      // 현재 실시간 각도에서 절대 타겟 각도로 이동
      startRotationAnimation(
        animationStateRef.current,
        currentRealTimeAngle,
        absoluteTargetAngle,
        KEYBOARD_ROTATION_DURATION,
        rotationDirection,
        (angle) => {
          setKeyboardRotation(angle);
        },
        () => {
          setIsAnimating(false);
          // 정확한 절대 타겟 각도로 설정 (누적 오류 방지)
          setKeyboardRotation(absoluteTargetAngle);
        }
      );
    },
    [enabled, itemCount, currentTargetIndex, keyboardRotation, isAnimating]
  );

  /**
   * 컴포넌트 언마운트 시 애니메이션 정리
   */
  useEffect(() => {
    return () => {
      cancelRotationAnimation(animationStateRef.current);
    };
  }, []);

  return {
    rotateByDelta,
    keyboardRotation,
    isAnimating,
    currentTargetIndex,
  };
}
