import { useEffect, useRef } from 'react';

/**
 * usePerformanceMonitor Hook Props
 */
interface UsePerformanceMonitorProps {
  /** 모니터링 활성화 여부 (개발 환경에서만 true 권장) */
  enabled?: boolean;
  /** FPS 측정 간격 (ms) */
  measureInterval?: number;
  /** 로깅 활성화 */
  enableLogging?: boolean;
}

/**
 * 성능 모니터링 결과
 */
interface PerformanceStats {
  /** 현재 FPS */
  fps: number;
  /** 활성 requestAnimationFrame 개수 */
  activeRAFCount: number;
  /** 평균 프레임 시간 (ms) */
  avgFrameTime: number;
}

/**
 * 개발/디버깅용 성능 모니터링 Hook
 * 
 * @example
 * ```typescript
 * // 개발 환경에서만 활성화
 * usePerformanceMonitor({
 *   enabled: process.env.NODE_ENV === 'development',
 *   enableLogging: true,
 * });
 * ```
 * 
 * @param props - usePerformanceMonitor Props
 */
export function usePerformanceMonitor({
  enabled = false,
  measureInterval = 1000,
  enableLogging = false,
}: UsePerformanceMonitorProps = {}): PerformanceStats | null {
  const statsRef = useRef<PerformanceStats>({
    fps: 0,
    activeRAFCount: 0,
    avgFrameTime: 0,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafCountRef = useRef<number>(0);
  const measureIntervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // requestAnimationFrame 래핑하여 카운트
    const originalRAF = window.requestAnimationFrame;
    const originalCAF = window.cancelAnimationFrame;

    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      rafCountRef.current++;

      return originalRAF((time: number) => {
        rafCountRef.current--;

        // 프레임 시간 측정
        const now = performance.now();
        const frameTime = now - lastFrameTimeRef.current;
        frameTimesRef.current.push(frameTime);
        lastFrameTimeRef.current = now;

        // 최근 60프레임만 유지
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        callback(time);
      });
    };

    window.cancelAnimationFrame = (id: number): void => {
      rafCountRef.current = Math.max(0, rafCountRef.current - 1);
      originalCAF(id);
    };

    // 주기적으로 통계 업데이트
    measureIntervalIdRef.current = window.setInterval(() => {
      if (frameTimesRef.current.length === 0) {
        statsRef.current = {
          fps: 0,
          activeRAFCount: rafCountRef.current,
          avgFrameTime: 0,
        };
        return;
      }

      const avgFrameTime =
        frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);

      statsRef.current = {
        fps: Math.min(fps, 60), // 최대 60fps
        activeRAFCount: rafCountRef.current,
        avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      };

      if (enableLogging) {
        console.log('[Performance Monitor]', statsRef.current);
      }
    }, measureInterval);

    return () => {
      // 원래 함수 복원
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;

      if (measureIntervalIdRef.current !== null) {
        clearInterval(measureIntervalIdRef.current);
      }
    };
  }, [enabled, measureInterval, enableLogging]);

  return enabled ? statsRef.current : null;
}

/**
 * 성능 경고 임계값
 */
export const PERFORMANCE_THRESHOLDS = {
  /** 낮은 FPS 경고 (30fps 미만) */
  LOW_FPS: 30,
  /** 위험한 FPS (20fps 미만) */
  CRITICAL_FPS: 20,
  /** RAF 누수 의심 (5개 이상 동시 실행) */
  RAF_LEAK_THRESHOLD: 5,
  /** 긴 프레임 시간 (33ms 초과 = 30fps 미만) */
  LONG_FRAME_TIME: 33,
} as const;

