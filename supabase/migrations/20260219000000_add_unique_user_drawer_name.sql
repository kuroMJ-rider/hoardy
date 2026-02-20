-- drawers 테이블: user_id + name 조합 유일 제약
-- 중복 생성 방지 및 upsert onConflict 사용을 위해 필요
ALTER TABLE drawers
ADD CONSTRAINT unique_user_drawer_name UNIQUE (user_id, name);
