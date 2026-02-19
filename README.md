# MY SNS - 범용 카드뉴스 제작 시스템

미니멀리즘 디자인과 Deep Blue & White 컬러 팔레트를 사용한 전문 카드뉴스 제작 도구입니다.

## ✨ 주요 기능

### 📋 템플릿 시스템
- **가로형 카드** - 후보 사진과 정책을 좌우로 배치한 임팩트 있는 디자인
- **세로형 카드** - 상단 슬로건, 중앙 이미지, 하단 정책 요약 구조
- **4분할 레이아웃** - 4가지 핵심 정책을 그리드로 표현
- **세로 리스트 카드** - 정책 리스트를 카드 형태로 표현

### 🎨 디자인 시스템
- **컬러**: Deep Blue (#1e3a8a) & White 기반
- **서체**: Pretendard (본문), GmarketSans (강조)
- **스타일**: 미니멀리즘, 여백 중시, 세련된 그라데이션

### 🖼️ 이미지 관리
- **후보 얼굴 관리**: 크롭 기능이 있는 프로필 이미지 업로드
- **배경 이미지**: 카드뉴스 배경 커스터마이징
- **텍스트 이미지**: 서예, 슬로건 등 오버레이 이미지
- **로고 이미지**: 브랜드 로고 관리

### 💾 저장 및 공유
- **자동 저장**: 편집 중인 내용 자동 저장 (localStorage)
- **고화질 다운로드**: PNG 형식으로 다운로드
- **클라우드 저장**: Supabase Storage에 이미지 보관
- **저장된 콘텐츠**: 텍스트 내용을 저장하고 불러오기

## 🛠️ 기술 스택

### Frontend
- **React** + **TypeScript**
- **Tailwind CSS v4** - 최신 CSS 프레임워크
- **Vite** - 빠른 빌드 도구
- **html-to-image** - 고화질 이미지 생성
- **react-easy-crop** - 이미지 크롭 기능
- **Sonner** - 토스트 알림
- **Lucide React** - 아이콘

### Backend
- **Supabase** - 백엔드 플랫폼
  - Authentication (로그인/로그아웃)
  - Storage (이미지 저장)
  - KV Store (메타데이터)
- **Hono** - Edge Function 웹 서버
- **Deno** - 서버리스 런타임

## 📦 데이터 저장 구조

### 1. Supabase Storage (클라우드)
실제 이미지 파일 저장:
- `profile_*.png` - 후보 얼굴 사진
- `background_*.png` - 배경 이미지
- `text_*.png` / `text_*.svg` - 텍스트 이미지
- `logo_*.png` - 로고 이미지
- `cardnews_*.png` - 완성된 카드뉴스

### 2. KV Store (데이터베이스)
이미지 메타데이터 저장:
- `profile:{timestamp}` - 프로필 정보
- `background:{timestamp}` - 배경 정보
- `textimage:{timestamp}` - 텍스트 이미지 정보
- `logo:{timestamp}` - 로고 정보
- `cardnews:{timestamp}` - 카드뉴스 정보

### 3. LocalStorage (브라우저)
편집 중인 데이터:
- `mysns-template-data` - 템플릿 편집 데이터
- `mysns-selected-template` - 선택된 템플릿
- `accessToken` - 로그인 토큰

## 🚀 시작하기

### 설치
```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행
```bash
# 프론트엔드 개발 서버
pnpm dev
```

### 환경 변수 설정
프로젝트는 Supabase를 사용합니다. 다음 환경 변수가 필요합니다:
- `SUPABASE_URL` - Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY` - Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key

### 개발 모드
`DEV_MODE = true` 설정 시 로그인 없이 바로 사용 가능합니다.
- `/src/app/App.tsx` - 프론트엔드 DEV_MODE
- `/supabase/functions/server/index.tsx` - 백엔드 DEV_MODE

## 📝 사용 방법

1. **템플릿 선택**: 4가지 템플릿 중 하나 선택
2. **콘텐츠 편집**: 제목, 부제목, 본문 입력
3. **이미지 업로드**: 후보 사진, 배경, 로고 등록
4. **색상 변경**: 배경색 커스터마이징
5. **저장 및 공유**: 
   - 💾 저장: 클라우드에 저장
   - 📥 다운로드: PNG 파일로 다운로드
   - 💬 공유: SNS 공유 기능

## 🎯 프로젝트 배경

원래는 이원택 후보님의 전북특별자치도지사 선거 출마를 위한 정치 홍보물 디자인 도구로 시작했으나, 범용 카드뉴스 제작 시스템 "MY SNS"로 발전했습니다.

**핵심 가치**:
- ✅ 세련됨 (미니멀리즘 디자인)
- ✅ 신뢰감 (Deep Blue 컬러)
- ✅ 젊은 감각 (모던한 UI/UX)

## 📄 라이선스

이 프로젝트는 정치 활동 및 일반 카드뉴스 제작에 자유롭게 사용 가능합니다.

## 🙏 크레딧

- 디자인 시스템: Tailwind CSS v4
- UI 컴포넌트: Shadcn/ui 기반
- 백엔드: Supabase
- 개발: Figma Make AI Assistant
