# 🚀 MY SNS 배포 가이드

## 📋 배포 절차 (Git + Supabase + Vercel)

### 1️⃣ GitHub 저장소 생성 및 푸시

#### GitHub에 새 저장소 생성
1. https://github.com/new 접속
2. Repository name: `mysns` (또는 원하는 이름)
3. Public 또는 Private 선택
4. **Initialize repository 옵션 체크 해제** (이미 로컬에 코드 있음)
5. "Create repository" 클릭

#### 로컬 코드를 GitHub에 푸시
```bash
# GitHub에서 제공하는 URL로 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/mysns.git

# 코드 푸시
git push -u origin main
```

---

### 2️⃣ Supabase 프로젝트 설정

#### Supabase 프로젝트 생성
1. https://supabase.com 접속 및 로그인
2. "New project" 클릭
3. 프로젝트 정보 입력:
   - Name: `mysns`
   - Database Password: 강력한 비밀번호 설정 (저장 필요!)
   - Region: Northeast Asia (Seoul)
4. "Create new project" 클릭 (약 2분 소요)

#### Storage Buckets 생성
프로젝트 대시보드에서:

1. 좌측 메뉴 **Storage** 클릭
2. "New bucket" 클릭하여 다음 5개 버킷 생성:
   - `profile-images` (Public)
   - `background-images` (Public)
   - `text-images` (Public)
   - `logo-images` (Public)
   - `cardnews-images` (Public)

#### API Keys 확인
1. 좌측 메뉴 **Settings** → **API** 클릭
2. 다음 정보 복사 (Vercel에서 사용):
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` `public` key

---

### 3️⃣ Vercel 배포

#### Vercel에서 프로젝트 Import
1. https://vercel.com 접속 및 GitHub 계정으로 로그인
2. "Add New..." → "Project" 클릭
3. GitHub에서 `mysns` 저장소 선택
4. "Import" 클릭

#### 환경 변수 설정
**Environment Variables** 섹션에서 추가:

```
Name: VITE_SUPABASE_URL
Value: https://xxxxx.supabase.co (Supabase Project URL)

Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGc... (Supabase anon key)
```

#### 배포 설정 확인
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 배포 시작
"Deploy" 버튼 클릭! 🚀

약 2-3분 후 배포 완료되면:
```
✅ https://mysns-xxxxx.vercel.app
```

---

## 🎯 배포 완료 체크리스트

### ✅ Git
- [x] Git 저장소 초기화
- [x] 초기 커밋 생성
- [ ] GitHub 원격 저장소 추가
- [ ] GitHub에 푸시

### ✅ Supabase
- [ ] 프로젝트 생성
- [ ] Storage Buckets 생성 (5개)
- [ ] API Keys 복사

### ✅ Vercel
- [ ] GitHub 저장소 import
- [ ] 환경 변수 설정 (2개)
- [ ] 배포 완료
- [ ] 사이트 접속 확인

---

## 🔧 현재 상태

✅ **Git 초기화 완료**
```bash
git log --oneline
# b4c2299 Add Vercel and Supabase configuration files
# eb77300 Initial commit: MY SNS 카드뉴스 제작 시스템
```

✅ **로컬 개발 서버 실행 중**
- http://localhost:5173/
- http://192.168.0.9:5173/

⏳ **다음 단계**
1. GitHub에 저장소 생성
2. `git remote add origin` 실행
3. `git push -u origin main` 실행
4. Supabase 설정
5. Vercel 배포

---

## 💡 주요 명령어

```bash
# 현재 git 상태 확인
git status

# GitHub에 푸시
git push -u origin main

# 새로운 변경사항 배포 (자동)
git add .
git commit -m "Update: 기능 추가"
git push
# → Vercel이 자동으로 재배포!
```

---

## 🌐 배포 후 URL

배포 완료 후 다음 URL로 접속 가능:

- **Vercel Production**: `https://mysns-xxxxx.vercel.app`
- **Vercel Preview** (브랜치별): `https://mysns-git-branch-xxxxx.vercel.app`

**전 세계 어디서든 접속 가능!** 🎉

---

## 📞 문제 해결

### 빌드 에러 발생 시
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. `dist/` 폴더가 생성되는지 확인
3. 에러 메시지 확인 후 수정

### 환경 변수 에러
- Vercel Dashboard → Project Settings → Environment Variables
- 변수명이 정확한지 확인 (대소문자 구분)
- 값에 따옴표 없이 입력

### Supabase 연결 실패
- Project URL이 정확한지 확인
- Anon key가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

---

## 🎨 커스텀 도메인 (선택사항)

Vercel에서 무료로 커스텀 도메인 연결 가능:

1. 도메인 구매 (예: mysns.com)
2. Vercel Project Settings → Domains
3. 도메인 추가 및 DNS 설정
4. SSL 자동 적용

---

**준비 완료! 위 단계를 따라하시면 됩니다.** 🚀
