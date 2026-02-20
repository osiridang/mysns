# Supabase 연결 확인

`npm run dev` 실행 후 브라우저 **개발자 도구 → 콘솔**을 열어보세요.

- **`[Supabase] Supabase 연결됨 (taritsiyhmoumleuxwlh)`** → 정상
- **`[Supabase 연결 실패] ...`** → 아래 항목을 순서대로 확인하세요.

---

## 1. 환경 변수 (.env.local)

- 파일이 프로젝트 루트에 있는지
- `VITE_SUPABASE_URL` = 대시보드의 **Project URL** (예: `https://xxxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` = 대시보드 **API → anon public** 또는 **Publishable key**
- 수정 후에는 **개발 서버를 다시 실행**해야 반영됩니다 (`npm run dev` 재시작)

## 2. Edge Function 배포 여부

이 프로젝트는 **Edge Function** `make-server-3dc5a6da`를 사용합니다.  
아직 배포하지 않았다면:

```bash
npx supabase login
npx supabase link --project-ref taritsiyhmoumleuxwlh   # .env의 URL에 맞는 project ref
npm run supabase:deploy
```

또는 Supabase 대시보드 → **Edge Functions**에서 해당 함수가 배포되어 있는지 확인하세요.

## 3. 프로젝트가 일치하는지

- `.env.local`의 **URL**과 **Supabase 대시보드에서 선택한 프로젝트**가 같은지 확인
- URL의 서브도메인(예: `taritsiyhmoumleuxwlh`)이 **Project ref**와 동일해야 합니다.

## 4. 키 종류

- **anon / publishable key**는 브라우저(클라이언트)용입니다.  
  `service_role` 키는 서버 전용이므로 `.env.local`에 넣지 마세요.
- 키를 다시 복사할 때 앞뒤 공백이 들어가지 않았는지 확인하세요.

---

연결이 되면 앱 기본값(app-defaults) 조회 등이 정상 동작합니다.  
계속 실패하면 콘솔에 나온 `[Supabase 연결 실패]` 메시지 내용을 확인하면 원인 파악에 도움이 됩니다.
