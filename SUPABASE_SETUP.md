# Supabase 설정 가이드 (MYSNS / MYSNS2)

대시보드에 **Functions: 0** 이면 로그인·이미지 업로드가 동작하지 않습니다. 아래 순서대로 진행하세요.

---

## 1. 사용할 프로젝트 정하기

- **MYSNS2** 대시보드를 쓰는 경우 → 이 프로젝트의 URL과 키를 써야 합니다.
- **Connect** 버튼 또는 **Settings → API** 에서 확인:
  - **Project URL**: `https://[프로젝트ID].supabase.co`
  - **Anon Key (Legacy)** 또는 **Publishable Key** 복사

`.env.local` 에 반드시 **같은 프로젝트** URL/키가 들어가 있어야 합니다.

```env
VITE_SUPABASE_URL=https://[여기에_프로젝트ID].supabase.co
VITE_SUPABASE_ANON_KEY=여기에_복사한_키
```

---

## 2. Edge Function 배포 (필수)

앱의 로그인·이미지 API는 **Edge Function** 하나에서 동작합니다.  
배포하지 않으면 **Functions: 0** 이고, 로그인/이미지가 모두 실패합니다.

### Supabase CLI 설치

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase
```

또는 https://supabase.com/docs/guides/cli 설치 문서 참고.

### 프로젝트 연결 후 배포

```bash
cd /Users/juheeha/Documents/Project/MYSNS

# Supabase 로그인 (한 번만)
supabase login

# 사용할 프로젝트 연결 (대시보드에서 프로젝트 ref ID 확인)
supabase link --project-ref [프로젝트ID]

# 예: MYSNS2 프로젝트 ID가 abcdefgh 라면
# supabase link --project-ref abcdefgh

# 앱이 호출하는 이름과 동일한 함수로 배포 (폴더명 = 함수 URL 경로)
supabase functions deploy make-server-3dc5a6da
```

배포 후 대시보드 **Edge Functions** 메뉴에 **make-server-3dc5a6da** 가 1개 보이면 정상입니다.

### 프로젝트 ID 확인

- Supabase 대시보드 **Settings → General** 에서 **Reference ID** 확인  
  또는  
- Project URL의 서브도메인: `https://[이부분].supabase.co`

---

## 3. Storage / DB (이미지·메타데이터)

- **Storage**: Edge Function이 **make-3dc5a6da-cardnews** 버킷을 없으면 자동 생성합니다. 별도로 버킷을 만들 필요는 없습니다.
- **DB 테이블**: 이미지 메타데이터용으로 `kv_store_3dc5a6da` 테이블이 필요합니다.  
  대시보드 **SQL Editor**에서 아래 실행:

```sql
CREATE TABLE IF NOT EXISTS kv_store_3dc5a6da (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

---

## 4. 로그인 사용자 (21t)

- Edge Function에 **21t 로그인 시 자동 생성** 로직이 있으면, 별도 생성 없이 **21t / 21t** 로 로그인하면 첫 시도 시 사용자가 만들어질 수 있습니다.
- 그래도 실패하면 **Authentication** → **Users** → **Add user**:
  - Email: `21t@local`
  - Password: `21t`
  - **Auto Confirm User** 체크 후 생성

---

## 5. 확인

| 항목 | 확인 방법 |
|------|-----------|
| 프로젝트 연결 | `.env.local` 의 URL이 대시보드 프로젝트와 동일한지 |
| Edge Function | 대시보드 **Edge Functions** 에 1개 이상 표시 |
| 로그인 | 앱에서 21t / 21t 로 로그인 시도 |
| 이미지 | 후보 얼굴·로고 등 이미지 탭에서 로드/업로드 시도 |

---

**정리:** Supabase 설정이 “제대로 안 된 것 같다”면,  
1) **사용 중인 프로젝트**의 URL/키를 `.env.local`에 넣고,  
2) **Edge Function**을 반드시 배포한 뒤,  
3) 필요 시 Storage 버킷과 21t 사용자를 만든 다음,  
위 확인 순서대로 점검하면 됩니다.
