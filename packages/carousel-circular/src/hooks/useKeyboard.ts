import { useCallback, useEffect, useRef } from 'react';
import type { RotationDirection } from '../utils/rotationAnimation';
import { KEYBOARD_DEBOUNCE_MS } from '../constants';

/**
 * useKeyboard Hook Props
 */
interface UseKeyboardProps {
  enabled: boolean;
  onRotateByDelta: (indexDelta: number, direction?: RotationDirection) => void;
  onKeyboardInput?: () => void;
  debounceMs?: number;
}

/**
 * 키보드 네비게이션 처리 Hook
 * Left/Right Arrow 키로 carousel 회전 (ease-out 애니메이션)
 * Debounce를 통해 키 연속 입력 시 이벤트 방지
 * @param props - useKeyboard Hook Props
 */
export function useKeyboard({
  enabled,
  onRotateByDelta,
  onKeyboardInput,
  debounceMs = KEYBOARD_DEBOUNCE_MS,
}: UseKeyboardProps): void {
  const lastKeyDownTimeRef = useRef<number>(0);

  /**
   * 키보드 이벤트 핸들러
   * Debounce 로직으로 너무 빠른 입력 방지
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const now = Date.now();
        const timeSinceLastKeyDown = now - lastKeyDownTimeRef.current;

        // Debounce 체크: 설정된 시간 이내면 이벤트 무시
        if (timeSinceLastKeyDown < debounceMs) {
          return;
        }

        // Debounce 시간 경과 후에만 이벤트 처리
        lastKeyDownTimeRef.current = now;

        e.preventDefault();

        // 키보드 입력 콜백 호출 (자동 회전 pause용)
        onKeyboardInput?.();

        // 상대적 인덱스 이동 (명시적 방향 지정)
        if (e.key === 'ArrowLeft') {
          // 반시계 방향 (인덱스 감소, 명시적으로 'counterClockwise' 지정)
          onRotateByDelta(-1, 'counterClockwise');
        } else {
          // 시계 방향 (인덱스 증가, 명시적으로 'clockwise' 지정)
          onRotateByDelta(+1, 'clockwise');
        }
      }
    },
    [enabled, onRotateByDelta, onKeyboardInput, debounceMs]
  );

  /**
   * 키보드 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
