# HUM — 음악으로 배우는 언어 학습 앱

좋아하는 노래의 가사에서 단어를 수집하고, 퀴즈로 복습하는 뮤직 기반 언어 학습 플랫폼.

---

## 주요 기능

### 단어 수집
- 트랙을 추가하면 AI가 가사에서 핵심 단어를 자동 추출 (곡당 최대 5개)
- 영어 · 일본어 · 한국어 지원
- 단어별 발음 듣기 (브라우저 TTS), 가사 속 사용 예문 확인
- 유의어, 품사, 출현 빈도 함께 표시

### 트랙 관리
- YouTube · Spotify · Apple Music 플랫폼별 분류
- 트랙 클릭 시 해당 곡에서 수집한 단어만 필터링

### 단어 목록
- 언어 / 최신순 · 빈도순 · 알파벳순 정렬
- 데스크탑: 6개씩 페이지 이동 / 모바일: "더 보기" 방식 무한 스크롤
- 단어 삭제 가능

### 퀴즈
- 언어·문제 수(5 / 10 / 20) 선택 후 시작
- 뜻을 보고 단어를 직접 타이핑 → 즉시 채점
- 결과 화면에서 오답 목록 확인 및 오답만 재도전 가능

### 대시보드
- 수집 단어·트랙 총계
- 15주 학습 출석 히트맵
- 최근 추가 단어·트랙 요약

### 프로필
- Google OAuth 로그인
- 학습 언어 / 모국어 설정
- 닉네임 변경

---

## 스크린 구성

| 경로 | 화면 |
|------|------|
| `/login` | 로그인 (Google OAuth) |
| `/onboarding` | 언어·장르 설정 (신규 사용자) |
| `/dashboard` | 통계 · 최근 단어·트랙 |
| `/words` | 단어 목록 · 필터 · 정렬 |
| `/words/:id` | 단어 상세 (예문 · 유의어 · TTS) |
| `/tracks` | 트랙 목록 · 트랙 추가 |
| `/quiz` | 단어 퀴즈 |
| `/mypage` | 프로필 · 설정 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 7 |
| 상태 관리 | Zustand 5 |
| 라우팅 | React Router DOM 7 |
| 스타일 | Emotion 11 (CSS-in-JS) |
| 아이콘 | React Icons (Feather) |
| 패키지 매니저 | Yarn |
| 배포 | Vercel |

---

## 빠른 시작

```bash
# 의존성 설치
yarn

# 환경 변수 설정
echo "VITE_BASE_URL=your-backend-url/v1" > .env

# 개발 서버 실행
yarn dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

---

## 개발 명령어

```bash
yarn dev      # 개발 서버 (HMR)
yarn build    # 프로덕션 빌드 (tsc → vite build)
yarn lint     # ESLint
yarn preview  # 빌드 결과 미리보기
```

---

## 프로젝트 구조

```
src/
├── api/          # API 클라이언트 (Bearer 토큰 자동 첨부)
├── auth/         # Google OAuth 유틸리티, AuthContext
├── data/         # API 실패 시 폴백용 더미 데이터
├── layout/       # 공통 레이아웃 (WebShell / MobileShell)
├── pages/        # 페이지 컴포넌트
├── router/       # AppRouter, RequireAuth
├── shared/hooks/ # useMediaQuery 등 커스텀 훅
├── store/        # useWordStore (Zustand 전역 스토어)
└── styles/       # theme.ts (디자인 토큰), 전역 스타일
```

---

## 환경 변수

```
VITE_BASE_URL=<백엔드 베이스 URL>/v1
```

---

## 백엔드 API

> 백엔드 레포: [Team-dumbbell/onewave_backend](https://github.com/Team-dumbbell/onewave_backend)
> 스택: Java 17 / Spring Boot / PostgreSQL / JWT / Google OAuth2

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/auth/google` | - | Google OAuth 시작 |
| GET | `/user/profile` | JWT | 사용자 프로필 |
| GET | `/api/v1/lyrics/search?q=` | - | 곡 검색 |
| GET | `/api/v1/lyrics/{id}` | - | 가사 상세 |
| POST | `/api/v1/vocab/generate/{musicId}` | JWT | AI 단어 추출 |
| GET | `/api/v1/vocab/list` | JWT | 내 단어 목록 |

### 인증 흐름

```
1. 프론트 → /auth/google (백엔드 리다이렉트)
2. Google 로그인 완료
3. 백엔드 → /auth/callback#token=<JWT>&is_new_user=<bool> 로 리다이렉트
4. 프론트 → URL fragment 파싱 → localStorage("onewave_auth_token") 저장
5. 신규 유저 → /onboarding / 기존 유저 → /dashboard
```

---

## 반응형 디자인

| 환경 | 기준 | 레이아웃 |
|------|------|---------|
| 데스크탑 | 1024px 이상 | 고정 사이드바(280px) + 상단 검색바 |
| 모바일 | 1024px 미만 | 전체 너비 + 하단 탭 내비게이션 |

- 단어 목록: 데스크탑 3열 그리드 / 모바일 1열
- 페이지네이션: 데스크탑 번호 버튼(6개) / 모바일 Load More(3개)

---

## 라이선스

MIT
