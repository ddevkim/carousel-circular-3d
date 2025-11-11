# 📦 Changeset Workflow Guide

이 프로젝트는 **Changeset 기반의 모던 배포 워크플로우**를 사용합니다.

## 🔄 2가지 배포 패턴

### 📝 패턴 1: PR 마다 Changeset 기록 (권장)

**장점:**
- ✅ 모든 변경사항이 기록됨
- ✅ 누적된 변경사항으로 배포
- ✅ 자동 semver 결정
- ✅ 완벽한 CHANGELOG 자동 생성
- ✅ CI/CD 최적화

**흐름:**

```bash
# Step 1: PR 개발 중 - 새로운 변경사항 기록
pnpm release
  → 🚀 Choose release mode: (선택)
  → 📝 Add Changeset (PR workflow)  ← 선택

  → 📦 Select package
  → 🔄 Select version bump type
  → 📝 Describe your changes
  
  → ✅ Created: .changeset/blue-panda-123.md
  → 📋 Next steps:
     1. Review changeset file
     2. Commit: git add && git commit
     3. Push to remote and create PR

# Step 2: Git에 커밋
git add .changeset/blue-panda-123.md
git commit -m "chore: record changeset for PR"
git push origin feature/my-feature

# Step 3: PR 생성 & 승인 & Merge
```

**여러 PR 누적 시 상황:**
```
main 브랜치에:
.changeset/blue-panda-123.md     ← PR 1의 변경사항
.changeset/happy-tiger-456.md    ← PR 2의 변경사항
.changeset/quick-eagle-789.md    ← PR 3의 변경사항
```

---

### 🚀 패턴 2: 누적된 변경사항 한 번에 배포 (Release)

**특징:**
- 모든 PR의 changeset을 자동 종합
- Semver 자동 결정 (major 1개 = 1.0.0, minor 2개 = 0.2.0, patch 3개 = 0.0.3)
- CHANGELOG 자동 생성
- Git commit + tag 자동 생성
- NPM 배포

**흐름:**

```bash
# Step 1: 배포 준비
pnpm release
  → 🚀 Choose release mode: (선택)
  → 🚀 Publish Release (release workflow) ← 선택

  → 📌 Updating versions and generating CHANGELOG...
     pnpm changeset version 실행:
     1. 모든 .changeset/*.md 파일 수집
     2. Semver 자동 결정
     3. package.json 버전 업데이트
     4. CHANGELOG.md 생성/업데이트
     5. git commit (version bump)
     6. .changeset/*.md 파일 자동 삭제

  → 📤 Publishing to NPM...
     pnpm changeset publish 실행:
     1. NPM에 배포
     2. git tag 생성

  → ✅ Release completed successfully!
```

---

## 📋 Changeset 파일 형식

### 간단한 형식
```markdown
---
"@ddevkim/carousel-circular-3d": minor
---

✨ Added smooth lightbox animations
```

### 상세한 형식 (권장)
```markdown
---
"@ddevkim/carousel-circular-3d": minor
---

## ✨ New Features

- Added smooth fade/slide animations for lightbox transitions
- Implemented keyboard shortcuts (Arrow keys, ESC)
- Added touch gesture support for mobile

## 🚀 Performance Improvements

- Optimized animation rendering by 30%
- Reduced memory usage in drag interactions

## 🐛 Bug Fixes

- Fixed lightbox positioning on screens < 600px
- Resolved animation stutter on older devices
```

---

## 📊 자동 Semver 결정 로직

Changeset은 변경사항들을 분석해서 **자동으로 버전을 결정**합니다:

| 상황 | 결과 | 예시 |
|------|------|------|
| major 1개 이상 | 메이저 업 | 0.1.0 → 1.0.0 |
| minor 1개 이상 (major 없음) | 마이너 업 | 0.1.0 → 0.2.0 |
| patch만 있음 | 패치 업 | 0.1.0 → 0.1.1 |

**예시:**
```
PR1: changeset (patch)     ← 0.0.1
PR2: changeset (patch)     ← 0.0.1  
PR3: changeset (minor)     ← 최대값 선택
---
배포 시: 0.1.0 → 0.2.0 (minor 1개 = 마이너 업)
```

---

## 🔧 팀 가이드라인

### PR 단계
1. ✅ 코드 개발
2. ✅ `pnpm release` → "Add Changeset" 선택
3. ✅ 변경 타입 선택 (major/minor/patch)
4. ✅ 상세 설명 작성
5. ✅ `.changeset/[random-name].md` 생성 확인
6. ✅ Git 커밋 & Push
7. ✅ PR 생성

### Release 담당자
1. ✅ 모든 PR이 main에 merge 되었는지 확인
2. ✅ `pnpm release` → "Publish Release" 선택
3. ✅ 자동으로 배포 완료
4. ✅ CHANGELOG 확인
5. ✅ NPM에서 새 버전 확인

---

## 📌 파일 구조

```
.changeset/
├── config.json           ← 설정 (커밋됨)
├── README.md            ← 문서 (커밋됨)
├── blue-panda-123.md    ← PR 1의 changeset (커밋됨) ← git에 추적
├── happy-tiger-456.md   ← PR 2의 changeset (커밋됨) ← git에 추적
└── quick-eagle-789.md   ← PR 3의 changeset (커밋됨) ← git에 추적
```

**배포 후:**
```
.changeset/
├── config.json           ← 유지됨
├── README.md            ← 유지됨
└── (*.md 파일들 자동 삭제)
```

---

## 🔍 Changeset 확인하기

### 현재 대기 중인 changeset 확인
```bash
pnpm changeset status
```

### 배포될 버전 미리보기
```bash
cd packages/carousel-circular-3d
npm view @ddevkim/carousel-circular-3d versions
```

---

## 💡 Best Practices

1. **명확한 설명**: 의미 있는 변경사항 설명 작성
2. **이모지 활용**: ✨ 🚀 🐛 등으로 시작
3. **마크다운 형식**: 여러 항목은 리스트로 정리
4. **Batch 배포**: 여러 PR이 쌓인 후에 한 번에 배포
5. **Tag 확인**: Git tag로 버전 관리

---

## 🚨 주의사항

### ❌ 하지 말아야 할 것
```bash
# 잘못: PR 없이 직접 배포
git push → pnpm release → "Publish Release"

# 잘못: Changeset 파일을 직접 삭제
rm .changeset/blue-panda-123.md
```

### ✅ 올바른 방식
```bash
# 올바름: PR마다 changeset 기록
PR 1: pnpm release → "Add Changeset"
PR 2: pnpm release → "Add Changeset"
PR 3: pnpm release → "Add Changeset"
      ↓
배포 단계: pnpm release → "Publish Release"
```

---

## 📞 문제 해결

### Q: Changeset이 설치되지 않았다는 오류
```bash
pnpm add -D @changesets/cli
```

### Q: Changeset 파일을 실수로 삭제했을 때
```bash
git checkout .changeset/[filename].md
```

### Q: 버전이 잘못 선택된 것 같을 때
```bash
# 다시 한 번 changeset 추가
pnpm release → "Add Changeset"
# 이전 changeset과 함께 배포될 때 최대값으로 선택됨
```

---

**Happy Releasing! 🚀**

