# 호디(Hoardy) 개발 전개 최종 보고서

> 작성일: 2026-02-20
> 버전: v0.1.0
> 스택: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Google Gemini AI

---

## 1. 프로젝트 개요

**호디(Hoardy)** 는 'Hoarding(축적)'에서 이름을 딴 AI 기반 지식 관리 서비스입니다.
사용자가 URL을 던지면 호디가 메타데이터를 추출하고, AI로 요약·분류하여
"읽지 않은 북마크"를 "정제된 지식 자산"으로 변환합니다.

### 핵심 철학

| 키워드 | 설명 |
|--------|------|
| **Second Brain** | 기억은 호디가, 사용자는 생각과 연결에 집중 |
| **Private Anthropology** | 수집 궤적을 통해 자신의 관심사와 성장을 객관적으로 관찰 |
| **Zero Social Policy** | 공유 기능 없음. 오직 '미래의 나'를 위한 솔직한 지식 창고 |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
│  │ LinkInput│ │ HoardyChar│ │ ArchiveDashboard  │    │
│  │ (URL입력) │ │ (마스코트) │ │ (검색/필터/리스트) │    │
│  └────┬─────┘ └──────────┘ └───────┬───────────┘    │
│       │                            │                 │
└───────┼────────────────────────────┼─────────────────┘
        │ POST /api/links            │ GET /api/archives
        ▼                            ▼
┌─────────────────── Next.js API Routes ───────────────┐
│                                                       │
│  /api/links ──→ Supabase INSERT ──→ digestLink()     │
│                                      │                │
│  /api/archives ──→ Supabase SELECT   │                │
│  /api/drawers  ──→ Supabase SELECT   │                │
│  /api/scraper  ──→ Cheerio 파싱       │                │
│  /api/stats/weekly ──→ 7일 집계       ▼                │
│                              ┌──────────────┐        │
│                              │ extractMeta  │        │
│                              │ (Cheerio)    │        │
│                              └──────┬───────┘        │
│                                     ▼                │
│                              ┌──────────────┐        │
│                              │ Gemini AI    │        │
│                              │ 요약·분류     │        │
│                              └──────┬───────┘        │
│                                     ▼                │
│                              Supabase UPDATE         │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────── Supabase ─────────────────────────┐
│  Auth (Google/Kakao OAuth)                            │
│  DB: archives, drawers, profiles                      │
│  RLS: user_id 기반 행 수준 보안                         │
└───────────────────────────────────────────────────────┘
```

---

## 3. 디렉토리 구조

```
HOARDY/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (SEO 메타데이터, Geist 폰트)
│   ├── page.tsx                # 메인 대시보드 (인증, 링크입력, 아카이브)
│   ├── globals.css             # 테마 변수, 커스텀 애니메이션
│   ├── not-found.tsx           # 404 페이지
│   ├── about/
│   │   └── page.tsx            # 서비스 소개 페이지 (5개 섹션)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth 콜백 핸들러
│   └── api/
│       ├── links/route.ts      # POST: 링크 저장 + AI 소화 트리거
│       ├── archives/
│       │   ├── route.ts        # GET: 아카이브 목록 조회
│       │   └── [id]/route.ts   # DELETE: 아카이브 삭제
│       ├── drawers/route.ts    # GET: 서랍 목록 (자동 초기화 포함)
│       ├── scraper/route.ts    # POST: URL 메타데이터 스크래핑
│       ├── stats/
│       │   └── weekly/route.ts # GET: 주간 통계 (서랍별 집계)
│       └── health/
│           └── gemini/route.ts # GET: Gemini API 헬스 체크
│
├── components/
│   ├── app-header.tsx          # 상단 헤더 (로고, 프로필 드롭다운)
│   ├── archive-dashboard.tsx   # 아카이브 대시보드 (검색, 필터, 리스트, 위클리 리포트)
│   ├── archive-modal.tsx       # 아카이브 상세 모달 (삭제 기능 포함)
│   ├── archives-list.tsx       # 아카이브 카드 그리드
│   ├── auth-login.tsx          # OAuth 로그인 버튼 (Google, Kakao)
│   ├── context-chips.tsx       # 서랍 선택 칩 UI
│   ├── hoardy-character.tsx    # 마스코트 캐릭터 (5가지 상태 애니메이션)
│   ├── link-input.tsx          # URL 입력 폼 (실시간 미리보기, 서랍 선택)
│   ├── speech-bubble.tsx       # 호디 말풍선 (페이즈 기반 애니메이션)
│   ├── toast.tsx               # 토스트 알림 (현재 미사용, 말풍선으로 대체)
│   └── weekly-report.tsx       # 주간 인류학 리포트 UI
│
├── lib/
│   ├── auth.ts                 # OAuth 로그인/로그아웃 함수
│   ├── constants.ts            # 기본 서랍 정의 (일반, 학습, 업무, 관심사)
│   ├── digest.ts               # AI 소화 파이프라인 (메타추출 → Gemini 분석 → DB 업데이트)
│   ├── extract.ts              # Cheerio 기반 메타데이터 추출기
│   ├── gemini.ts               # Gemini AI 클라이언트 래퍼
│   ├── reportMessages.ts       # 페르소나 기반 주간 리포트 멘트
│   ├── utils/
│   │   └── date.ts             # KST 날짜 포맷 유틸리티
│   └── supabase/
│       ├── client.ts           # 브라우저용 Supabase 클라이언트
│       └── server.ts           # 서버용 Supabase 클라이언트 (쿠키/서비스 역할)
│
├── middleware.ts               # Supabase 세션 리프레시 미들웨어
├── next.config.ts              # 이미지 도메인 허용 설정
├── package.json                # 의존성 및 스크립트 정의
├── tsconfig.json               # TypeScript 설정
│
├── supabase/migrations/        # DB 마이그레이션 파일
├── scripts/                    # 유틸리티 스크립트 (Gemini 성공률 체크)
├── docs/                       # 프로젝트 문서
└── public/
    ├── hoardy_assets/          # 캐릭터 이미지 (5상태 × 3버전)
    └── images/                 # 로고 (컬러, 화이트)
