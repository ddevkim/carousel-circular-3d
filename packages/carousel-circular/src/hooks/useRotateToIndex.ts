import { useCallback, useEffect, useRef, useState } from 'react';
import { KEYBOARD_ROTATION_DURATION } from '../constants';
import type { ItemWithOrientation } from '../types';
import { calculateCenterIndex } from '../utils/helpers';
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
  /** 아이템 메타데이터 (orientation 기반 각도 정보) */
  itemsMetadata: ItemWithOrientation[];
  /** 최종 회전 각도 (dragRotation + autoRotation + keyboardRotation) */
  finalRotation: number;
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
  itemsMetadata,
  finalRotation,
  enabled = true,
}: UseRotateToIndexProps): UseRotateToIndexReturn {
  const [keyboardRotation, setKeyboardRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const animationStateRef = useRef<RotationAnimationState>(createRotationAnimationState());

  /**
   * 상대적 인덱스 이동
   * orientation 기반 각도를 고려하여 타겟 아이템을 화면 정면(0°)에 배치
   * @param indexDelta - 이동할 인덱스 개수 (+1, -1 등)
   * @param direction - 회전 방향 (optional, default: 'auto')
   */
  const rotateByDelta = useCallback(
    (indexDelta: number, direction?: RotationDirection) => {
      if (!enabled || itemCount === 0) return;

      // 키보드 입력 시점의 현재 중앙 인덱스를 계산 (on-demand)
      const currentCenterIndex = calculateCenterIndex(itemsMetadata, finalRotation, itemCount);

      // 현재 화면 중앙의 실제 인덱스를 기반으로 새로운 타겟 인덱스 계산
      const newTargetIndex = (currentCenterIndex + indexDelta + itemCount) % itemCount;

      // 조기 반환 체크
      if (itemsMetadata.length === 0) {
        return;
      }

      // 타겟 아이템 메타데이터 조회
      const targetMetadata = itemsMetadata[newTargetIndex];
      if (!targetMetadata) {
        return;
      }

      // 타겟 아이템을 정면(0°)에 배치하기 위한 목표 keyboardRotation 계산
      // finalRotation = dragRotation + autoRotation + keyboardRotation
      // 타겟을 0°에 배치: targetItemAngle + finalRotation = 0
      // → keyboardRotation = -targetItemAngle - (dragRotation + autoRotation)
      const targetItemAngle = targetMetadata.cumulativeAngle;
      const dragAndAutoRotation = finalRotation - keyboardRotation;
      const targetKeyboardRotation = -targetItemAngle - dragAndAutoRotation;

      // 현재 실시간 keyboardRotation
      const currentRealTimeKeyboardRotation = isAnimating
        ? animationStateRef.current.currentAngle
        : keyboardRotation;

      // 명시된 방향이 없으면 'auto' 사용
      const rotationDirection = direction ?? 'auto';

      // 타겟 인덱스 업데이트
      setCurrentTargetIndex(newTargetIndex);

      // 애니메이션 시작
      setIsAnimating(true);

      // 현재 keyboardRotation에서 타겟 keyboardRotation으로 이동
      startRotationAnimation(
        animationStateRef.current,
        currentRealTimeKeyboardRotation,
        targetKeyboardRotation,
        KEYBOARD_ROTATION_DURATION,
        rotationDirection,
        (angle) => {
          setKeyboardRotation(angle);
        },
        () => {
          setIsAnimating(false);
          // 정확한 타겟 각도로 설정 (누적 오류 방지)
          setKeyboardRotation(targetKeyboardRotation);
        }
      );
    },
    [enabled, itemCount, itemsMetadata, finalRotation, isAnimating, keyboardRotation]
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
