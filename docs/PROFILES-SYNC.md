# profiles 테이블 동기화

## 개요

auth callback에서 구글/카카오 로그인 직후 `public.profiles`에 사용자 정보를 upsert합니다.

## 필수 컬럼

profiles 테이블에 다음 컬럼이 있어야 합니다:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PRIMARY KEY | auth.users.id와 동일 (REFERENCES auth.users) |
| email | text | 이메일 |
| nickname | text | 닉네임 (카카오) / 이름 (구글) |
| avatar_url | text | 프로필 사진 URL |

## 대체 스키마

테이블이 `user_id`를 PK로 사용하는 경우, `app/auth/callback/route.ts`의 profiles upsert를 수정하세요:

```ts
{ user_id: user.id, email: ..., nickname: ..., ... }
// onConflict: "user_id"
```

## DB 트리거 (선택)

`supabase/migrations/20260219000001_profiles_sync_trigger.sql`를 실행하면 auth.users INSERT 시 자동으로 profiles에 반영됩니다. 앱 로직과 중복되어도 ON CONFLICT로 덮어쓰므로 무방합니다.
