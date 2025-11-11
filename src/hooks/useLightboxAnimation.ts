import { useCallback, useEffect, useRef } from 'react';
import { extractCarouselItemInfo } from '../utils/lightboxUtils';

const INITIAL_OPACITY = 0.2;

interface UseLightboxAnimationProps {
  isOpen: boolean;
  selectedIndex: number;
  sourceRect: DOMRect | null;
  imageRef: React.RefObject<HTMLImageElement>;
  animationDuration: number;
}

export function useLightboxAnimation({
  isOpen,
  selectedIndex,
  sourceRect,
  imageRef,
  animationDuration,
}: UseLightboxAnimationProps) {
  const isFirstOpenRef = useRef(true);
  const closeTargetRectRef = useRef<DOMRect | null>(null);

  // 진입 애니메이션
  useEffect(() => {
    if (isOpen && sourceRect && imageRef.current && isFirstOpenRef.current) {
      isFirstOpenRef.current = false;
      closeTargetRectRef.current = sourceRect;

      const image = imageRef.current;
      const carouselItem = document.querySelector(
        `[data-carousel-index="${selectedIndex}"]`
      ) as HTMLElement;

      const handleImageLoad = () => {
        const carouselInfo = extractCarouselItemInfo(carouselItem);

        if (!carouselInfo.imageRect) {
          image.style.opacity = String(INITIAL_OPACITY);
          requestAnimationFrame(() => {
            image.style.transition = `opacity ${animationDuration}ms ease-out`;
            image.style.opacity = '1';
          });
          return;
        }

        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        const imgRect = carouselInfo.imageRect;
        const imgCenterX = imgRect.left + imgRect.width / 2;
        const imgCenterY = imgRect.top + imgRect.height / 2;

        const translateX = imgCenterX - viewportCenterX;
        const translateY = imgCenterY - viewportCenterY;

        const scaleX = imgRect.width / image.naturalWidth;
        const scaleY = imgRect.height / image.naturalHeight;
        const scale = Math.min(scaleX, scaleY) * 2;

        requestAnimationFrame(() => {
          image.style.transition = 'none';
          image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          image.style.opacity = String(INITIAL_OPACITY);

          requestAnimationFrame(() => {
            image.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            image.style.transform = 'translate(0, 0) scale(1)';
            image.style.opacity = '1';
          });
        });
      };

      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener('load', handleImageLoad, { once: true });
      }
    }
  }, [isOpen, sourceRect, selectedIndex, animationDuration, imageRef]);

  // 닫기 애니메이션
  const handleClose = useCallback(
    (onClose: () => void) => {
      if (!imageRef.current) return;

      const image = imageRef.current;
      const carouselItem = document.querySelector(
        `[data-carousel-index="${selectedIndex}"]`
      ) as HTMLElement;

      if (carouselItem) {
        const carouselInfo = extractCarouselItemInfo(carouselItem);

        if (!carouselInfo.imageRect) {
          image.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          image.style.opacity = '0';
          image.style.transform = 'scale(0.9)';
        } else {
          const viewportCenterX = window.innerWidth / 2;
          const viewportCenterY = window.innerHeight / 2;

          const imgRect = carouselInfo.imageRect;
          const imgCenterX = imgRect.left + imgRect.width / 2;
          const imgCenterY = imgRect.top + imgRect.height / 2;

          const translateX = imgCenterX - viewportCenterX;
          const translateY = imgCenterY - viewportCenterY;

          const scaleX = imgRect.width / image.naturalWidth;
          const scaleY = imgRect.height / image.naturalHeight;
          const scale = Math.min(scaleX, scaleY);

          image.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
          image.style.opacity = String(INITIAL_OPACITY);
        }
      } else {
        image.style.transition = `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        image.style.opacity = '0';
        image.style.transform = 'scale(0.9)';
      }

      setTimeout(() => {
        onClose();
      }, animationDuration);
    },
    [selectedIndex, animationDuration, imageRef]
  );

  // 첫 오픈 플래그 리셋
  useEffect(() => {
    if (!isOpen) {
      isFirstOpenRef.current = true;
    }
  }, [isOpen]);

  return { handleClose };
}
