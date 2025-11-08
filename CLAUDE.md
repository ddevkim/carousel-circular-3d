# CLAUDE.md

AI 어시스턴트를 위한 프로젝트 컨텍스트 문서

## 프로젝트 개요

**@ddevkim/carousel-circular** - React 기반 3D 원형 캐러셀 컴포넌트 라이브러리

- TypeScript 기반의 모노레포 구조
- pnpm + Turbo로 구성된 워크스페이스
- Luxury한 3D 인터랙션과 세련된 애니메이션을 제공하는 프리미엄 UI 컴포넌트

---

## 프로젝트 구조

```
ddevkim/
├── packages/carousel-circular/     # 메인 라이브러리 패키지
│   ├── src/
│   │   ├── components/            # UI 컴포넌트
│   │   ├── hooks/                 # React 커스텀 훅
│   │   ├── utils/                 # 유틸리티 함수
│   │   ├── constants/             # 상수 정의
│   │   └── types.ts               # TypeScript 타입 정의
│   ├── playground/                # 개발 및 테스트 환경
│   └── documents/                 # 프로젝트 문서
├── documents/                     # 공통 코딩 표준
└── CLAUDE.md                      # 이 문서
```

---

## 기술 스택

### 핵심 기술
- **React**: 18+ (함수형 컴포넌트, Hooks)
- **TypeScript**: 5.9+ (strict mode)
- **pnpm**: 워크스페이스 관리
- **Turbo**: 모노레포 빌드 최적화
- **Biome**: 린트 + 포맷

### 빌드 & 배포
- **tsup**: 라이브러리 번들링 (ESM + CJS)
- **Vite**: 플레이그라운드 개발 서버
- **Changesets**: 버전 관리 및 릴리스

---

## 코딩 철학 및 원칙

### TypeScript 철학

**타입 안정성 최우선**
- Interface와 Type을 적재적소에 사용 (객체는 interface, Union/Intersection은 type)
- `any` 금지, `unknown` 활용
- Strict mode 필수
- Union Type으로 명확한 구분 (예: `CarouselItem = CarouselItemWithContent | CarouselItemWithImage`)
- JSDoc으로 모든 공개 API 문서화

**네이밍 일관성**
- Type/Interface: PascalCase
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- Boolean: `is`, `has`, `should` 접두사
- Props Interface: `ComponentNameProps`

### React 철학

**컴포지션과 격리**
- 함수형 컴포넌트만 사용
- 작고 집중된 책임
- 재사용 로직은 커스텀 훅으로 추출
- Composition > Inheritance

**성능 의식**
- 비용이 큰 계산만 메모이제이션
- 이벤트 핸들러는 useCallback
- 의존성 배열 정확히 관리
- GPU 가속 활용 (transform, will-change)

**접근성 필수**
- 시맨틱 HTML
- ARIA 속성
- 키보드 네비게이션
- 포커스 관리

### Clean Code 원칙

**가독성 > 간결함**
- 변수명/함수명으로 의도 명확히 표현
- 매직 넘버를 의미 있는 상수로
- 주석은 "왜"를 설명 ("무엇"은 코드로)
- 함수는 한 가지 일만 수행

**DRY와 추상화 균형**
- 반복 코드는 추출하되 과도한 추상화 지양
- 단일 진실 공급원 유지
- 캡슐화로 구현 세부사항 숨김

**지속적 개선**
- 보이스카우트 규칙: 발견한 코드를 더 깨끗하게
- 기술 부채 조기 해결
- 작고 집중된 커밋

---

## Luxury Design System 원칙

### 설계 철학

**프리미엄 경험의 4대 요소**
1. **Smooth & Subtle**: 부드럽고 자연스러운 움직임
2. **Depth & Dimension**: 3D 공간감과 깊이
3. **Responsive & Fluid**: 즉각적인 피드백
4. **Elegant & Minimal**: 시각적 노이즈 최소화

