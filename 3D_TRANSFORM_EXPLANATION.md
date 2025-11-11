# 3D Transform 동작 원리 설명

## 구조 분석

```tsx
<section style={{ perspective: '2000px' }}>  // (1) 원근감 설정
  <div style={{                               // (2) 회전 컨테이너
    transformStyle: 'preserve-3d',
    transform: `rotateY(${finalRotation}deg)`
  }}>
    <div style={{                             // (3) 개별 아이템
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `rotateY(${itemAngle}deg) translateZ(${radius}rem)`
    }}>
      이미지
    </div>
  </div>
</section>
```

## Q1. 왜 컨테이너에 `transform: rotateY()`를 적용하나요?

### 답변: **전체 원형 구조를 한 번에 회전**시키기 위해서입니다.

### 원리:

#### 방법 A: 컨테이너 회전 (현재 방식) ✅
```
초기 상태:
- Item 0: rotateY(0deg) translateZ(600px)   → 정면
- Item 1: rotateY(45deg) translateZ(600px)  → 오른쪽 45도
- Item 2: rotateY(90deg) translateZ(600px)  → 오른쪽 90도

컨테이너를 rotateY(45deg) 회전:
- Item 0: 0 + 45 = 45도  → 오른쪽으로 이동 ✅
- Item 1: 45 + 45 = 90도 → 오른쪽으로 이동 ✅
- Item 2: 90 + 45 = 135도 → 오른쪽으로 이동 ✅

결과: 모든 아이템이 함께 회전 (원형 구조 유지)
```

#### 방법 B: 아이템 개별 회전 (비효율적) ❌
```tsx
// 각 아이템마다 finalRotation을 더해야 함
transform: `rotateY(${itemAngle + finalRotation}deg) translateZ(...)`

문제점:
1. 매 프레임마다 모든 아이템의 transform 재계산 필요
2. 8개 아이템 × 60fps = 초당 480번 재계산
3. 성능 저하 및 코드 복잡도 증가
```

### 비유:

```
[회전목마 비유]

방법 A (컨테이너 회전):
- 회전목마 전체 플랫폼을 돌림
- 말들은 고정된 위치에 있음
- 효율적 ✅

방법 B (개별 회전):
- 각 말을 개별적으로 이동시킴
- 원형을 유지하려면 복잡한 계산 필요
- 비효율적 ❌
```

## Q2. 컨테이너의 역할은 무엇인가요?

### 답변: **3D 공간을 형성하고 아이템들을 그룹화**하는 역할입니다.

### 핵심 속성 분석:

#### 1. `transformStyle: 'preserve-3d'`
```
의미: "자식 요소들을 평면(2D)으로 펼치지 말고 3D 공간에 유지해라"

없으면:
┌─────────┐
│ 모든 아이템이 │  ← 평면에 겹쳐서 보임 (3D 효과 사라짐)
│ 겹쳐져 있음  │
└─────────┘

있으면:
    ┌───┐
  ┌───┐ │
┌───┐ │ │  ← 원형으로 배치됨 (3D 효과 유지)
│   │ │ │
└───┘ └───┘
```

#### 2. `transform: rotateY(${finalRotation}deg)`
```
의미: "3D 공간 전체를 Y축 기준으로 회전"

드래그 시:
- finalRotation: 0° → 45° → 90° ...
- 전체 원형 구조가 회전
- 개별 아이템은 상대적 위치 유지
```

#### 3. `width: '100%', height: '100%'`
```
의미: "부모(section)의 크기를 그대로 받음"

중요: 
- 컨테이너가 공간을 차지해야 이벤트 감지 가능
- section의 perspective가 올바르게 적용됨
```

#### 4. `position: 'relative'`
```
의미: "자식 아이템들(position: absolute)의 기준점"

결과:
- 아이템의 left: 50%, top: 50%가 컨테이너 중앙을 기준으로 계산됨
```

## Q3. 아이템의 transform은 왜 필요한가요?

