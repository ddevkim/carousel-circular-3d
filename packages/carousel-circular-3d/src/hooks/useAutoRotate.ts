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

  // onRotate 콜백의 참조 안정화
  // 최신 콜백을 ref에 저장하여 의존성 배열 문제 해결
  const onRotateRef = useRef(onRotate);
  onRotateRef.current = onRotate;

  /**
   * 애니메이션과 타이머를 정리하는 공통 로직
   */
  const cleanup = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (resumeTimeoutIdRef.current !== null) {
      clearTimeout(resumeTimeoutIdRef.current);
      resumeTimeoutIdRef.current = null;
    }
    cancelEasingAnimation(easingStateRef.current);
  }, []);

  /**
   * 자동 회전 일시정지 (easing 적용)
   */
  const pause = useCallback(() => {
    cleanup();
    isPausedRef.current = false;

    const animId = stopEasingAnimation(
      easingStateRef.current,
      (speed) => {
        onRotateRef.current(speed);
      },
      () => {
        isPausedRef.current = true;
        animationIdRef.current = null;
      }
    );

    animationIdRef.current = animId;

    if (animId === null) {
      isPausedRef.current = true;
    }
  }, [cleanup]);

  /**
   * 자동 회전 재개 (easing 적용)
   */
  const resume = useCallback(() => {
    if (!enabled) return;

    cleanup();
    isPausedRef.current = false;

    const animId = startEasingAnimation(
      easingStateRef.current,
      speed,
      (newSpeed) => {
        if (isPausedRef.current) {
          return;
        }
        onRotateRef.current(newSpeed);
      },
      () => {
        if (isPausedRef.current) return;

        const continueAnimate = () => {
          if (isPausedRef.current) {
            if (animationIdRef.current !== null) {
              cancelAnimationFrame(animationIdRef.current);
              animationIdRef.current = null;
            }
            return;
          }
          onRotateRef.current(speed);
          easingStateRef.current.currentSpeed = speed;
          animationIdRef.current = requestAnimationFrame(continueAnimate);
        };

        animationIdRef.current = requestAnimationFrame(continueAnimate);
      }
    );

    animationIdRef.current = animId;
  }, [enabled, speed, cleanup]);

  /**
   * 자동 회전 재개 스케줄 (딜레이 후)
   * pause → delay → resume 순서로 실행
   */
  const scheduleResume = useCallback(() => {
    if (!enabled) return;

    // 일시정지
    pause();

    // 딜레이 후 재개
    resumeTimeoutIdRef.current = window.setTimeout(() => {
      resume();
    }, resumeDelay);
  }, [enabled, resumeDelay, pause, resume]);

  /**
   * enabled 변경 시 자동 회전 시작/중지
   * resume/pause 함수를 직접 호출하지 않고 내부 로직을 인라인으로 구현하여 의존성 문제 해결
   */
  useEffect(() => {
    if (enabled) {
      // Resume 로직
      cleanup();
      isPausedRef.current = false;

      const animId = startEasingAnimation(
        easingStateRef.current,
        speed,
        (newSpeed) => {
          if (isPausedRef.current) return;
          onRotateRef.current(newSpeed);
        },
        () => {
          if (isPausedRef.current) return;

          const continueAnimate = () => {
            if (isPausedRef.current) {
              if (animationIdRef.current !== null) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
              }
              return;
            }
            onRotateRef.current(speed);
            easingStateRef.current.currentSpeed = speed;
            animationIdRef.current = requestAnimationFrame(continueAnimate);
          };

          animationIdRef.current = requestAnimationFrame(continueAnimate);
        }
      );

      animationIdRef.current = animId;
    } else {
      // Pause 로직
      cleanup();
      isPausedRef.current = false;

      const animId = stopEasingAnimation(
        easingStateRef.current,
        (speed) => {
          onRotateRef.current(speed);
        },
        () => {
          isPausedRef.current = true;
          animationIdRef.current = null;
        }
      );

      animationIdRef.current = animId;

      if (animId === null) {
        isPausedRef.current = true;
      }
    }

    return () => {
      cleanup();
      isPausedRef.current = true;
    };
  }, [enabled, speed, cleanup]); // onRotate 제거

  return {
    pause,
    resume,
    scheduleResume,
  };
}