### 애니메이션 원칙

**물리 기반 움직임**
- Easing 함수로 자연스러운 가속/감속 (easeOutCubic, easeInOutCubic)
- 적절한 타이밍 (회전: 800ms, 라이트박스: 500ms)
- requestAnimationFrame 기반 구현 (60fps 목표)

**인터랙션 피드백**
- 드래그 시 즉각적 반응
- 물리 기반 관성 효과
- 호버/포커스 상태 명확히 표현

### 3D 공간 디자인

**원근감 설정**
- Perspective: radius의 3.33배 (균형있는 깊이감)
- Camera Angle: 8-15도 추천 (공간감 + 가독성)
- Depth Intensity: 1.0-2.0 (미묘한 Z축 깊이)

**시각 효과**
- Opacity/Scale 그라데이션으로 거리감 표현
- Z-Index 자동 계산으로 자연스러운 레이어링
- Transform 기반 (GPU 가속)

### 성능 최우선

**GPU 가속 활용**
- `will-change: transform, opacity`
- `backfaceVisibility: hidden`
- Transform 사용 (reflow 회피)

**최적화 전략**
- 애니메이션 프레임 정리 (중복 실행 방지)
- Passive event listener (터치 성능)
- 의존성 배열 최소화
- 메모리 누수 방지 (RAF cleanup)

---

## 3D Transform 핵심 개념

### 구조 이해

**3단계 레이어**
1. **Perspective 컨테이너**: 원근감 설정
2. **회전 컨테이너**: 전체 원형 구조를 한 번에 회전 (`transformStyle: preserve-3d`)
3. **개별 아이템**: 원형 배치 (`rotateY() + translateZ()`)

**왜 이 구조인가?**
- 컨테이너 회전 방식으로 성능 최적화 (개별 계산 불필요)
- CSS가 3D 수학 자동 처리
- GPU 가속 활용

### 핵심 원리

**원형 배치**
- `rotateY(각도) + translateZ(반지름)` 조합
- 수학적으로 원의 방정식과 동일 (x = r×sin(α), z = r×cos(α))

**회전 메커니즘**
- 컨테이너 전체 회전으로 모든 아이템 동시 이동
- 개별 아이템은 상대적 위치 유지
- 드래그 거리를 원의 둘레 기준으로 회전 각도 변환

---

## 성능 최적화 철학

### 목표
- 데스크톱: 60fps 유지
- 모바일: 55fps 이상 목표
- 터치 응답: 16ms 이하

### 핵심 전략

**애니메이션 관리**
- RAF(requestAnimationFrame) ID 엄격히 관리
- 이전 애니메이션 완전 취소 후 새 애니메이션 시작
- 모든 종료 경로에서 상태 초기화

**CSS 최적화**
- Transform/Opacity만 애니메이션 (reflow 회피)
- will-change로 GPU 레이어 분리 (과용 금지)
- Passive listener로 터치 성능 개선

**계산 최적화**
- 불필요한 분기 제거 (Math.abs 활용)
- 의존성 배열 최소화
- 비용 큰 계산만 메모이제이션

---

## 프로젝트별 참고 문서

### 코딩 표준 (documents/)
- `typescript.mdc`: TypeScript 베스트 프랙티스
- `react.mdc`: React 패턴 및 훅 사용법
- `clean-code.mdc`: Clean Code 원칙
- `tailwind.mdc`: Tailwind CSS 가이드 (해당시)

### 프로젝트 문서 (packages/carousel-circular/)
- `documents/PROJECT.mdc`: 프로젝트 상세 스펙 및 구현 가이드
- `3D_TRANSFORM_EXPLANATION.md`: 3D Transform 동작 원리 상세 설명
- `PERFORMANCE_OPTIMIZATION.md`: 성능 최적화 전체 가이드
- `OPTIMIZATION_SUMMARY.md`: 적용된 최적화 요약

