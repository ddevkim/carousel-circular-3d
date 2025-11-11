import type { ReactNode } from 'react';
import React from 'react';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';
import type { CarouselItem } from '../types';

/**
 * 아이템 콘텐츠를 렌더링한다.
 * content가 있으면 content를 우선 사용하고, 없으면 image를 사용한다.
 * LQIP가 제공된 경우 ProgressiveImage를 사용하여 부드러운 로딩 경험을 제공한다.
 * @param item - CarouselItem
 * @param index - 아이템 인덱스
 * @param skipLQIPIfCached - 스마트 로딩: 캐시된 이미지는 LQIP 건너뛰기 (기본: false)
 * @returns 렌더링된 콘텐츠 (ReactNode)
 */
export function renderItemContent(
  item: CarouselItem,
  index: number,
  skipLQIPIfCached = false
): ReactNode {
  if ('content' in item && item.content) {
    return item.content;
  }

  if ('image' in item && item.image) {
    const alt = item.alt ?? `Carousel item ${index + 1}`;

    // LQIP가 있는 경우 ProgressiveImage 사용
    if ('lqip' in item && item.lqip) {
      return React.createElement(ProgressiveImage, {
        src: item.image,
        lqip: item.lqip,
        alt,
        skipLQIPIfCached,
      });
    }

    // LQIP가 없는 경우 일반 img 태그 사용
    return React.createElement('img', {
      src: item.image,
      alt,
    });
  }

  return null;
}

/**
 * 아이템의 접근성 레이블을 반환한다.
 * @param item - CarouselItem
 * @param index - 아이템 인덱스
 * @returns 접근성 레이블 문자열
 */
export function getItemAriaLabel(item: CarouselItem, index: number): string {
  return item.alt ?? item.title ?? `Carousel item ${index + 1}`;
}
