import type { CarouselItem } from '@ddevkim/carousel-circular';
import { useEffect, useState } from 'react';
import { ExampleContainer } from '../components/ExampleContainer';
import type { AlbumName } from '../utils/albumHelper';
import { createAlbumItems } from '../utils/albumHelper';

interface AutoRotateExampleProps {
  album: AlbumName;
}

/**
 * AutoRotateExample component displaying carousel with auto-rotation and dynamic album selection.
 * @param album - Selected album name
 */
export function AutoRotateExample({ album }: AutoRotateExampleProps) {
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

  // 아이템이 로드되기 전에는 렌더링하지 않음
  // isLoading이 true면 LQIP JSON을 로드 중
  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <ExampleContainer
      title="Auto Rotate - Hover to Pause"
      description="Carousel rotates automatically. Move mouse over to pause, move away to resume after 2 seconds."
      carouselProps={{
        containerHeight: 450,
        items,
        geometry: {
          radius: 900,
          cameraAngle: 0, // Camera angle for depth perception (0-30deg)
          depthIntensity: 5, // Individual item Z-depth variation (0-3)
        },
        style: { className: 'carousel-container', itemClassName: 'carousel-item' },
        autoRotateConfig: { enabled: true, speed: 0.1, resumeDelay: 2000 },
      }}
    />
  );
}
