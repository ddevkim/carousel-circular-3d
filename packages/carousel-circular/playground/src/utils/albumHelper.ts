import type { CarouselItem } from '@ddevkim/carousel-circular';

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
 * Creates carousel items from an album.
 * Generates 20 items per album with images from the remote host.
 * @param album - Album name to load images from
 * @returns Array of carousel items with image URLs and metadata
 */
export function createAlbumItems(album: AlbumName): CarouselItem[] {
  return Array.from({ length: IMAGE_COUNT }, (_, index) => {
    const imageIndex = index + 1;
    const capitalizedAlbum = album.charAt(0).toUpperCase() + album.slice(1);
    return {
      id: imageIndex,
      image: `${HOST}/${album}/${imageIndex}.webp`,
      alt: `${capitalizedAlbum} ${imageIndex}`,
      title: `${capitalizedAlbum} ${imageIndex}`,
    };
  });
}

/**
 * Gets list of all available albums.
 * @returns Array of album names in order
 */
export function getAlbums(): AlbumName[] {
  return ALBUMS;
}
