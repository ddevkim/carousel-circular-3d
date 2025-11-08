import type { ReactNode } from 'react';
import React from 'react';
import type { CarouselItem } from '../types';

/**
 * 아이템 콘텐츠를 렌더링한다.
 * content가 있으면 content를 우선 사용하고, 없으면 image를 사용한다.
 * @param item - CarouselItem
 * @param index - 아이템 인덱스
 * @returns 렌더링된 콘텐츠 (ReactNode)
 */
export function renderItemContent(item: CarouselItem, index: number): ReactNode {
  if ('content' in item && item.content) {
    return item.content;
  }

  if ('image' in item && item.image) {
    return React.createElement('img', {
      src: item.image,
      alt: item.alt ?? `Carousel item ${index + 1}`,
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
