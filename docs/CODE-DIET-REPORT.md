# 호디(HOARDY) 코드 다이어트 중간 보고서

> **작업 기간**: 2026년 2월  
> **원칙**: KISS, DRY, "돌멩이 치우기" 방식의 단계적 리팩토링

---

## Executive Summary

5단계에 걸쳐 불필요한 복잡성 제거, 중복 로직 통합, 상태 관리 단순화, 의존성 정리 등 **코드 다이어트**를 수행하였다. 전 과정에서 기존 기능 동작을 유지하며, 가독성과 유지보수성을 향상시켰다.

| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| 서랍 상수 정의 위치 | 2곳 (중복) | 1곳 (lib/constants.ts) | DRY |
| drawers API DB 호출 | 2회 | 1회 | 50% 감소 |
| app 폴더 깊이 | app/(main)/ | app/ | 1단계 감소 |
| page.tsx useState 개수 | 6개 | 4개 | 33% 감소 |
| package.json 의존성 | 10개 + 미명시 zod | 8개 + zod 명시 | 49 패키지 제거 |

---

## 1단계: 기초 체력 다지기 (상수 및 구조 정리)

### 1.1 상수 통합

**문제**: `DEMO_DRAWERS`(api)와 `FALLBACK_DRAWERS`(context-chips)가 동일한 4개 객체를 각각 정의.

**조치**:
- `lib/constants.ts` 신규 생성
- `Drawer` 타입 및 `DEFAULT_DRAWERS` 상수 통합
- `app/api/drawers/route.ts`, `components/context-chips.tsx`에서 import

**효과**: 서랍 기본값 수정 시 한 곳만 변경 (DRY 원칙).

### 1.2 (참고) 3단계에서 구조 단순화 수행

---

## 2단계: 소화 기관 최적화 (DB 및 API 쿼리)

### 2.1 Drawers API 쿼리 1단계 통합

**Before** (2회 DB 호출):
```ts
// 1) is_default=true만 먼저 조회
const { data: defaultData } = await supabase
  .from("drawers").select(...).eq("is_default", true)...

// 2) 없으면 전체 조회
const { data } = await supabase
  .from("drawers").select(...).eq("user_id", userId)...
```

**After** (1회 DB 호출):
```ts
const { data, error } = await supabase
  .from("drawers")
  .select("id, name, icon, instruction")
  .eq("user_id", userId)
  .order("is_default", { ascending: false })
  .order("created_at", { ascending: true });
```

**효과**: 네트워크 비용·응답 시간 절감, if-else 분기 제거.

### 2.2 Zod 명시화 (5단계에서 수행)

---

## 3단계: 불필요한 껍데기 제거 (구조 단순화)

### 3.1 app/(main) 레이아웃 제거

**문제**: `app/(main)/layout.tsx`가 `return <>{children}</>`만 반환하는 래퍼 역할만 수행.

**조치**:
- `app/(main)/page.tsx` → `app/page.tsx`로 이동
- `app/(main)/layout.tsx` 삭제
- `app/(main)/` 폴더 삭제

**효과**: 폴더 깊이 감소, "왜 여기에 레이아웃이 있지?"라는 인지적 부하 제거.

---

## 4단계: 상태 다이어트 (신경계 통합)

### 4.1 Toast 상태 통합

| Before | After |
|--------|-------|
| `toastVisible` (boolean) | `toast: { message, visible } \| null` |
| `toastMessage` (string) | (단일 객체로 통합) |

**효과**: 토스트 메시지와 표시 여부가 항상 함께 관리되어 불일치 상태 방지.

### 4.2 showLinkAnimation 제거

| Before | After |
|--------|-------|
| `showLinkAnimation` 상태 별도 관리 | `state === "eating"` 조건으로 직접 판단 |

**효과**: eating 상태와 링크 애니메이션 로직 일원화.

### 4.3 HoardyCharacter MOUTH_SCALES 맵 적용

**Before** (삼항 연쇄):
```ts
state === "eating" ? 0.2 : state === "hungry" ? 0.6 : 1
```

**After**:
```ts
const MOUTH_SCALES: Record<HoardyState, number> = {
  eating: 0.2, hungry: 0.6, idle: 1, digesting: 1, vomiting: 1,
};
// scale(MOUTH_SCALES[state] ?? 1)
```

**효과**: 가독성 향상, 상태별 값 추가·변경 용이.

### 4.4 LinkInput onEatingStart 제거

- 미사용 `onEatingStart` prop 및 호출 제거

### 4.5 상태 개수 요약

| 파일 | Before | After |
|------|--------|-------|
| app/page.tsx | 6개 | 4개 |
| components/hoardy-character.tsx | 2개 | 1개 |

---

## 5단계: 불필요한 짐 버리기 & 안전장치

### 5.1 미사용 패키지 제거

| 제거 패키지 | 용도 |
|-------------|------|
| @mozilla/readability | 웹페이지 본문 추출 |
| jsdom | HTML 파싱 |
| turndown | HTML→Markdown 변환 |
| @types/jsdom | jsdom 타입 정의 |

**효과**: 49개 패키지 제거, node_modules 용량·설치 시간 감소.

### 5.2 Zod 의존성 명시

- `app/api/links/route.ts`에서 사용 중인 `zod`를 `package.json`에 명시적 추가
- 버전: `^3.25.0`

**효과**: 의존성 관리 명확화, 향후 타입 검증 일관성 확보.

### 5.3 Final Stone Check

- 미사용 변수·함수·export: 없음
- 죽은 코드(Dead Code): 없음

---

## 파일별 변경 요약

| 파일/폴더 | 변경 유형 | 내용 |
|-----------|----------|------|
| lib/constants.ts | 신규 | Drawer 타입, DEFAULT_DRAWERS 상수 |
| app/api/drawers/route.ts | 수정 | DEFAULT_DRAWERS import, 쿼리 1회로 통합 |
| components/context-chips.tsx | 수정 | DEFAULT_DRAWERS import, FALLBACK_DRAWERS 제거 |
| app/page.tsx | 수정 | (main) → app 직속 이동, toast 통합, showLinkAnimation 제거 |
| app/(main)/ | 삭제 | layout.tsx, page.tsx, 폴더 전체 제거 |
| components/hoardy-character.tsx | 수정 | showLinkAnimation 제거, MOUTH_SCALES 맵 적용 |
| components/link-input.tsx | 수정 | onEatingStart 제거 |
| package.json | 수정 | 미사용 패키지 제거, zod 추가 |

---

## 체크리스트 (검증 완료 항목)

- [x] `npm run build` 성공
- [x] Lint 에러 없음
- [x] 기존 라우트 유지 (/, /api/links, /api/drawers, /api/health/gemini)
- [x] 링크 저장 플로우 동작 유지

---

## 향후 권장 사항 (미적용)

코드 리뷰에서 도출되었으나 이번 다이어트 범위에는 포함하지 않은 항목:

1. **ContextChips Server Component 전환**: 클라이언트 fetch 대신 page에서 직접 drawers 조회 후 props 전달
2. **links API auth 유틸 분리**: dev/userId 분기 로직을 `lib/supabase`로 이동
3. **AI 소화(digest) 구현 시**: readability, jsdom, turndown 패키지 재도입

---

*문서 작성일: 2026년 2월*
