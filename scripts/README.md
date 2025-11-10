# LQIP Generator Scripts

ImageMagick을 사용하여 LQIP (Low Quality Image Placeholder)를 생성하고, base64 인코딩된 metadata.json을 자동 생성하는 스크립트입니다.

## 사전 요구사항

### 필수
- **ImageMagick**: 이미지 처리
- **curl**: URL에서 이미지 다운로드

```bash
# macOS
brew install imagemagick curl

# Ubuntu/Debian
sudo apt-get install imagemagick curl

# 설치 확인
magick -version  # 또는 convert -version
curl --version
```

### 선택 (권장)
- **jq**: JSON 포맷팅 (없어도 동작함)

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 스크립트

### 1. `generate-lqip.sh` - 단일 이미지 처리

로컬 파일 또는 URL에서 LQIP를 생성합니다.

**사용법:**
```bash
./scripts/generate-lqip.sh <image_path_or_url> [output_folder]
```

**예시:**
```bash
# 로컬 이미지
./scripts/generate-lqip.sh image.jpg

# 서브폴더의 이미지
./scripts/generate-lqip.sh folder/subfolder/image.png

# URL에서 이미지 다운로드 후 처리
./scripts/generate-lqip.sh https://example.com/hero.jpg

# URL + 커스텀 폴더 지정
./scripts/generate-lqip.sh https://example.com/product.jpg products
```

**출력:**
- 로컬 파일: `folder/subfolder/image.jpg` → `scripts/outputs/lqip/folder/subfolder/image-lqip.webp`
- URL: `https://example.com/hero.jpg` → `scripts/outputs/lqip/hero-lqip.webp`
- URL + 폴더: `https://example.com/product.jpg products` → `scripts/outputs/lqip/products/product-lqip.webp`

### 2. `generate-lqip-batch.sh` - 배치 처리 + metadata.json 생성

여러 이미지를 일괄 처리하고 base64 인코딩된 metadata.json을 생성합니다.

#### 모드 1: 디렉토리 모드

로컬 디렉토리의 모든 이미지를 처리합니다.

**사용법:**
```bash
./scripts/generate-lqip-batch.sh <directory_path>
```

**예시:**
```bash
./scripts/generate-lqip-batch.sh ./images
```

**출력:**
```
scripts/outputs/lqip/
├── images/
│   ├── hero-lqip.webp
│   └── products/
│       └── item-lqip.webp
└── metadata.json
```

#### 모드 2: API 모드 (URL 직접 지정)

외부 URL 목록을 폴더명과 함께 받아 처리합니다.

**사용법:**
```bash
./scripts/generate-lqip-batch.sh --folder <folder_name> --urls <url1> <url2> ...
```

**예시:**
```bash
./scripts/generate-lqip-batch.sh --folder products \
  --urls https://example.com/image1.jpg \
         https://example.com/image2.jpg \
         https://example.com/image3.jpg
```

**출력:**
```
scripts/outputs/lqip/
└── products/
    ├── image1-lqip.webp
    ├── image2-lqip.webp
    ├── image3-lqip.webp
    └── metadata.json
```

#### 모드 3: Stdin 모드

파일이나 파이프로부터 URL 목록을 읽어 처리합니다.

**사용법:**
```bash
cat urls.txt | ./scripts/generate-lqip-batch.sh --folder <folder_name> --stdin
echo -e "url1\nurl2" | ./scripts/generate-lqip-batch.sh --folder <folder_name> --stdin
```

**예시:**
```bash
# urls.txt 파일에서 읽기
cat urls.txt | ./scripts/generate-lqip-batch.sh --folder products --stdin

# 직접 입력
echo -e "https://example.com/1.jpg\nhttps://example.com/2.jpg" | \
  ./scripts/generate-lqip-batch.sh --folder products --stdin
```

**지원 포맷:**
- `.jpg`, `.jpeg`
- `.png`
- `.webp`

## LQIP 설정

`generate-lqip.sh` 파일에서 다음 설정을 조정할 수 있습니다:

```bash
LQIP_WIDTH=20        # LQIP 너비 (px)
LQIP_QUALITY=30      # 품질 (1-100)
BLUR_SIGMA=1         # 블러 강도
OUTPUT_FORMAT="webp" # 출력 포맷 (webp 권장)
```

### 권장 설정

| 목적 | WIDTH | QUALITY | BLUR | 파일 크기 |
|------|-------|---------|------|-----------|
| **최소 (기본)** | 20 | 30 | 1 | ~500B-1KB |
| **균형** | 32 | 40 | 0.8 | ~1-2KB |
| **선명** | 40 | 50 | 0.5 | ~2-3KB |

## 출력 구조

