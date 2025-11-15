import type { CarouselItem } from '@ddevkim/carousel-circular-3d';
import { useEffect, useState } from 'react';
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
      title="Lightbox Example"
      description="Click on any image to view it in fullscreen lightbox. Use arrow keys or swipe to navigate between images."
      carouselProps={{
        containerHeight: 450,
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
        visualEffect: {
          opacityRange: [0.3, 1],
          minScale: 0.7,
        },
      }}
    />
  );
}