### 사용 참고
- 구체적인 구현 방법은 위 문서들 참조
- API 스펙은 `types.ts` 및 `README.md` 확인
- 예제는 `playground/` 폴더 참조

---

## 개발 워크플로우

### 스크립트
```bash
pnpm dev              # 패키지 선택 후 개발 모드
pnpm build            # 전체 빌드
pnpm lint             # 린트 검사
pnpm lint:fix         # 자동 수정
pnpm type-check       # 타입 체크
pnpm changeset:add    # 변경사항 기록
pnpm release          # 패키지 릴리스
```

### 개발 플로우
1. 기능 개발 (playground에서 테스트)
2. 타입 체크 및 린트
3. 빌드 확인
4. Changeset 추가
5. PR 생성 및 머지
6. 자동 배포 (Changesets)

---

## 작업 시 지침

### 새로운 기능 추가

**사전 확인**
- TypeScript 타입 정의 먼저 작성
- 기본값 상수 정의 (constants/)
- JSDoc 주석 작성

**구현**
- 로직은 hook으로 분리
- 유틸리티 함수는 순수 함수로
- 성능 고려 (메모이제이션, RAF)

**검증**
- Playground 예제 작성
- 타입 체크 통과
- 린트 통과
- README 업데이트

### UI/애니메이션 수정

**확인 사항**
- Easing 함수 적용 여부
- 애니메이션 타이밍 적절성
- GPU 가속 확인 (will-change, transform)
- 모바일 터치 테스트
- 키보드 접근성

### 성능 최적화

**체크 포인트**
- useMemo/useCallback 적절성
- 불필요한 리렌더링 확인
- Transform 사용 여부 (reflow 회피)
- RAF 사용 및 cleanup
- 메모리 누수 방지

---

## 핵심 설계 결정

### 아키텍처
- **Monorepo**: 라이브러리와 playground 분리
- **Hooks 기반**: 로직과 UI 분리
- **Constants 집중**: 모든 상수는 constants/ 폴더에
- **타입 우선**: types.ts에서 모든 타입 관리

### API 설계
- **최소 강제**: 필수 3D transform만 인라인, 나머지는 className
- **Union Type**: content/image 배타적 정의
- **기본값 제공**: 모든 optional prop에 합리적 기본값
- **px 입력, rem 변환**: 사용자는 px로 입력, 내부는 rem 사용

### 성능 철학
- **물리 기반**: 드래그는 원의 둘레 기준 회전 변환
- **GPU 우선**: Transform/Opacity만 애니메이션
- **RAF 기반**: 모든 애니메이션은 requestAnimationFrame
- **Cleanup 필수**: 모든 이벤트 리스너 및 RAF 정리

---

## 문제 해결 가이드

### 빌드 문제
- 캐시 삭제 후 재빌드 (`pnpm clean && pnpm build`)
- 의존성 재설치 확인

### 타입 에러
- VSCode TypeScript 서버 재시작
- tsconfig.json 설정 확인

### 성능 이슈
- Chrome DevTools Performance 프로파일링
- Long Tasks (50ms 이상) 확인
- 메모리 누수 확인 (RAF cleanup)

### 애니메이션 문제
- RAF ID 정리 여부 확인
- 이전 애니메이션 취소 로직 확인
- 의존성 배열 확인

---

## 성공 지표

### 기술적 목표
- TypeScript strict mode 100%
- Tree-shaking 지원 (ESM)
- 번들 크기 < 50KB (gzipped)
- 60fps 유지 (데스크톱), 55fps 이상 (모바일)

### 사용성 목표
- 직관적 API (5분 내 통합 가능)
- 명확한 문서화
- 최소 스타일 강제
- 접근성 준수

---

## Git 상태

**현재 브랜치**: main

**최근 커밋**
- feat: add 3D circular carousel component with lightbox functionality and extensive documentation
- feat: carousel

**상태**: clean

---

**마지막 업데이트**: 2025-11-08