```
project/
├── images/
│   ├── hero.jpg
│   └── products/
│       └── item.png
└── scripts/
    └── outputs/
        └── lqip/
            └── images/
                ├── hero-lqip.webp
                └── products/
                    └── item-lqip.webp
```

- 1 depth subpath까지 폴더 구조 유지
- 파일명에 `-lqip` suffix 추가
- WebP 포맷 사용 (JPG 대비 25-35% 더 작음)
- 모든 LQIP는 `scripts/outputs/lqip/` 폴더에 생성

## metadata.json 구조

배치 처리 후 자동 생성되는 JSON 파일 구조:

```json
{
  "products/image1-lqip.webp": {
    "base64": "data:image/webp;base64,UklGRiQAAABXRUJQ...",
    "width": 20,
    "height": 13
  },
  "products/image2-lqip.webp": {
    "base64": "data:image/webp;base64,UklGRiQAAABXRUJQ...",
    "width": 20,
    "height": 15
  },
  "products/image3-lqip.webp": {
    "base64": "data:image/webp;base64,UklGRiQAAABXRUJQ...",
    "width": 20,
    "height": 27
  }
}
```

**각 엔트리 구조:**
- `base64`: 즉시 사용 가능한 data URI
- `width`: LQIP 이미지 너비 (px)
- `height`: LQIP 이미지 높이 (px)

**위치:** `scripts/outputs/lqip/products/metadata.json`

## React에서 사용하기

### 1. metadata.json 임포트

```typescript
// src/lqip-metadata.ts
import metadata from '../scripts/outputs/lqip/products/metadata.json';

export const lqipData: Record<string, string> = metadata;
```

### 2. LQIP 유틸리티 함수

```typescript
// src/utils/lqip.ts
import { lqipData } from '@/lqip-metadata';

export interface LQIPData {
  base64: string;
  width: number;
  height: number;
}

export function getLQIP(imagePath: string): LQIPData | undefined {
  // "products/hero.jpg" -> "products/hero-lqip.webp"
  const lqipPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '-lqip.webp');
  return lqipData[lqipPath];
}
```

### 3. 컴포넌트에서 사용

```typescript
import { useState } from 'react';
import { getLQIP } from '@/utils/lqip';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage = ({ src, alt, className }: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const lqipData = getLQIP(src);

  return (
    <div style={{ position: 'relative' }} className={className}>
      {/* LQIP - 즉시 렌더링 */}
      {lqipData && (
        <img
          src={lqipData.base64}
          alt={alt}
          width={lqipData.width}
          height={lqipData.height}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(10px)',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 500ms ease-out',
          }}
          aria-hidden="true"
        />
      )}

      {/* 고화질 이미지 */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 800ms ease-out',
        }}
      />
    </div>
  );
};
```

**장점:**
- `width`와 `height` 속성으로 **CLS (Cumulative Layout Shift) 0** 달성
- 브라우저가 이미지 공간을 사전 할당하여 레이아웃 시프트 방지
- 원본 이미지의 aspect ratio를 유지하면서 placeholder 표시

### 4. 사용 예시

```typescript
// App.tsx
<ProgressiveImage
  src="https://example.com/products/hero.jpg"
  alt="Product Hero"
  className="w-full h-96"
/>
```

**동작 흐름:**
1. 페이지 로드 시 LQIP가 즉시 렌더링 (네트워크 요청 없음, base64 inline)
2. 고화질 이미지가 백그라운드에서 로드
3. 로드 완료 시 부드럽게 전환 (800ms fade)

## 자동화 및 워크플로우

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "lqip": "bash scripts/generate-lqip.sh",
    "lqip:batch": "bash scripts/generate-lqip-batch.sh",
    "lqip:url": "bash scripts/generate-lqip.sh",
    "prebuild": "pnpm lqip:batch ./public/images"
  }
}
```

**사용:**
```bash
# 로컬 이미지
pnpm lqip images/hero.jpg

# URL 이미지
pnpm lqip:url https://example.com/hero.jpg products

# 디렉토리 일괄 처리
pnpm lqip:batch ./images

# API 모드로 URL 목록 처리
pnpm lqip:batch --folder products --urls \
  https://example.com/1.jpg \
  https://example.com/2.jpg
```

### CI/CD 통합 예시

```yaml
# .github/workflows/lqip.yml
name: Generate LQIP

on:
  push:
    paths:
      - 'public/images/**'

jobs:
  lqip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install ImageMagick
        run: sudo apt-get update && sudo apt-get install -y imagemagick

      - name: Generate LQIP
        run: |
          chmod +x scripts/generate-lqip-batch.sh
          ./scripts/generate-lqip-batch.sh ./public/images

      - name: Commit metadata.json
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add scripts/outputs/lqip/
          git commit -m "chore: update LQIP metadata" || exit 0
          git push
