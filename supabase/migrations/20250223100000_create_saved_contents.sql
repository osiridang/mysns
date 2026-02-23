-- 저장된 내용(스냅샷) 테이블 - Supabase에 저장해 기기/브라우저 간 공유
-- user_id가 null이면 비로그인(anon) 공용 목록, 있으면 해당 사용자 소유
CREATE TABLE IF NOT EXISTS saved_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  data JSONB NOT NULL,
  title TEXT NOT NULL,
  app_title TEXT,
  app_subtitle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_contents_user_id ON saved_contents (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_contents_created_at ON saved_contents (created_at DESC);

COMMENT ON TABLE saved_contents IS '현재 지정 사항 스냅샷 목록 (템플릿+데이터+앱 제목/부제목)';