```

---

## 4. 핵심 기능 상세

### 4.1 인증 시스템

| 항목 | 내용 |
|------|------|
| **제공자** | Google OAuth, Kakao OAuth |
| **세션 관리** | `@supabase/ssr` 쿠키 기반 SSR 인증 |
| **미들웨어** | `middleware.ts`에서 매 요청마다 세션 리프레시 |
| **콜백** | `/auth/callback`에서 코드 교환 → 프로필 동기화 → 기본 서랍 초기화 |
| **개발 모드** | `NEXT_PUBLIC_HOARDY_DEV=true` 설정 시 인증 우회 |

**인증 흐름:**
```
사용자 → Google/Kakao 로그인 버튼 클릭
  → Supabase OAuth 리다이렉트
  → /auth/callback (코드 교환, 프로필 upsert, 서랍 초기화)
  → /?welcome=1 (메인 페이지, 환영 말풍선)
```

### 4.2 AI 소화 파이프라인 (Digest Pipeline)

링크 저장 시 비동기로 실행되는 3단계 프로세스:

**Stage 1 — 메타데이터 추출** (`lib/extract.ts`)
- Cheerio 기반 HTML 파싱
- Open Graph, Twitter Card, 기본 meta 태그 순서로 탐색
- 파비콘: `apple-touch-icon` → `icon` → `shortcut icon` → Google Favicon API 폴백
- 브라우저 User-Agent 헤더로 봇 차단 우회

**Stage 2 — AI 분석** (`lib/digest.ts`)
- Google Gemini 2.5 Flash 모델 사용
- 메타데이터 + 사용자 서랍 목록을 프롬프트에 포함
- AI가 제목 정제, 3줄 가치 요약, 서랍 분류를 JSON으로 반환
- 서랍 UUID 유효성 검증 (AI 환각 방지)

**Stage 3 — DB 업데이트**
- AI 결과를 `archives` 테이블에 반영
- 실패 시 `extraction_status: "failed"` + 기본 서랍 폴백

```
URL 입력 → INSERT (status: pending)
         → extractMetadata() → Cheerio 파싱
         → analyzeWithGemini() → AI 요약/분류
         → UPDATE (title, summary, site_name, favicon_url, drawer_id, status: success)
