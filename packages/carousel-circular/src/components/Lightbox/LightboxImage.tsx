import type { CSSProperties } from 'react';
import { createImageContainerStyle, createImageStyle } from './styles';
import { LIGHTBOX_CONSTANTS } from '../../constants';

interface LightboxImageProps {
  imageUrl: string;
  alt: string;
  imageRef: React.RefObject<HTMLImageElement>;
  containerPadding: number;
}

export function LightboxImage({ imageUrl, alt, imageRef, containerPadding }: LightboxImageProps) {
  const imageContainerStyle = createImageContainerStyle(containerPadding);
  const imageStyle = createImageStyle();

  return (
    <div style={imageContainerStyle} role="presentation">
      <img
        ref={imageRef}
        src={imageUrl}
        alt={alt}
        style={imageStyle}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}

