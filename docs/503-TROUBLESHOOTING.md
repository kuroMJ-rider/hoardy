# 503 에러 해결 체크리스트

## 1. 터미널 로그 확인 (가장 중요)

브라우저의 503 에러는 **결과**일 뿐. **원인**은 Cursor/VS Code 터미널에 찍힙니다.

- `/api/links` 요청 시 터미널에 `🔥 503 원인 - Supabase 연결 실패:` 로 시작하는 로그 확인
- `Error: ...` 빨간색 텍스트나 스택 트레이스 확인

---

## 2. 환경 변수 (.env.local)

### 필수 항목

| 변수명 | 용도 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명(공개) 키 |
| `NEXT_PUBLIC_HOARDY_DEV_USER_ID` | 개발용 테스트 유저 UUID (선택) |
| `GEMINI_API_KEY` | Google AI Studio API 키 |

**503의 대표 원인:** `NEXT_PUBLIC_SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 누락

Supabase 대시보드 → Project Settings → API에서 URL과 `anon` `public` 키를 복사하세요.

### .env.local 예시

```
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (개발용 - 401 우회)
NEXT_PUBLIC_HOARDY_DEV=true
NEXT_PUBLIC_HOARDY_DEV_USER_ID=<테스트 유저 UUID>
# Dev 모드 RLS 우회용 (Dashboard → API → service_role 키)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini (Google AI Studio)
GEMINI_API_KEY=AIzaSy...
```

---

## 3. 서버 재시작 (Fast Refresh 꼬임 대비)

환경 변수 수정 후에는 **반드시 서버 재시작**해야 적용됩니다.

```bash
# 터미널에서 Ctrl+C로 서버 중지 후
rm -rf .next
npm run dev
```

---

## 4. Gemini 모델명

- 현재 사용: `gemini-2.5-flash` (접두사 없음)
- `@google/generative-ai` SDK는 `models/` 접두사 없이 모델명만 사용합니다.
- 바꾸고 싶으면 `.env.local`에 `GEMINI_MODEL=gemini-2.5-pro` 등으로 지정

---

## 5. Supabase RLS / links 테이블

- API는 `archives` 테이블에 저장합니다.
- RLS가 활성화되어 있으면, **Dev 모드**에서는 `SUPABASE_SERVICE_ROLE_KEY`로 RLS를 우회해야 합니다.
- `SUPABASE_SERVICE_ROLE_KEY`가 없으면 anon 클라이언트로 요청하므로, RLS 정책이 `auth.uid() = user_id`를 요구할 때 INSERT가 거절됩니다.

### 500 에러 + 데이터 미저장 시

1. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가 (Supabase Dashboard → Project Settings → API → `service_role` 키)
2. 서버 재시작 (`rm -rf .next && npm run dev`)
3. 터미널에서 `[진단] user_id:`, `DB Insert Start`, `DB Insert End` 로그 흐름 확인

---

## 6. 진단 로그 (api/links/route.ts)

링크 저장 시 터미널에 다음 로그가 순서대로 출력됩니다:

- `1. 요청 수신:` — URL
- `[진단] user_id:` — 사용 중인 user_id
- `3. DB Insert Start` — insert 직전
- `[진단] insert payload:` — 전송 데이터
- `3. DB Insert End [성공]` 또는 `[실패]` — insert 결과
