import { useCallback, useEffect, useRef } from 'react';
import { KEYBOARD_DEBOUNCE_MS } from '../constants';
import type { RotationDirection } from '../utils/rotationAnimation';

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
        // 브라우저 기본 동작(스크롤 등) 방지를 먼저 수행
        // Debounce로 무시되는 이벤트에서도 스크롤 방지 필요
        e.preventDefault();

        const now = Date.now();
        const timeSinceLastKeyDown = now - lastKeyDownTimeRef.current;

        // Debounce 체크: 설정된 시간 이내면 이벤트 무시
        if (timeSinceLastKeyDown < debounceMs) {
          return;
        }

        // Debounce 시간 경과 후에만 이벤트 처리
        lastKeyDownTimeRef.current = now;

        // 키보드 입력 콜백 호출 (자동 회전 pause용)
        onKeyboardInput?.();

        // 상대적 인덱스 이동
        // 이미지가 시계방향으로 index 증가 순서로 배치되어 있음
        // 우측 화살표: carousel을 반시계방향으로 회전 → 다음 이미지 (index +1)
        // 좌측 화살표: carousel을 시계방향으로 회전 → 이전 이미지 (index -1)
        if (e.key === 'ArrowRight') {
          // 다음 이미지로 이동: index +1, carousel은 반시계방향 회전
          onRotateByDelta(+1, 'counterClockwise');
        } else {
          // 이전 이미지로 이동: index -1, carousel은 시계방향 회전
          onRotateByDelta(-1, 'clockwise');
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
