# 지능형 칩 UI 구현 — 프롬프트 체크리스트

> **원본 프롬프트**: "호디의 지능형 칩 UI 구현"

## 1. Data Fetching

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| Supabase로 서랍 조회 | ✅ | `/api/drawers` |
| `is_default = true` 필터 | ✅ | 기본 페르소나 서랍만 우선 조회 |
| `user_id` = `NEXT_PUBLIC_HOARDY_DEV_USER_ID` (개발 시) | ✅ | 미로그인 시 env의 dev user로 조회 |
| 스켈레톤 / 로딩 UI | ✅ | `context-chips.tsx` — `loading` 시 4개 펄스 스켈레톤 |

## 2. UI Design (Tailwind CSS v4)

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 한 줄 메모 입력창 제거/최소화 | ✅ | 메모 입력 없음, URL만 |
| 가로 스크롤 칩 | ✅ | `overflow-x-auto` |
| 칩에 `icon`(이모지) + `name` | ✅ | `{d.icon \|\| DEFAULT_ICON} {d.name}` |
| 선택 시 하이라이트 (민트/핑크) | ✅ | `border-mint`, `bg-mint/20`, `shadow` |

## 3. State Management

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| `selectedDrawerId` 상태 | ✅ | `page.tsx` |
| 선택된 칩 재클릭 시 해제 | ✅ | `onSelect(selectedDrawerId === id ? null : id)` |

## 4. Form Submission

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 선택 시 `drawer_id` 함께 전송 | ✅ | `link-input.tsx` → `POST /api/links` |
| Fallback: 선택 없으면 AI 분류 | ✅ | `drawer_id` undefined 시 기존 로직 유지 |
| 저장 대상 테이블 | ⚠️ | 프롬프트: `archives` / 현재: `links` — 스키마에 따라 확인 필요 |

## 5. Hoardy Interaction

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 칩 클릭 시 호디 반응 | ✅ | `onDrawerInteraction` → `isInteracting` (scale) |
| '기대하는 표정' (입 벌림 등) | ✅ | `hasChipSelected` 시 `hungry` 상태 |
| 애니메이션 자연스러운 연결 | ✅ | 칩 선택 → hungry → 링크 제출 → eating → digesting → idle |

## 6. 컴포넌트 분리

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| `ContextChips.tsx` 분리 | ✅ | `components/context-chips.tsx` |

---

## 환경 변수

```
NEXT_PUBLIC_HOARDY_DEV_USER_ID=<개발용 유저 UUID>
```

- 설정 시: 미로그인 상태에서도 해당 유저의 `is_default` 서랍 조회
- 미설정 시: 로그인 유저의 서랍만 조회, 없으면 DEFAULT_DRAWERS 사용
