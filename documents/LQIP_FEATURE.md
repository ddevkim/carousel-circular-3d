# LQIP (Low Quality Image Placeholder) Feature

## 개요

LQIP (Low Quality Image Placeholder) 기능은 사용자에게 프리미엄 이미지 로딩 경험을 제공하기 위한 기능입니다. 원본 이미지가 로드되기 전에 매우 작은 크기의 blur 처리된 placeholder를 먼저 보여주고, 원본 이미지가 로드되면 부드럽게 fade-in하여 전환합니다.

## 주요 특징

### 1. 즉시 렌더링
- LQIP가 제공되면 이미지 다운로드를 기다릴 필요 없이 즉시 캐러셀을 렌더링합니다
- LQIP의 width/height 정보로 즉시 orientation을 계산하여 레이아웃이 결정됩니다
- "Loading images..." 메시지 없이 바로 캐러셀이 표시됩니다

### 2. 부드러운 전환
- Base64로 인코딩된 LQIP 이미지를 20px blur 처리하여 표시
- 원본 이미지가 로드되면 500ms cubic-bezier easing으로 fade-in
- GPU 가속을 활용한 부드러운 애니메이션 (filter, opacity, transform)

### 3. 후방 호환성
- LQIP가 제공되지 않는 경우 기존 방식대로 동작
- 점진적 향상 (Progressive Enhancement) 전략 적용

## API 사용법

### 타입 정의

```typescript
interface LQIPInfo {
  /** LQIP 이미지의 base64 인코딩 문자열 */
  base64: string;
  /** LQIP 이미지의 원본 너비 (px) */
  width: number;
  /** LQIP 이미지의 원본 높이 (px) */
  height: number;
}

interface CarouselItemWithImage {
  id: string | number;
  image: string;
  lqip?: LQIPInfo;  // 선택적
  alt?: string;
  title?: string;
}
```

### 기본 사용 예제

```typescript
import { CarouselCircular } from '@ddevkim/carousel-circular-3d';
import type { CarouselItemWithImage } from '@ddevkim/carousel-circular-3d';

const items: CarouselItemWithImage[] = [
  {
    id: 1,
    image: '/images/photo1.jpg',
    lqip: {
      base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A...',
      width: 4000,
      height: 3000,
    },
    alt: 'Beautiful landscape',
  },
  {
    id: 2,
    image: '/images/photo2.jpg',
    lqip: {
      base64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd...',
      width: 3000,
      height: 4000,
    },
    alt: 'Portrait photo',
  },
];

function App() {
  return <CarouselCircular items={items} />;
}
```

### LQIP 없이 사용 (기존 방식)

```typescript
const items: CarouselItemWithImage[] = [
  {
    id: 1,
    image: '/images/photo1.jpg',
    alt: 'Beautiful landscape',
    // lqip 없음 - 이미지를 먼저 로드하여 orientation 결정
  },
];
```

## LQIP 생성 방법

프로젝트의 `scripts/generate-lqip.sh` 스크립트를 사용하여 LQIP를 생성할 수 있습니다.

### 설치 요구사항

```bash
# ImageMagick 설치 (macOS)
brew install imagemagick

# ImageMagick 설치 (Ubuntu/Debian)
sudo apt-get install imagemagick

# ImageMagick 설치 (Windows)
# https://imagemagick.org/script/download.php
```

### 단일 이미지 생성

```bash
# 로컬 파일
./scripts/generate-lqip.sh /path/to/image.jpg

# URL에서 다운로드
./scripts/generate-lqip.sh https://example.com/image.jpg

# 커스텀 출력 폴더 지정
./scripts/generate-lqip.sh /path/to/image.jpg products
```

### 배치 생성

```bash
# 폴더 내 모든 이미지 처리
./scripts/generate-lqip-batch.sh /path/to/images

# 특정 확장자만 처리
./scripts/generate-lqip-batch.sh /path/to/images jpg,png
```

### 생성된 LQIP 사용하기

1. LQIP 이미지를 base64로 인코딩:

```bash
base64 -i scripts/outputs/lqip/image-lqip.webp
```

2. width/height 정보 확인:

```bash
identify scripts/outputs/lqip/image-lqip.webp
# 출력: image-lqip.webp WEBP 20x15 20x15+0+0 8-bit sRGB 234B 0.000u 0:00.000
# width: 20, height: 15
```

3. 데이터를 CarouselItem에 적용:

```typescript
{
  id: 1,
  image: '/images/photo.jpg',
  lqip: {
    base64: 'UklGRh4EAABXRUJQVlA4TBIEAAAv...',
    width: 4000,  // 원본 이미지 width
    height: 3000, // 원본 이미지 height
  },
}
```

## 구현 세부사항

### 1. 타입 시스템

`types.ts`:
- `LQIPInfo` 인터페이스 추가
- `CarouselItemWithImage`에 `lqip?: LQIPInfo` 추가
- 타입 안전성 보장

### 2. Orientation 계산

`hooks/useImageOrientations.ts`:
- LQIP가 있는 경우: width/height로 즉시 orientation 계산
- LQIP가 없는 경우: 이미지를 로드하여 orientation 계산
- 혼합 가능: 일부 아이템만 LQIP 제공 가능

```typescript
// LQIP 있는 경우 - 즉시 계산
const aspectRatio = lqip.width / lqip.height;
const orientation = determineOrientation(aspectRatio);

// LQIP 없는 경우 - 이미지 로드 후 계산
const img = new Image();
img.onload = () => {
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  const orientation = determineOrientation(aspectRatio);
};
```

### 3. Progressive Image 컴포넌트

