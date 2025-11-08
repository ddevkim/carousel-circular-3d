import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LIGHTBOX_CONSTANTS } from '../../constants';
import { useLightboxAnimation } from '../../hooks/useLightboxAnimation';
import type { CarouselItem, LightboxOptions, LightboxState } from '../../types';
import { CloseButton } from '../ui';
import { LightboxImage } from './LightboxImage';
import { LightboxNavigation } from './LightboxNavigation';
import { createBackdropStyle } from './styles';

interface LightboxProps {
  lightboxState: LightboxState;
  items: CarouselItem[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  options?: LightboxOptions;
}

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

  if (!isOpen || !imageUrl || !currentItem) return null;

  const backdropStyle = createBackdropStyle(backgroundBlur, animationDuration, isClosing);

  return createPortal(
    <div
      ref={containerRef}
      style={backdropStyle}
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden="true"
    >
      <LightboxImage
        imageUrl={imageUrl}
        alt={currentItem.alt || `Image ${selectedIndex + 1}`}
        imageRef={imageRef}
        containerPadding={containerPadding}
      />

      <CloseButton onClick={handleClose} animationDuration={animationDuration} />

      <LightboxNavigation onNavigate={onNavigate} animationDuration={animationDuration} />
    </div>,
    document.body
  );
}

