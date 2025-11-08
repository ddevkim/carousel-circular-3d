import { ExampleContainer } from '../components/ExampleContainer';
import type { AlbumName } from '../utils/albumHelper';
import { createAlbumItems } from '../utils/albumHelper';

interface LightboxExampleProps {
  album: AlbumName;
}

/**
 * Lightbox 기능 예제
 * 이미지 클릭 시 전체 화면 lightbox로 확대
 * @param album - Selected album name
 */
export function LightboxExample({ album }: LightboxExampleProps) {
  const items = createAlbumItems(album);

  return (
    <ExampleContainer
      title="Lightbox Example"
      description="Click on any image to view it in fullscreen lightbox. Use arrow keys or swipe to navigate between images."
      carouselProps={{
        items,
        enableLightboxWhenClick: true,
        lightboxOptions: {
          enableKeyboardNavigation: true,
          closeOnEsc: true,
        },
        style: {
          className: 'carousel-container',
          itemClassName: 'carousel-item',
        },
        geometry: {
          radius: 900,
          depthIntensity: 5,
        },
        itemSize: {
          width: 300,
          height: 400,
        },
        visualEffect: {
          opacityRange: [0.3, 1],
          scaleRange: [0.7, 1],
        },
      }}
    />
  );
}
