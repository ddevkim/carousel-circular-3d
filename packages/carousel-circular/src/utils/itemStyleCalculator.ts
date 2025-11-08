import type { CSSProperties } from 'react';
import type { ItemTransform } from '../types';
import { pxToRem } from './helpers';

/**
 * 아이템 스타일 계산 파라미터
 */
export interface ItemStyleParams {
  /** 아이템 너비 (px) */
  itemWidth: number;
  /** 아이템 높이 (px) */
  itemHeight: number;
  /** Transform 계산 결과 */
  transform: ItemTransform;
  /** 클릭 가능 여부 */
  isClickable: boolean;
}

/**
 * 아이템 기본 스타일을 계산한다.
 * @param params - 스타일 계산 파라미터
 * @returns CSS 스타일 객체
 */
export function calculateItemStyle(params: ItemStyleParams): CSSProperties {
  const { itemWidth, itemHeight, transform, isClickable } = params;

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `${-pxToRem(itemWidth) / 2}rem`,
    marginTop: `${-pxToRem(itemHeight) / 2}rem`,
    width: `${pxToRem(itemWidth)}rem`,
    height: `${pxToRem(itemHeight)}rem`,
    transform: transform.transform,
    opacity: transform.opacity,
    zIndex: transform.zIndex,
    willChange: 'transform, opacity',
    transition: 'opacity 0.3s linear',
    border: 'none',
    padding: 0,
    background: 'transparent',
    pointerEvents: isClickable ? 'auto' : 'none',
    userSelect: 'none',
  };
}
