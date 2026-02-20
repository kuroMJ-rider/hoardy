# Google & Kakao 소셜 로그인 설정

## 1. Supabase Dashboard 설정

### Redirect URL 추가
Authentication → URL Configuration → Redirect URLs에 추가:
- `http://localhost:3000/auth/callback` (개발)
- `https://yourdomain.com/auth/callback` (프로덕션)

### Google Provider
1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 클라이언트 생성
2. Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google
   - Client ID, Client Secret 입력

### Kakao Provider
1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. 카카오 로그인 활성화, Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. 동의 항목: 프로필(닉네임, 프로필 사진), 이메일
4. Supabase → Authentication → Providers → Kakao
   - REST API 키 (Client ID), Client Secret 입력

## 2. User Identity

Supabase는 각 OAuth 프로바이더별로 고유 `user.id` (UUID)를 생성합니다. 동일 이메일이라도 프로바이더가 다르면 별도 계정으로 처리됩니다. `archives`와 `drawers`의 `user_id`는 Supabase `auth.users.id`와 연결됩니다.

## 3. Dev 모드

`.env.local`에 `NEXT_PUBLIC_HOARDY_DEV=true`와 `NEXT_PUBLIC_HOARDY_DEV_USER_ID`를 설정하면 로그인 UI를 건너뛰고 해당 유저로 동작합니다.