```

### 4.3 실시간 URL 미리보기

`LinkInput` 컴포넌트에서 URL 입력 시 디바운스(700ms) 적용 후 `/api/scraper` 호출.
`AbortController`로 이전 요청 자동 취소. 스켈레톤 UI → 미리보기 카드 트랜지션.

### 4.4 주간 인류학 리포트

| 구성요소 | 설명 |
|----------|------|
| **API** | `/api/stats/weekly` — 최근 7일 데이터를 서랍별로 집계 |
| **멘트 엔진** | `lib/reportMessages.ts` — 4가지 페르소나 기반 랜덤 멘트 |
| **UI** | `weekly-report.tsx` — 카운팅 애니메이션, 비율 바, 멘트 카드 |

**페르소나 매핑:**

| 서랍 | 페르소나 | 톤앤매너 |
|------|----------|----------|
| 학습 | ANTHROPOLOGIST | 데이터 인류학, 인간 중심 분석 |
| 관심사 | OBSERVER / ARTIST | 철학적 관찰, 예술적 세렌디피티 |
| 업무 | HUSTLER | 데이터 허슬러, 비즈니스 치열함 |

### 4.5 아카이브 관리

- **검색**: 제목, 요약, 사이트명 대상 클라이언트 사이드 실시간 필터링
- **서랍 필터**: 칩 UI로 서랍별 필터링 (미분류 포함)
- **상세 모달**: 카드 클릭 시 전문 보기, 원문 링크, 삭제 기능
- **삭제**: `confirm()` 확인 → `DELETE /api/archives/[id]` → 옵티미스틱 UI 업데이트
- **CSV 내보내기**: BOM 포함 UTF-8 CSV 다운로드 (한글 인코딩 보장)

### 4.6 마스코트 시스템

`HoardyCharacter` 컴포넌트가 5가지 상태에 따라 캐릭터 이미지를 전환:

| 상태 | 트리거 | 시각 효과 |
|------|--------|-----------|
| `idle` | 기본 상태 | 민트색 은은한 글로우 |
| `eating` | 링크 제출 직후 | 링크 아이콘 드롭 애니메이션 |
| `digesting` | 소화 진행 중 | 상태 전환 애니메이션 |
| `hungry` | 서랍 칩 선택 시 | 기대하는 표정 |
| `vomiting` | 오류 발생 시 | 실패 피드백 |

**말풍선** (`SpeechBubble`): 페이즈 기반 (`enter` → `visible` → `exit` → `hidden`) 애니메이션으로 호디 위에 표시. `z-50`으로 헤더 위에 노출.

---

## 5. 데이터 모델

### Supabase Tables

```
archives
├── id: uuid (PK)
├── user_id: uuid (FK → auth.users)
├── url: text
├── title: text
├── summary: text
├── site_name: text
├── favicon_url: text
├── drawer_id: uuid (FK → drawers, nullable)
├── extraction_status: text (pending/success/failed)
└── created_at: timestamptz

drawers
├── id: uuid (PK)
├── user_id: uuid (FK → auth.users)
├── name: text
├── icon: text
├── instruction: text
├── is_default: boolean
├── created_at: timestamptz
└── UNIQUE(user_id, name)

profiles
├── id: uuid (PK, FK → auth.users)
├── email: text
├── nickname: text
└── avatar_url: text
```

---

## 6. UI/UX 디자인 시스템

### 컬러 팔레트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--background` | `#0a0a0a` | 전역 배경 |
| `--foreground` | `#ededed` | 기본 텍스트 |
| `--color-mint` | `#98ff98` | 포인트 컬러, CTA, 강조 |
| `--color-mint-dim` | `#6dd96d` | 민트 변형 |
| `--color-pink` | `#ff69b4` | 보조 포인트 |

### 커스텀 애니메이션

| 이름 | 용도 | 동작 |
|------|------|------|
| `link-drop` | 링크 저장 시 아이콘 드롭 | 위→아래 이동 + 페이드아웃 (600ms) |
| `bounce-slow` | 말풍선 부유 효과 | 상하 4px 진동 (2s 반복) |

### 타이포그래피

- **산세리프**: Geist Sans (--font-geist-sans)
- **모노스페이스**: Geist Mono (--font-geist-mono)

---

## 7. 페이지 구성

| 경로 | 타입 | 설명 |
|------|------|------|
| `/` | Client Component | 메인 대시보드 (인증, 입력, 아카이브, 리포트) |
| `/about` | Server Component | 서비스 소개 (Hero, About, Second Brain, Anthropology, Zero Social) |
| `/auth/callback` | Route Handler | OAuth 콜백 처리 |
| `404` | Server Component | 커스텀 404 페이지 |

---

