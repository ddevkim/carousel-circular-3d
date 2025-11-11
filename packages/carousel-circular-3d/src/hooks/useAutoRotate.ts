import { useCallback, useEffect, useRef } from 'react';
import {
  cancelEasingAnimation,
  createEasingState,
  startEasingAnimation,
  stopEasingAnimation,
} from '../utils/easingAnimation';

/**
 * useAutoRotate Hook Props
 */
interface UseAutoRotateProps {
  enabled: boolean;
  speed: number;
  resumeDelay: number;
  onRotate: (delta: number) => void;
}

/**
 * useAutoRotate Hook 반환값
 */
interface UseAutoRotateReturn {
  pause: () => void;
  resume: () => void;
  scheduleResume: () => void;
}

/**
 * 자동 회전 처리 Hook (requestAnimationFrame 기반)
 * @param props - useAutoRotate Hook Props
 * @returns 자동 회전 제어 함수들
 */
export function useAutoRotate({
  enabled,
  speed,
  resumeDelay,
  onRotate,
}: UseAutoRotateProps): UseAutoRotateReturn {
  const animationIdRef = useRef<number | null>(null);
  const resumeTimeoutIdRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const easingStateRef = useRef(createEasingState());

  /**
   * 자동 회전 일시정지 (easing 적용)
   */
  const pause = useCallback(() => {
    // 1. 기존 모든 애니메이션 즉시 취소
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (resumeTimeoutIdRef.current !== null) {
      clearTimeout(resumeTimeoutIdRef.current);
      resumeTimeoutIdRef.current = null;
    }

    // 2. Easing 애니메이션도 취소
    cancelEasingAnimation(easingStateRef.current);

    // 3. Easing 종료 시작 (현재 속도에서 0으로)
    isPausedRef.current = false; // easing 중에는 paused가 아님

    const animId = stopEasingAnimation(
      easingStateRef.current,
      (speed) => {
        onRotate(speed);
      },
      () => {
        isPausedRef.current = true;
        animationIdRef.current = null;
      }
    );

    // 4. 애니메이션 ID 동기화
    animationIdRef.current = animId;

    if (animId === null) {
      // 즉시 완료 (이미 속도가 0)
      isPausedRef.current = true;
    }
  }, [onRotate]);

  /**
   * 자동 회전 재개 (easing 적용)
   */
  const resume = useCallback(() => {
    if (!enabled) return;

    // 1. 기존 모든 애니메이션/타이머 즉시 정리
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (resumeTimeoutIdRef.current !== null) {
      clearTimeout(resumeTimeoutIdRef.current);
      resumeTimeoutIdRef.current = null;
    }

    // 2. Easing 애니메이션도 취소
    cancelEasingAnimation(easingStateRef.current);

    isPausedRef.current = false;

    // 3. Easing 시작 (0에서 speed로)
    const animId = startEasingAnimation(
      easingStateRef.current,
      speed,
      (newSpeed) => {
        if (isPausedRef.current) {
          return;
        }
        onRotate(newSpeed);
      },
      () => {
        // Easing 완료 - 정상 속도로 계속
        if (isPausedRef.current) return;

        const continueAnimate = () => {
          if (isPausedRef.current) {
            if (animationIdRef.current !== null) {
              cancelAnimationFrame(animationIdRef.current);
              animationIdRef.current = null;
            }
            return;
          }
          onRotate(speed);
          easingStateRef.current.currentSpeed = speed;
          animationIdRef.current = requestAnimationFrame(continueAnimate);
        };

        animationIdRef.current = requestAnimationFrame(continueAnimate);
      }
    );

    // 4. 애니메이션 ID 동기화
    animationIdRef.current = animId;
  }, [enabled, speed, onRotate]);

  /**
   * 자동 회전 재개 스케줄 (딜레이 후)
   */
  const scheduleResume = useCallback(() => {
    if (!enabled) return;

    pause(); // 기존 타이머 정리

    resumeTimeoutIdRef.current = window.setTimeout(() => {
      resume();
    }, resumeDelay);
  }, [enabled, resumeDelay, resume, pause]);

  /**
   * enabled 변경 시 자동 회전 시작/중지
   */
  useEffect(() => {
    if (enabled) {
      resume();
    } else {
      pause();
    }

    return () => {
      pause();
    };
  }, [enabled, resume, pause]);

  return {
    pause,
    resume,
    scheduleResume,
  };
}
