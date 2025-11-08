import type { CarouselItem } from '@ddevkim/carousel-circular';
import type { AlbumName } from '../utils/albumHelper';
import { createAlbumItems } from '../utils/albumHelper';
import { ExampleContainer } from '../components/ExampleContainer';

interface BasicExampleProps {
  album: AlbumName;
}

/**
 * BasicExample component displaying carousel with dynamic album selection.
 * @param album - Selected album name
 */
export function BasicExample({ album }: BasicExampleProps) {
  const items = createAlbumItems(album);

  const handleItemClick = (item: CarouselItem, index: number) => {
    console.log('Clicked item:', item, 'at index:', index);
    alert(`Clicked: ${item.title}`);
  };

  return (
    <ExampleContainer
      title="Basic Usage - Image Carousel"
      carouselProps={{
        items,
        style: { className: 'carousel-container', itemClassName: 'carousel-item' },
        geometry: { 
          radius: 900,
          cameraAngle: 0,        // Camera angle for depth perception (0-30deg)
          depthIntensity: 5,    // Individual item Z-depth variation (0-3)
        },
        visualEffect: { scaleRange: [0.5, 1] },
        onItemClick: handleItemClick,
      }}
    />
  );
}