## 8. API 엔드포인트 목록

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/archives` | 아카이브 목록 (최근 50건) | 필수 |
| DELETE | `/api/archives/[id]` | 아카이브 삭제 | 필수 (소유자 검증) |
| POST | `/api/links` | 링크 저장 + AI 소화 | 필수 |
| GET | `/api/drawers` | 서랍 목록 | 필수 |
| POST | `/api/scraper` | URL 메타데이터 추출 | 없음 |
| GET | `/api/stats/weekly` | 주간 통계 | 필수 |
| GET | `/api/health/gemini` | Gemini API 상태 | 없음 |
| GET | `/auth/callback` | OAuth 콜백 | Supabase 내부 |

---

## 9. 의존성

### 프로덕션

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | 16.1.6 | 프레임워크 |
| `react` / `react-dom` | 19.2.3 | UI 라이브러리 |
| `@supabase/supabase-js` | ^2.97.0 | Supabase 클라이언트 |
| `@supabase/ssr` | ^0.8.0 | Supabase SSR 쿠키 관리 |
| `@google/generative-ai` | ^0.24.1 | Gemini AI SDK |
| `cheerio` | ^1.2.0 | HTML 파싱 (메타데이터 추출) |
| `zod` | ^3.25.0 | 입력 유효성 검사 |

### 개발

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `tailwindcss` | ^4 | CSS 프레임워크 |
| `typescript` | ^5 | 타입 시스템 |
| `eslint` | ^9 | 코드 린팅 |
| `tsx` | ^4 | 스크립트 실행 |

---

## 10. 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Y | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Y | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Y | RLS 우회용 서비스 역할 키 |
| `GEMINI_API_KEY` | Y | Google Gemini API 키 |
| `GEMINI_MODEL` | N | AI 모델명 (기본: gemini-2.5-flash) |
| `NEXT_PUBLIC_HOARDY_DEV` | N | 개발 모드 플래그 (운영: 미설정) |
| `NEXT_PUBLIC_HOARDY_DEV_USER_ID` | N | 개발용 유저 ID (운영: 미설정) |
| `TZ` | N | 서버 시간대 (권장: Asia/Seoul) |

---

## 11. SEO & 메타데이터

```
Title: Hoardy | 나를 연구하는 작은 인류학
Description: 흩어진 지식을 소화하여 자산으로 만드는 당신의 세컨드 브레인.
OG Image: /hoardy_assets/hoardy_idle.png
Twitter Card: summary
Locale: ko_KR
```

About 페이지는 별도 메타데이터로 오버라이드:
```
Title: About | Hoardy
Description: 지식은 쌓아둘 때가 아니라, 필요할 때 바로 꺼낼 수 있을 때 비로소 내 것이 됩니다.
```

---

## 12. 배포 체크리스트

- [x] `.gitignore`에 `.env*` 패턴 등록 (시크릿 커밋 방지)
- [x] `next.config.ts` 이미지 도메인 허용 (Google 프로필, 파비콘)
- [x] `middleware.ts` 세션 리프레시 설정
- [x] SEO 메타데이터 (OG, Twitter Card) 설정
- [x] About 페이지 구현
- [x] 404 페이지 구현
- [ ] Vercel 환경 변수 등록
- [ ] Supabase Redirect URLs에 운영 도메인 추가
- [ ] `NEXT_PUBLIC_HOARDY_DEV` 미설정 확인 (운영)

---

## 13. 개발 이력 요약

| 단계 | 구현 내용 |
|------|-----------|
| **Foundation** | Next.js 16 프로젝트 세팅, Supabase 연동, OAuth 인증 |
| **Core Feature** | 링크 저장 API, AI 소화 파이프라인 (Cheerio + Gemini) |
| **UI/UX** | 마스코트 캐릭터 시스템, 다크 테마, 반응형 레이아웃 |
| **Dashboard** | 아카이브 검색/필터, 서랍 칩, 상세 모달 |
| **Preview** | 실시간 URL 미리보기 (디바운스 + AbortController) |
| **Interaction** | 말풍선 UI (토스트 → 캐릭터 반응 멘트로 전환) |
| **Analytics** | 주간 인류학 리포트 (서랍별 집계 + 페르소나 멘트) |
| **Export** | CSV 내보내기 (BOM UTF-8 한글 인코딩) |
| **About** | 서비스 철학 소개 페이지 (5개 섹션) |
| **Deploy Prep** | SEO 메타데이터, 이미지 도메인, 환경 변수 정리 |

---

## 14. 통계

| 항목 | 수치 |
|------|------|
| API 라우트 | 8개 |
| 컴포넌트 | 11개 |
| 라이브러리 모듈 | 9개 |
| 페이지 | 4개 (메인, About, 콜백, 404) |
| DB 테이블 | 3개 (archives, drawers, profiles) |
| 마이그레이션 | 2개 |
| 캐릭터 상태 | 5가지 |
| 페르소나 | 4가지 |
| 기본 서랍 | 4개 (일반, 학습, 업무, 관심사) |

---

*이 보고서는 호디 v0.1.0의 전체 개발 범위를 기록합니다.*
*호디는 당신의 지식을 소화하고 있습니다. 🦖*
