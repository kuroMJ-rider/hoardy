# drawers 테이블 UNIQUE 제약 (서랍 중복 방지)

## 배경

동일 유저가 같은 이름의 서랍을 여러 개 가지지 않도록 `(user_id, name)` 조합에 UNIQUE 제약을 추가합니다.
이 제약이 있어야 API의 `upsert` with `onConflict`가 정상 동작합니다.

## 실행 방법

Supabase 대시보드 **SQL Editor**에서 아래 쿼리를 실행하세요.

```sql
ALTER TABLE drawers
ADD CONSTRAINT unique_user_drawer_name UNIQUE (user_id, name);
```

⚠️ **주의**: 이미 중복된 (user_id, name) 데이터가 있으면 제약 추가가 실패합니다.
중복이 있다면 먼저 정리한 후 실행하세요.

## 이미 제약이 있는 경우

```sql
-- 기존 제약 확인
SELECT conname FROM pg_constraint
WHERE conrelid = 'drawers'::regclass AND contype = 'u';
```

## 롤백 (제약 제거)

```sql
ALTER TABLE drawers DROP CONSTRAINT IF EXISTS unique_user_drawer_name;
```