```

### API 서버 통합 예시 (Node.js)

```typescript
// api/generate-lqip.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function generateLQIPFromURLs(
  urls: string[],
  folderName: string
): Promise<{ success: boolean; metadataPath: string }> {
  // Create temporary file with URLs
  const urlList = urls.join('\n');

  // Execute script
  const { stdout, stderr } = await execAsync(
    `echo "${urlList}" | ./scripts/generate-lqip-batch.sh --folder ${folderName} --stdin`
  );

  console.log(stdout);

  return {
    success: true,
    metadataPath: `scripts/outputs/lqip/${folderName}/metadata.json`,
  };
}

// Express 예시
app.post('/api/lqip/generate', async (req, res) => {
  const { urls, folder } = req.body;

  try {
    const result = await generateLQIPFromURLs(urls, folder);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 최적화 및 성능

### 1. 파일 크기 최소화
- **WIDTH: 20px** - 충분히 작으면서도 색감 유지
- **QUALITY: 30** - 블러 처리되므로 낮은 품질도 OK
- **base64 inline** - HTTP 요청 0회, 즉시 렌더링
- **결과**: 평균 500B-1KB (2MB 이미지 → 1KB = 2000배 축소)

### 2. 시각적 품질
- **BLUR: 1** - 미묘한 블러로 픽셀 감춤
- **Transition: 800ms** - 부드러운 전환으로 Luxury 감성
- **색감 유지**: QUALITY 30이면 충분히 원본 느낌 유지

### 3. 성능 지표

| 항목 | 기존 방식 | LQIP 방식 |
|------|-----------|-----------|
| **초기 렌더링** | 빈 공간 또는 스켈레톤 | 즉시 이미지 표시 |
| **네트워크 요청** | 1회 (이미지) | 1회 (이미지, LQIP는 inline) |
| **LCP 개선** | - | ✅ 즉시 콘텐츠 표시 |
| **CLS 방지** | ❌ 레이아웃 시프트 발생 | ✅ 0 (고정 크기) |
| **사용자 체감** | 느림 | 매우 빠름 |

### 4. 실전 팁

**번들 크기 고려:**
- metadata.json이 커질 수 있음 (이미지 100개 = ~100KB)
- 필요한 것만 임포트하거나 코드 스플리팅 활용

**Dynamic Import:**
```typescript
// 필요할 때만 로드
const { lqipData } = await import('@/lqip-metadata');
```

**Tree Shaking:**
```typescript
// 특정 폴더만 임포트
import productLQIP from '../scripts/outputs/lqip/products/metadata.json';
import heroLQIP from '../scripts/outputs/lqip/hero/metadata.json';

export const lqipData = { ...productLQIP, ...heroLQIP };
```

### 5. WebP 지원 확인

WebP는 모던 브라우저에서 광범위하게 지원되지만, 폴백이 필요할 수 있습니다:

```typescript
// 브라우저 WebP 지원 확인
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 폴백 처리
export function getLQIP(imagePath: string): string | undefined {
  const format = supportsWebP() ? 'webp' : 'jpg';
  const lqipPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, `-lqip.${format}`);
  return lqipData[lqipPath];
}
```

**참고:** WebP 지원률은 95%+ (2024 기준)이므로 대부분의 경우 폴백 불필요

## 트러블슈팅

### ImageMagick 설치 확인
```bash
magick -version
# 또는
convert -version
```

### curl 설치 확인
```bash
curl --version
```

### 권한 에러
```bash
chmod +x scripts/generate-lqip.sh
chmod +x scripts/generate-lqip-batch.sh
```

### URL 다운로드 실패
- 네트워크 연결 확인
- URL이 공개적으로 접근 가능한지 확인
- CORS 제한 확인 (스크립트는 서버 사이드에서 실행)
- SSL 인증서 문제 시: `curl -k` 옵션 추가 (비권장)

### metadata.json이 생성되지 않음
- 최소 1개 이상의 이미지가 성공적으로 처리되어야 함
- 배치 스크립트 사용 여부 확인 (단일 스크립트는 metadata 생성 안 함)
- jq 설치 여부 확인 (선택사항이지만 권장)

### base64 데이터가 너무 큼
- LQIP WIDTH를 더 작게 설정 (10-15px)
- QUALITY를 더 낮게 설정 (20-25)
- 또는 이미지 개수를 줄여 메타데이터 분할

## 참고 자료

- [ImageMagick 공식 문서](https://imagemagick.org/)
- [LQIP 기법 설명](https://github.com/zouhir/lqip)
- [Progressive Image Loading](https://web.dev/patterns/web-vitals-patterns/placeholders/lqip)
