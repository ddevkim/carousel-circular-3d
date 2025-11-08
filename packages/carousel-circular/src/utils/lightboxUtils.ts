/**
 * Carousel 아이템의 이미지 정보 추출
 * @param carouselItem - carousel 아이템 요소
 * @returns imageRect
 */
export function extractCarouselItemInfo(carouselItem: HTMLElement | null) {
  if (!carouselItem) {
    return { imageRect: null };
  }

  const imgElement = carouselItem.querySelector('img');
  return {
    imageRect: imgElement ? imgElement.getBoundingClientRect() : null,
  };
}

