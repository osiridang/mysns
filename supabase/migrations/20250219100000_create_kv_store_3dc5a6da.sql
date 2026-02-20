-- 이미지/메타데이터 저장용 KV 테이블 (Edge Function에서 사용)
CREATE TABLE IF NOT EXISTS kv_store_3dc5a6da (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
