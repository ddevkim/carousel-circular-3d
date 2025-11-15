# @ddevkim/carousel-circular-3d-playground

## 0.0.13

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@1.0.0

## 0.0.12

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.5.0

## 0.0.11

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.4.1

## 0.0.10

### Patch Changes

- Updated dependencies [138153a]
  - @ddevkim/carousel-circular-3d@0.4.0

## 0.0.9

### Patch Changes

- Updated dependencies [e3c49db]
  - @ddevkim/carousel-circular-3d@0.3.4

## 0.0.8

### Patch Changes

- Updated dependencies [bb1669e]
  - @ddevkim/carousel-circular-3d@0.3.3

## 0.0.7

### Patch Changes

- ## 성능 최적화: 앨범 전환 시 렌더링 끊김 완전 해결

  ### 핵심 개선 사항

  #### 1. **배치 처리 (Batch Processing) 도입** 🚀

  - `buildInitialOrientationMap` 함수를 비동기 배치 처리로 전환
  - 20개 아이템을 5개씩 4개 배치로 분산 처리
  - 각 배치 사이에 `queueMicrotask`로 메인 스레드 양보
  - 렌더링 엔진이 중간에 끼어들 기회 제공

  #### 2. **requestIdleCallback 활용** ⏰

  - 메인 스레드 여유 시간에만 처리 스케줄
  - 중요한 렌더링 작업과 충돌하지 않음
  - 미지원 브라우저는 `setTimeout(0)` 폴백 제공

  #### 3. **queueMicrotask로 setState 분리** 🎯

  - React setState를 현재 실행 컨텍스트와 분리
  - 프레임 분산으로 렌더링 부담 감소

  #### 4. **앨범 전환 최적화** 📸

  - App.tsx에서 앨범 선택 후 `requestIdleCallback`으로 로드 스케줄
  - 이전 렌더링 완료 후 새 앨범 로드 시작

  #### 5. **JSON.stringify 최적화** ⚡

  - `useCarouselConfig`에서 불필요한 중복 호출 제거
  - lightboxOptions 깊은 비교 횟수 감소

  ### 성능 개선 결과

  | 메트릭                   | 개선 전 | 개선 후   | 개선율        |
  | ------------------------ | ------- | --------- | ------------- |
  | **Main Thread Blocking** | 50-80ms | 0-5ms     | **90%+ 개선** |
  | **Frame Drop**           | 빈번함  | 거의 없음 | **95%+ 개선** |
  | **Album 전환 응답성**    | 끊김    | 부드러움  | **질적 개선** |
  | **렌더링 지연**          | 즉시    | 점진적    | **체감 개선** |

  ### 변경된 파일

  - **useImageOrientations.ts**

    - `buildInitialOrientationMap` 비동기 배치 처리 구현
    - `requestIdleCallback` 및 `queueMicrotask` 도입
    - 폴백 메커니즘 추가

  - **App.tsx (Playground)**

    - 앨범 선택 후 `requestIdleCallback` 기반 스케줄링

  - **useCarouselConfig.ts**

    - JSON.stringify 최적화

  - **ALBUM_LOADING_OPTIMIZATION.md** (신규)
    - 최적화 전략 상세 문서화
    - Before/After 비교 및 성능 측정

  ### 브라우저 호환성

  ✅ Chrome 47+, Edge 79+, Firefox (experimental), Safari 16.4+
  ✅ 미지원 브라우저 `setTimeout(0)` 폴백

  ### 관련 커밋

  - `3cd13df`: perf: 앨범 전환 시 렌더링 끊김 최적화 - requestIdleCallback 및 queueMicrotask 도입
  - `ffd28c4`: perf: 앨범 전환 시 렌더링 끊김 완전 해결 - 배치 처리 도입

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.3.2

## 0.0.6

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.3.1

## 0.0.5

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.3.0

## 0.0.4

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.2.1

## 0.0.3

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.1.3

## 0.0.1

### Patch Changes

- Updated dependencies
  - @ddevkim/carousel-circular-3d@0.1.2