`components/ui/ProgressiveImage.tsx`:
- LQIP를 먼저 표시 (blur 20px, scale 1.05, opacity 0.95)
- 원본 이미지 백그라운드 로드
- **최소 300ms LQIP 표시**: 캐시된 이미지도 부드러운 전환 보장
- 로드 완료 시 luxury한 전환 (600ms cubic-bezier)
- GPU 가속 활용 (filter, opacity, transform)

```typescript
// 최소 LQIP 표시 시간 (300ms) - luxury한 전환을 위해
const minDisplayTime = 300;
const startTime = Date.now();

img.onload = () => {
  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

  // 최소 시간이 지나지 않았으면 대기 후 전환
  setTimeout(() => {
    setCurrentSrc(src);
    setIsLoaded(true);
  }, remainingTime);
};

const style = {
  filter: lqip && !isLoaded ? 'blur(20px)' : 'none',
  transform: lqip && !isLoaded ? 'scale(1.05)' : 'scale(1)',
  opacity: lqip && !isLoaded ? 0.95 : 1,
  transition: 'filter 0.6s cubic-bezier(0.4, 0, 0.2, 1), ...',
};
```

### 4. 렌더링 플로우

```
[LQIP 있는 경우 - Luxury UX]
1. 컴포넌트 마운트
2. LQIP로부터 즉시 orientation 계산
3. 캐러셀 레이아웃 계산 및 렌더링 (blur 처리된 LQIP 표시)
4. 백그라운드에서 원본 이미지 로드
5. 최소 300ms LQIP 표시 (캐시된 이미지도 부드러운 전환)
6. 600ms luxury fade-in으로 원본 이미지 교체

[앨범 전환 시 - Luxury UX]
1. 새 앨범 선택
2. 상태 초기화 → LQIP로 리셋
3. 새 앨범 LQIP 즉시 표시 (blur)
4. 원본 이미지 백그라운드 로드
5. 최소 300ms 후 부드러운 전환
→ 갑작스러운 변화가 아닌 점진적 품질 향상

[LQIP 없는 경우 - 기존 방식]
1. 컴포넌트 마운트
2. "Loading images..." 표시
3. 모든 이미지를 로드하여 orientation 결정
4. 캐러셀 레이아웃 계산 및 렌더링
```

## 성능 최적화

### LQIP 파일 크기
- 기본 설정: 20px width, 30% quality, WebP 포맷
- 평균 파일 크기: 200-500 bytes
- Base64 인코딩 후: ~300-700 bytes (JavaScript에 인라인 포함)

### 렌더링 성능
- First Paint: LQIP 덕분에 즉시 렌더링
- GPU 가속: transform, filter, opacity만 애니메이션
- 메모리: 원본 이미지 로드 전까지 낮은 메모리 사용

### 네트워크 트래픽
- Base64 인라인: 별도 HTTP 요청 불필요
- 병렬 로딩: 원본 이미지들은 백그라운드에서 병렬로 로드
- Progressive Enhancement: LQIP 없어도 정상 동작

### 이미지 다운로드 최적화
**중복 다운로드 방지:**

LQIP가 **있는** 경우:
- ✅ `useImageOrientations`: LQIP 차원으로 즉시 계산, 이미지 다운로드 안 함
- ✅ `ProgressiveImage`: 원본 이미지 다운로드 (표시용)
- **결과: 원본 이미지 1번만 다운로드**

LQIP가 **없는** 경우:
- ✅ `useImageOrientations`: orientation 계산을 위해 이미지 다운로드 (1번)
- ✅ `<img>` 렌더링: 브라우저 캐시에서 가져옴 (네트워크 요청 없음)
- **결과: 원본 이미지 1번만 다운로드 (브라우저 캐싱 활용)**

**브라우저 캐싱:**
- `new Image()`로 로드한 이미지는 브라우저 캐시에 저장됨
- 이후 `<img src="...">`에서 같은 URL 사용 시 캐시에서 즉시 로드
- 네트워크 탭에서 `(memory cache)` 또는 `(disk cache)` 확인 가능

## 베스트 프랙티스

### 1. LQIP 크기
- 20px width 권장 (기본값)
- 너무 크면 파일 크기 증가
- 너무 작으면 blur 효과가 부자연스러움

### 2. Base64 인라인
- 작은 이미지(< 1KB)만 인라인 권장
- LQIP는 평균 300-700 bytes로 적합

### 3. 원본 이미지 크기
- 원본 이미지는 적절히 최적화 (WebP, 압축)
- Lazy loading과 병행 사용 권장

### 4. 접근성
- LQIP 사용 시에도 반드시 `alt` 속성 제공
- 스크린 리더 사용자를 위한 명확한 설명

## 트러블슈팅

### LQIP가 흐릿하게 보이지 않아요
- `blur(20px)` 값이 적용되고 있는지 확인
- 브라우저 DevTools에서 CSS 검사

### 원본 이미지로 전환이 안 돼요
- 브라우저 콘솔에서 이미지 로드 에러 확인
- CORS 문제 확인 (다른 도메인 이미지)
- Network 탭에서 이미지 다운로드 상태 확인

### Base64가 너무 커요
- LQIP 이미지 크기 확인 (20px width 권장)
- Quality 설정 낮추기 (기본 30%)
- WebP 포맷 사용 (JPEG보다 작음)

## 향후 개선 사항

- [ ] 자동 LQIP 생성 플러그인 (build time)
- [ ] BlurHash 지원 추가
- [ ] 다양한 blur 스타일 옵션
- [ ] 로딩 상태 커스터마이징 API

## 참고 자료

- [LQIP Technique](https://www.guypo.com/introducing-lqip-low-quality-image-placeholders)
- [Progressive Image Loading](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)
- [ImageMagick Documentation](https://imagemagick.org/index.php)
