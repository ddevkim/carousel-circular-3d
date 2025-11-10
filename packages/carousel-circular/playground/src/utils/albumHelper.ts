import type { CarouselItem, LQIPInfo } from '@ddevkim/carousel-circular';

// Constants
const HOST = 'https://pub-7f7abe14948a4c78825b386f9eb1e70b.r2.dev';
const IMAGE_COUNT = 20;

export type AlbumName =
  | 'bali'
  | 'barbados'
  | 'borabora'
  | 'cadiz'
  | 'cannes'
  | 'hawaii'
  | 'ibiza'
  | 'mallorca'
  | 'santorini';

const ALBUMS: AlbumName[] = [
  'bali',
  'barbados',
  'borabora',
  'cadiz',
  'cannes',
  'hawaii',
  'ibiza',
  'mallorca',
  'santorini',
];

/**
 * LQIP 데이터 타입
 */
interface LQIPData {
  [key: string]: {
    base64: string;
    width: number;
    height: number;
  };
}

/**
 * LQIP 데이터 캐시
 */
const lqipCache: Map<AlbumName, LQIPData> = new Map();

/**
 * LQIP 데이터를 로드합니다.
 * @param album - Album name
 * @returns LQIP data or null if loading fails
 */
async function loadLQIPData(album: AlbumName): Promise<LQIPData | null> {
  // 캐시에 있으면 반환
  if (lqipCache.has(album)) {
    return lqipCache.get(album) ?? null;
  }

  try {
    const response = await fetch(`/${album}-lqip.json`);
    if (!response.ok) {
      return null;
    }
    const data: LQIPData = await response.json();
    lqipCache.set(album, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * LQIP 데이터에서 특정 이미지의 LQIP 정보를 추출합니다.
 * @param lqipData - LQIP data object
 * @param album - Album name
 * @param imageIndex - Image index (1-based)
 * @returns LQIPInfo or undefined
 */
function extractLQIPInfo(
  lqipData: LQIPData,
  album: AlbumName,
  imageIndex: number
): LQIPInfo | undefined {
  const key = `${album}/${imageIndex}-lqip.webp`;
  const entry = lqipData[key];

  if (!entry) {
    return undefined;
  }

  // base64에서 data:image/webp;base64, 부분 제거
  const base64 = entry.base64.replace(/^data:image\/webp;base64,/, '');

  return {
    base64,
    width: entry.width,
    height: entry.height,
  };
}

/**
 * Creates carousel items from an album.
 * Generates 20 items per album with images from the remote host.
 * LQIP 데이터가 있으면 자동으로 연결합니다.
 * @param album - Album name to load images from
 * @returns Promise<Array of carousel items with image URLs, LQIP, and metadata>
 */
export async function createAlbumItems(album: AlbumName): Promise<CarouselItem[]> {
  // LQIP 데이터 로드 (실패해도 계속 진행)
  const lqipData = await loadLQIPData(album);

  return Array.from({ length: IMAGE_COUNT }, (_, index) => {
    const imageIndex = index + 1;
    const capitalizedAlbum = album.charAt(0).toUpperCase() + album.slice(1);

    const item: CarouselItem = {
      id: imageIndex,
      image: `${HOST}/${album}/${imageIndex}.webp`,
      alt: `${capitalizedAlbum} ${imageIndex}`,
      title: `${capitalizedAlbum} ${imageIndex}`,
    };

    // LQIP 정보가 있으면 추가
    if (lqipData) {
      const lqipInfo = extractLQIPInfo(lqipData, album, imageIndex);
      if (lqipInfo) {
        return {
          ...item,
          lqip: lqipInfo,
        };
      }
    }

    return item;
  });
}

/**
 * Gets list of all available albums.
 * @returns Array of album names in order
 */
export function getAlbums(): AlbumName[] {
  return ALBUMS;
}
