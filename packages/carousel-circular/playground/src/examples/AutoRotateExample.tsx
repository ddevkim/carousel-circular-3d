import type { AlbumName } from '../utils/albumHelper';
import { createAlbumItems } from '../utils/albumHelper';
import { ExampleContainer } from '../components/ExampleContainer';

interface AutoRotateExampleProps {
  album: AlbumName;
}

/**
 * AutoRotateExample component displaying carousel with auto-rotation and dynamic album selection.
 * @param album - Selected album name
 */
export function AutoRotateExample({ album }: AutoRotateExampleProps) {
  const items = createAlbumItems(album);

  return (
    <ExampleContainer
      title="Auto Rotate - Hover to Pause"
      description="Carousel rotates automatically. Move mouse over to pause, move away to resume after 2 seconds."
      carouselProps={{
        items,
        geometry: { 
          radius: 900,
          cameraAngle: 0,        // Camera angle for depth perception (0-30deg)
          depthIntensity: 5,    // Individual item Z-depth variation (0-3)
        },
        style: { className: 'carousel-container', itemClassName: 'carousel-item' },
        autoRotateConfig: { enabled: true, speed: 0.1, resumeDelay: 2000 },
      }}
    />
  );
}