### 답변: **원형 배치**를 만들기 위해서입니다.

### 아이템 transform 분해:

```tsx
transform: `rotateY(${itemAngle}deg) translateZ(${radius}rem) scale(${scale})`
```

#### 단계별 적용:

```
1단계: rotateY(itemAngle)
   원점에서 Y축 기준으로 회전
   
   Item 0: rotateY(0deg)     ↑ (정면)
   Item 1: rotateY(45deg)    ↗ (45도)
   Item 2: rotateY(90deg)    → (오른쪽)
   Item 3: rotateY(135deg)   ↘ (135도)
   Item 4: rotateY(180deg)   ↓ (뒷면)

2단계: translateZ(radius)
   회전된 방향으로 앞으로 이동
   
   결과: 원형 배치 완성!
   
        [1]
    [0]     [2]
        [3]

3단계: scale(scale)
   뒷면은 작게, 앞면은 크게
   → 원근감 강화
```

### 수학적 설명:

```
3D 좌표계에서:
- rotateY(α): Y축 기준 회전
- translateZ(r): Z축 방향 이동 (앞/뒤)

결합하면:
x = r × sin(α)
z = r × cos(α)
y = 0

→ 원의 방정식! (반지름 r의 원형)
```

## Q4. 왜 이렇게 복잡하게 구현하나요?

### 대안 방법들과 비교:

#### 대안 1: JavaScript로 x, y 좌표 직접 계산 ❌
```tsx
// 각 아이템마다
const x = radius * Math.sin(angle);
const y = radius * Math.cos(angle);
style={{ transform: `translate(${x}px, ${y}px)` }}

문제:
- 2D 평면 배치 (3D 효과 없음)
- 원근감 수동 계산 필요
- perspective 적용 불가
```

#### 대안 2: CSS Transform만 사용 (현재 방식) ✅
```tsx
// 컨테이너
transform: `rotateY(${finalRotation}deg)`

// 아이템
transform: `rotateY(${itemAngle}deg) translateZ(${radius}rem)`

장점:
- GPU 가속 (하드웨어 가속)
- 자동 원근감 계산
- 성능 최적화
- 코드 간결
```

## Q5. 실제 동작 예시

### 드래그 시나리오 (8개 아이템, radius=600px):

```
초기 상태 (finalRotation = 0°):
┌─────────────────────────────┐
│          Item 0 (정면)        │  ← 사용자가 보는 화면
│    Item 7     Item 1         │
│  Item 6         Item 2       │
│    Item 5     Item 3         │
│          Item 4              │
└─────────────────────────────┘

드래그 (finalRotation = 45°):
┌─────────────────────────────┐
│       Item 1 (정면으로)      │  ← 회전!
│    Item 0     Item 2         │
│  Item 7         Item 3       │
│    Item 6     Item 4         │
│          Item 5              │
└─────────────────────────────┘

컨테이너만 rotateY(45deg) 적용:
- Item 0: 0° → 45°
- Item 1: 45° → 90° (정면으로)
- Item 2: 90° → 135°
- ... (모두 45도씩 이동)
```

## 핵심 정리

### 컨테이너의 역할:
1. **3D 공간 형성** (`transformStyle: 'preserve-3d'`)
2. **전체 회전** (`transform: rotateY()`)
3. **아이템 기준점** (`position: relative`)
4. **크기 제공** (`width/height: 100%`)

### 아이템의 역할:
1. **원형 배치** (`rotateY() + translateZ()`)
2. **중앙 정렬** (`left/top: 50% + margin`)
3. **원근감** (`scale()`, `opacity`)

### 왜 이렇게 하나요?
- **성능**: GPU 가속, 최소 재계산
- **간결함**: CSS가 3D 수학 자동 처리
- **유지보수**: 명확한 구조 분리

이 구조는 **CSS 3D Transform의 표준 패턴**이며, 대부분의 3D 캐러셀이 이 방식을 사용합니다.

