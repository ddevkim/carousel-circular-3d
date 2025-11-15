import type { CarouselItem } from '@ddevkim/carousel-circular-3d';
import { useEffect, useState } from 'react';
import { ExampleContainer } from '../components/ExampleContainer';
import type { AlbumName } from '../utils/albumHelper';
import { createAlbumItems } from '../utils/albumHelper';

interface BasicExampleProps {
  album: AlbumName;
}

/**
 * BasicExample component displaying carousel with dynamic album selection.
 * @param album - Selected album name
 */
export function BasicExample({ album }: BasicExampleProps) {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 앨범 변경 시 로딩 상태 표시
    setIsLoading(true);

    createAlbumItems(album).then((loadedItems) => {
      if (isMounted) {
        setItems(loadedItems);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [album]);

  const handleItemClick = (item: CarouselItem, index: number) => {
    console.log('Clicked item:', item, 'at index:', index);
    alert(`Clicked: ${item.title}`);
  };

  // 아이템이 로드되기 전에는 렌더링하지 않음
  // isLoading이 true면 LQIP JSON을 로드 중
  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <ExampleContainer
      title="Basic Usage - Image Carousel with Reflection"
      description="Basic circular carousel with image items and bottom reflection effect. Click items to interact. Configured with large radius (900px), depth effects, scale transitions, and natural reflection."
      carouselProps={{
        containerHeight: 400,
        items,
        style: { className: 'carousel-container', itemClassName: 'carousel-item' },
        geometry: {
          radius: 900,
          cameraAngle: 0, // Camera angle for depth perception (0-30deg)
          depthIntensity: 5, // Individual item Z-depth variation (0-3)
        },
        visualEffect: {
          minScale: 0.7,
          enableReflection: true, // Enable bottom reflection effect
        },
        onItemClick: handleItemClick,
      }}
    />
  );
}
