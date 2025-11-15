import { useCallback, useEffect, useRef, useState } from 'react';
import './RangeSlider.css';

interface RangeSliderProps {
  /** 슬라이더 최소값 */
  min: number;
  /** 슬라이더 최대값 */
  max: number;
  /** 현재 최소 값 */
  minValue: number;
  /** 현재 최대 값 */
  maxValue: number;
  /** 스텝 단위 */
  step: number;
  /** 값 변경 핸들러 */
  onChange: (min: number, max: number) => void;
  /** 레이블 텍스트 */
  label: string;
  /** 값 포맷 함수 (기본: 소수점 2자리) */
  formatValue?: (value: number) => string;
}

/**
 * 두 개의 핸들을 가진 Range Slider 컴포넌트
 * Min과 Max 값을 동시에 조절할 수 있습니다.
 */
export function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  step,
  onChange,
  label,
  formatValue = (val) => val.toFixed(2),
}: RangeSliderProps) {
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // 값을 범위 내로 제한하고 스텝에 맞춤
  const clampValue = useCallback(
    (value: number) => {
      const clamped = Math.max(min, Math.min(max, value));
      return Math.round(clamped / step) * step;
    },
    [min, max, step]
  );

  // 마우스/터치 위치를 값으로 변환
  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return clampValue(rawValue);
    },
    [min, max, clampValue]
  );

  // Min 핸들 드래그 핸들러
  const handleMinPointerDown = useCallback(() => {
    setIsDraggingMin(true);
  }, []);

  // Max 핸들 드래그 핸들러
  const handleMaxPointerDown = useCallback(() => {
    setIsDraggingMax(true);
  }, []);

  // 드래그 중 처리
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingMin && !isDraggingMax) return;

      const newValue = getValueFromPosition(e.clientX);

      if (isDraggingMin) {
        // Min 값은 Max 값을 넘을 수 없음
        const constrainedMin = Math.min(newValue, maxValue - step);
        onChange(constrainedMin, maxValue);
      } else if (isDraggingMax) {
        // Max 값은 Min 값보다 작을 수 없음
        const constrainedMax = Math.max(newValue, minValue + step);
        onChange(minValue, constrainedMax);
      }
    },
    [isDraggingMin, isDraggingMax, getValueFromPosition, minValue, maxValue, step, onChange]
  );

  // 드래그 종료
  const handlePointerUp = useCallback(() => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  }, []);

  // 전역 이벤트 리스너 등록/해제
  useEffect(() => {
    if (!isDraggingMin && !isDraggingMax) return;

    const handleMove = (e: PointerEvent) => handlePointerMove(e);
    const handleUp = () => handlePointerUp();

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDraggingMin, isDraggingMax, handlePointerMove, handlePointerUp]);

  // 퍼센트 계산
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="range-slider-container">
      <div className="range-slider-label">
        {label}:{' '}
        <span className="range-slider-values">
          {formatValue(minValue)} - {formatValue(maxValue)}
        </span>
      </div>

      <div className="range-slider-track-container" ref={trackRef}>
        {/* 배경 트랙 */}
        <div className="range-slider-track-bg" />

        {/* 활성화된 범위 */}
        <div
          className="range-slider-track-active"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min 핸들 */}
        <div
          className={`range-slider-handle ${isDraggingMin ? 'dragging' : ''}`}
          style={{ left: `${minPercent}%` }}
          onPointerDown={handleMinPointerDown}
          role="slider"
          aria-label={`${label} minimum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minValue}
          tabIndex={0}
        />

        {/* Max 핸들 */}
        <div
          className={`range-slider-handle ${isDraggingMax ? 'dragging' : ''}`}
          style={{ left: `${maxPercent}%` }}
          onPointerDown={handleMaxPointerDown}
          role="slider"
          aria-label={`${label} maximum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxValue}
          tabIndex={0}
        />
      </div>
    </div>
  );
}
