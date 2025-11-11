import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LIGHTBOX_CONSTANTS } from '../../constants';
import { useLightboxAnimation } from '../../hooks/useLightboxAnimation';
import type { CarouselItem, LightboxOptions, LightboxState } from '../../types';
import { CloseButton } from '../ui';
import { LightboxImage } from './LightboxImage';
import { LightboxNavigation } from './LightboxNavigation';
import { createBackdropStyle } from './styles';

const FALLBACK_ALT_PREFIX = 'Image';
const ARIA_INDEX_SEPARATOR = ' of ';
const ARIA_TITLE_SEPARATOR = ': ';

/**
 * 전달된 문자열을 공백 제거 후 유효한 값으로 반환합니다.
 * @param value 원본 문자열
 * @param fallback 대체 문자열
 * @returns 공백이 제거된 문자열 또는 대체 문자열
 */
const getReadableText = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

interface LightboxProps {
  lightboxState: LightboxState;
  items: CarouselItem[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  options?: LightboxOptions;
}

/**
 * Lightbox 모달을 렌더링하여 선택된 캐러셀 아이템을 전체 화면으로 표시합니다.
 * @param props lightbox 상태와 아이템, 닫기 및 네비게이션 핸들러, 옵션
 * @returns 선택된 아이템이 존재하면 포털로 렌더링된 라이트박스, 그렇지 않으면 null
 */
export function Lightbox({ lightboxState, items, onClose, onNavigate, options }: LightboxProps) {
  const { isOpen, selectedIndex, sourceRect } = lightboxState;
  const [isClosing, setIsClosing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const animationDuration = options?.animationDuration ?? LIGHTBOX_CONSTANTS.ANIMATION_DURATION;
  const backgroundBlur = options?.backgroundBlur ?? LIGHTBOX_CONSTANTS.BACKGROUND_BLUR;
  const containerPadding = LIGHTBOX_CONSTANTS.CONTAINER_PADDING;

  const currentItem = items[selectedIndex];
  const imageUrl = currentItem && 'image' in currentItem ? currentItem.image : null;

  const { handleClose: handleCloseAnimation } = useLightboxAnimation({
    isOpen,
    selectedIndex,
    sourceRect,
    imageRef,
    animationDuration,
  });

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    handleCloseAnimation(() => {
      setIsClosing(false);
      onClose();
    });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    containerRef.current?.focus();
  }, [isOpen]);

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleClose();
  };

  if (!isOpen || !imageUrl || !currentItem) return null;

  const backdropStyle = createBackdropStyle(backgroundBlur, animationDuration, isClosing);
  const fallbackAltText = getReadableText(
    currentItem.alt,
    `${FALLBACK_ALT_PREFIX} ${selectedIndex + 1}`
  );
  const dialogLabelTitle = getReadableText(currentItem.title, fallbackAltText);
  const dialogAriaLabel = `${FALLBACK_ALT_PREFIX} ${selectedIndex + 1}${ARIA_INDEX_SEPARATOR}${items.length}${ARIA_TITLE_SEPARATOR}${dialogLabelTitle}`;

  return createPortal(
    <div
      ref={containerRef}
      style={backdropStyle}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={dialogAriaLabel}
      tabIndex={-1}
    >
      <LightboxImage
        imageUrl={imageUrl}
        alt={fallbackAltText}
        imageRef={imageRef}
        containerPadding={containerPadding}
      />

      <CloseButton onClick={handleClose} animationDuration={animationDuration} />

      <LightboxNavigation onNavigate={onNavigate} animationDuration={animationDuration} />
    </div>,
    document.body
  );
}
