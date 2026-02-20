# Supabase 한 번에 설정하기

제가 할 수 있는 건 다 해두었어요. **아래 2가지만 터미널에서 실행**하면 됩니다.

---

## 1. 로그인 (최초 1회만)

터미널을 열고 프로젝트 폴더에서:

```bash
cd /Users/juheeha/Documents/Project/MYSNS
npx supabase login
```

브라우저가 뜨면 Supabase 계정으로 로그인해서 **Allow** 해주세요.

---

## 2. 연결 + DB 테이블 생성 + 함수 배포 (한 번에)

같은 터미널에서:

```bash
npm run supabase:deploy
```

이 명령이 자동으로:

- 지금 `.env.local`에 있는 프로젝트(`taritsiyhmoumleuxwlh`)에 연결하고
- DB에 `kv_store_3dc5a6da` 테이블을 만들고
- Edge Function `make-server-3dc5a6da`를 배포합니다.

끝나면 대시보드에서 **Functions: 1** 로 보이고, 앱에서 21t 로그인·이미지가 동작해야 합니다.

---

## MYSNS2 프로젝트를 쓰는 경우

`.env.local`을 MYSNS2 프로젝트 URL/키로 바꾼 뒤,  
`package.json`의 `supabase:deploy` 스크립트 안에 있는 `taritsiyhmoumleuxwlh`를 **MYSNS2의 프로젝트 ID**로 바꾸고 다시:

```bash
npm run supabase:deploy
```

를 실행하면 됩니다. (프로젝트 ID는 URL의 `https://[여기].supabase.co` 부분입니다.)
