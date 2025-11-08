import type { CarouselItem } from '@ddevkim/carousel-circular';

// Constants
const HOST = 'https://pub-3b9d4c1163534b129a1bbc0a31c701e4.r2.dev';
const IMAGE_COUNT = 20;

export type AlbumName = 'city' | 'desert' | 'nature' | 'ocean' | 'studio' | 'yacht';

const ALBUMS: AlbumName[] = ['city', 'desert', 'nature', 'ocean', 'studio', 'yacht'];

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
      image: `${HOST}/albums/${album}/${imageIndex}.webp`,
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

