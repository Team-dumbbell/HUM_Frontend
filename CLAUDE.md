# OneWave — CLAUDE.md

음악을 통해 언어를 학습하는 React SPA 프로젝트. 수집한 단어와 트랙을 관리하고 탐색하는 대시보드.

## 기술 스택

- **Framework:** React 19 + TypeScript 5
- **Build:** Vite 7
- **State:** Zustand 5 (`src/store/useWordStore.ts`)
- **Routing:** React Router DOM 7
- **Styling:** Emotion 11 (CSS-in-JS, `@emotion/styled`)
- **Icons:** React Icons (Feather 계열 사용)
- **Package manager:** Yarn
- **Deploy:** Vercel (SPA rewrite 설정 — `vercel.json`)

## 개발 명령어

```bash
yarn dev        # 개발 서버 (HMR)
yarn build      # tsc -b && vite build
yarn lint       # ESLint
yarn preview    # 프로덕션 빌드 미리보기
```

## 프로젝트 구조

```
src/
├── api/          # API 클라이언트 (apiGet + Bearer 토큰)
├── auth/         # Google OAuth 유틸리티, AuthContext
├── data/         # API 실패 시 사용할 더미 데이터 (fallback)
├── layout/       # 공통 레이아웃 컴포넌트
├── pages/        # 페이지 단위 컴포넌트
├── router/       # AppRouter, RequireAuth
├── shared/hooks/ # useMediaQuery 등 커스텀 훅
├── store/        # useWordStore (Zustand)
└── styles/       # theme.ts (디자인 토큰), 전역 스타일
```

## 핵심 아키텍처

### 상태 관리
- 전역 스토어 하나: `useWordStore`
- words, tracks, user, filter, search, sort 상태 통합 관리
- API 중복 요청 방지 로직 내장

### 인증
- Google OAuth → localStorage 토큰 저장 (`onewave_auth_token`)
- 앱 초기화 시 세션 유효성 검사
- 보호 라우트: `RequireAuth` 래퍼

### API
- 환경변수: `VITE_BASE_URL` (`.env`)
- 단일 함수 `apiGet` — Bearer 토큰 자동 첨부
- API 실패 시 `src/data/` 더미 데이터로 폴백

### 반응형
- 브레이크포인트: **1024px** (모바일 < 1024px, 데스크탑 ≥ 1024px)
- `useMediaQuery` 훅으로 분기
- 큰 페이지는 모바일/데스크탑 컴포넌트를 별도 구현

### 페이지네이션
- 데스크탑: 페이지당 6개, 번호 버튼 방식
- 모바일: 페이지당 3개, "Load More" + Intersection Observer
- 모바일 다음 배치 노출 딜레이: 380ms

## 코딩 컨벤션

- **컴포넌트/파일명:** PascalCase (`LoginPage.tsx`, `WordCard`)
- **유틸/훅:** camelCase
- **상수:** UPPER_SNAKE_CASE (`AUTH_KEY`, `MOBILE_PAGE_SIZE`)
- **Styled components:** 파일 하단에 정의, export 위에 위치
- **TypeScript strict 모드** — `noUnusedLocals`, `noUnusedParameters` 활성화
- 불필요한 주석 금지 — 자명하지 않은 로직에만 주석 추가

## 환경 설정

```
VITE_BASE_URL = onewave-hackathon-backend.condev.workers.dev/v1
```

## 테스트

현재 테스트 프레임워크 없음. ESLint만 자동화된 품질 검사로 사용 중.

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/store/useWordStore.ts` | 전역 상태 허브 |
| `src/App.tsx` | 단어 목록 + 페이지네이션 메인 로직 |
| `src/router/AppRouter.tsx` | 라우트 정의 |
| `src/auth/auth.ts` | 인증 유틸리티 |
| `src/api/client.ts` | API 래퍼 |
| `src/styles/theme.ts` | 디자인 토큰 |

## 작업 시 주의사항

- API 응답 구조가 여러 형태로 올 수 있어 방어적 언래핑 처리 필요
- 언어 감지 로직(영어/일본어/한국어) 건드릴 때 세 언어 모두 검증
- 페이지네이션 수식 변경 시 모바일/데스크탑 양쪽 모두 확인
- 새 페이지 추가 시 `RequireAuth` 래퍼 적용 여부 판단 필요
- Emotion styled 컴포넌트는 파일 하단 배치 규칙 유지

---

## 백엔드 연동 계획 (team-moleback.store)

> 백엔드: Java 17 / Spring Boot / PostgreSQL / JWT(60분) / Google OAuth2
> 레포: https://github.com/Team-dumbbell/onewave_backend

### 백엔드 API 목록

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/auth/google` | 불필요 | Google OAuth 시작 (302 redirect) |
| GET | `/user/profile` | JWT | 사용자 프로필 |
| GET | `/user/words` | - | 플레이스홀더 (빈 배열) — 사용 금지 |
| GET | `/api/v1/lyrics/search?q=` | 불필요 | 곡 검색 |
| GET | `/api/v1/lyrics/{id}` | 불필요 | 가사 상세 |
| POST | `/api/v1/vocab/generate/{musicId}` | JWT | AI 단어 추출 (곡당 최대 5개) |
| GET | `/api/v1/vocab/list` | JWT | 내 단어 목록 (실제 데이터) |

### 인증 흐름

```
1. 프론트 → GET https://team-moleback.store/auth/google
2. Google 로그인 완료 → 백엔드 JWT 발급
3. 백엔드 → 프론트 콜백 URL#token=<JWT> 로 리다이렉트
4. 프론트 → URL fragment 파싱 → localStorage 저장
```

### CORS 허용 오리진 (백엔드 설정)
- `http://localhost:5173`
- `https://team-moleback.store`
- **프로덕션 프론트 도메인 추가 필요 — 백엔드 팀 요청 사항**

