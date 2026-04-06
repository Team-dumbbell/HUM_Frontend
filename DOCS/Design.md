# HUM — Design System

음악으로 언어를 배우는 React SPA의 디자인 시스템 문서.

---

## 1. 디자인 토큰

### 색상 팔레트

**파일:** [src/styles/theme.ts](../src/styles/theme.ts)

| 토큰 | 값 | 용도 |
|------|----|------|
| `bg` | `#F7F8FA` | 앱 배경 |
| `surface` | `#FFFFFF` | 카드, 컨테이너 표면 |
| `text` | `#111827` | 기본 텍스트 |
| `subtext` | `#6B7280` | 보조 텍스트, 캡션 |
| `blue` | `#00A36C` | 주요 액션, 강조색 (그린 계열) |
| `blueHover` | `#008F5A` | hover/active 상태 |
| `chip` | `#E8FFF5` | 필터 칩 배경 (비활성) |
| `chipActive` | `#00A36C` | 필터 칩 배경 (활성) |
| `line` | `#E5E7EB` | 테두리, 구분선 |

**기타 자주 쓰이는 커스텀 값:**
- Muted text: `#647089`, `#9aa4b8`, `#8994aa`
- Track row background: `#f7f9fc`
- Word emphasis: `#009a62`

### 플랫폼 배지 색상

| 플랫폼 | 텍스트 색 | 배경 색 |
|--------|-----------|---------|
| YouTube | `#ff2f2f` | `#fff0f1` |
| Spotify | `#08a962` | `#edfef5` |
| Apple Music | `#e10087` | `#ffeff8` |

### 간격 시스템

베이스 단위 **4px**. `space(n)` → `n × 4px`

| 사용 빈도 높은 값 | 픽셀 | 용도 |
|------------------|------|------|
| `space(2)` | 8px | 아이콘-텍스트 간격 등 소형 gap |
| `space(3)` | 12px | 카드 내부 기본 gap |
| `space(4)` | 16px | 섹션 패딩, 컴포넌트 간격 |
| `space(5)` | 20px | 페이지 좌우 패딩 (모바일) |
| `space(6)` | 24px | 섹션 구분 여백 |
| 30px | — | 데스크탑 메인 좌우 패딩 |

### 테두리 반지름

| 토큰 | 값 | 용도 |
|------|----|------|
| `radius.xl` | `20px` | 모달, 고강조 카드 |
| `radius.lg` | `16px` | 일반 카드, 대화상자 |
| `radius.md` | `12px` | 버튼, 소형 컴포넌트 |
| (커스텀) | `14px` | WordCard, 검색바 |
| (커스텀) | `10px` | 칩, 소형 인풋 |
| (커스텀) | `8px` | 배지, 태그 |

### 그림자

| 토큰 | 값 | 용도 |
|------|----|------|
| `shadow.sm` | `0 1px 2px rgba(0,0,0,0.06)` | 카드, 기본 요소 |
| `shadow.md` | `0 8px 24px rgba(0,0,0,0.08)` | 모달, 플로팅 요소 |

### 브레이크포인트

| 이름 | 값 | 기준 |
|------|----|------|
| `lg` | `1024px` | 모바일(`< 1024px`) / 데스크탑(`≥ 1024px`) |
| (보조) | `640px` | 일부 컴포넌트 내 세부 조정 |
| (보조) | `1400px` | 어휘 그리드 2열 전환 |

---

## 2. 타이포그래피

### 폰트 스택

```
"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Segoe UI", sans-serif
```

한국어 최적화: Pretendard → Noto Sans KR 순으로 폴백.

### 스케일

| 역할 | 크기 | 굵기 | 자간 |
|------|------|------|------|
| 페이지 타이틀 | 34px | 800 | -0.03em |
| 섹션 헤더 | 18–28px | 800 | — |
| 카드 단어 | 30px | — | — |
| 카드 의미 | 21px | 700 | — |
| 본문 | 14–16px | 400–600 | — |
| 레이블/배지 | 11–14px | 600–800 | 0.2em (uppercase) |
| 통계 수치 | 34px (데스크탑) / 28px (모바일) | 800 | -0.03em |

**유동 타이포그래피 패턴:**
```css
font-size: clamp(20px, 2vw, 27px);      /* 섹션 헤더 */
font-size: clamp(22px, 1.6vw, 30px);    /* 단어 의미 */
```

---

## 3. 레이아웃 시스템

### 데스크탑 레이아웃 (≥ 1024px)

[src/layout/WebShell.tsx](../src/layout/WebShell.tsx)

```
┌────────────────┬────────────────────────────────┐
│   Sidebar      │         TopBar (86px)           │
│   (280px)      ├────────────────────────────────┤
│                │         Main Content             │
│                │         (스크롤 가능)            │
│                │         padding: 16px 30px       │
└────────────────┴────────────────────────────────┘
```

- Grid: `280px 1fr`
- TopBar 높이: 86px
- 사이드바: `border-right: 1px solid theme.line`

### 모바일 레이아웃 (< 1024px)

[src/layout/MobileShell.tsx](../src/layout/MobileShell.tsx)

```
┌─────────────────────────────────┐
│  Header  (padding: 20px 20px)   │
├─────────────────────────────────┤
│  Body                           │
│  (padding: 0 20px, 스크롤 가능) │
├─────────────────────────────────┤
│  Bottom Navigation (72px, fixed)│
└─────────────────────────────────┘
```

- 단일 컬럼
- 하단 내비게이션: fixed, 높이 72px, 4칸 grid

### 어휘 카드 그리드

| 뷰포트 | 열 수 | gap |
|--------|-------|-----|
| ≥ 1400px (desktop) | 3열 | 12px |
| 1024–1399px (desktop) | 2열 | 12px |
| < 1024px (mobile) | 1열 | 22px |

---

## 4. 컴포넌트 레퍼런스

### WordCard

[src/App.tsx](../src/App.tsx)

| 속성 | 데스크탑 | 모바일 |
|------|---------|--------|
| border-radius | 14px | 14px |
| padding | 21px | 22px 20px |
| min-height | 231px | 208px |
| background | surface | surface |
| border | 1px solid line | 1px solid line |
| box-shadow | shadow.sm | shadow.sm |

**하위 요소:**
- `Word`: font-size 30px
- `Badge` (품사): padding 6px 10px, border-radius 8px, bg `#e8fff5`, color `blue`, font-weight 700
- `Meaning`: font-size 21px, color `blue`, font-weight 700
- `TrackRow`: height 45px, bg `#f7f9fc`, border-radius 8px, padding 0 12px
- `Meta`: color `#9aa4b8`, font-size 16px, gap 15px

### TrackCard

[src/pages/TrackListPage.tsx](../src/pages/TrackListPage.tsx)

- border-radius: 14px, padding: 14px (데스크탑) / 16px (모바일)
- 커버 이미지: 64×64px, border-radius 12px
- `PlatformBadge`: 플랫폼별 고유 색상 (상단 표 참고)

### StatCard (대시보드)

[src/pages/DashboardPage.tsx](../src/pages/DashboardPage.tsx)

- border-radius: 16px, padding: 14px 16px
- 2열 그리드, gap 14px (데스크탑) / 10px (모바일)
- `StatIcon`: 34×34px, border-radius 10px
  - 파란 계열: color `#3c87ff`, bg `#eef5ff`
  - 주황 계열: color `#ff8c18`, bg `#fff5e8`
- `StatValue`: font-size 34px / 28px, font-weight 800, letter-spacing -0.03em

### 버튼 & 인터랙티브

#### Chip (필터)

| 속성 | 데스크탑 | 모바일 |
|------|---------|--------|
| height | 30px | 42px |
| border-radius | 10px | 13px |
| padding | 0 11px | 0 16px |
| font-size | 12px | 14px |
| font-weight | 600 | 600 |
| 활성 bg | `chipActive` (#00A36C) | 동일 |
| 활성 color | `#fff` | `#fff` |

#### PageBtn (페이지네이션)

- 크기: 42px (화살표) / 40px (숫자), height 40px
- border-radius: 12px
- 활성: bg `blue`, color `#fff`, border `blue`
- 비활성: bg `surface`, color `#5f6d87`, border `line`
- 비활성화: opacity 0.5

#### LoadMoreButton (모바일 더보기)

- min-width: 160px, height: 40px, border-radius: 12px
- bg `surface`, border `line`, color `#5f6d87`, font-weight 700

#### ActionBtn (모바일 헤더 액션)

- height: 44px, border-radius: 14px
- bg `blue`, color `#fff`, box-shadow `shadow.sm`

### 네비게이션

#### WebSidebar NavItem

[src/layout/WebSidebar.tsx](../src/layout/WebSidebar.tsx)

- height: 48px, border-radius: 12px, padding: 0 14px
- 활성: bg `#e8fff5`, color `blue`
- 비활성: bg transparent, color `#647089`
- font-size: 16px, font-weight: 700

#### MobileBottomNav

[src/layout/MobileBottomNav.tsx](../src/layout/MobileBottomNav.tsx)

- 4칸 grid, height 72px, fixed bottom
- 아이템: flex column, gap 4px
- 활성: color `blue`, 비활성: muted gray

#### SortTab (모바일 탭)

- 활성: color `blue`, font-weight 700, border-bottom 3px solid `blue`
- 비활성: color `#8994aa`, font-weight 600, border-bottom transparent
- padding-bottom: 10px, font-size: 15px

### 검색바

[src/layout/TopSearchBar.tsx](../src/layout/TopSearchBar.tsx)

- height: 46px, border-radius: 14px
- bg `surface`, border: `1px solid line`
- padding: 0 14px, gap: 10px
- 데스크탑 max-width: 540px

### 모달

[src/pages/TrackListPage.tsx](../src/pages/TrackListPage.tsx) 외

- `ModalOverlay`: fixed inset 0, bg `rgba(0,0,0,0.45)`, z-index 100, grid center
- `ModalBox`: bg `bg`, border-radius 20px, max-width 480px, padding 24px
  - box-shadow: `0 8px 40px rgba(0,0,0,0.18)`, max-height: 80dvh
- `ModalInput`: height 42px, border-radius 10px, focus border-color `blue`

### 아바타 & 브랜드

| 컴포넌트 | 크기 | border-radius | 배경 |
|----------|------|---------------|------|
| Avatar (데스크탑) | 42×42px | 999px | 그라디언트 `#2a2f38 → #13161d` |
| Avatar (모바일) | 36×36px | 999px | 동일 |
| AvatarCircle (프로필) | 110×110px | 50% | 그라디언트 `#5b6779 → #252d3c` |
| Logo | 36×36px (사이드바) / 30×30px (모바일) | 11px | 그라디언트 `#18b67a → #008f5a` |

### WordDetailPage 전용

[src/pages/WordDetailPage.tsx](../src/pages/WordDetailPage.tsx)

- `ExampleCard`: border-radius 16px, padding 14px, border `1px solid #ecf0f6`
  - 데스크탑 grid: `74px 1fr auto`, 모바일: `62px 1fr auto`
- `Highlight` (예문 강조): color `#00a36c`, font-weight 800, text-decoration underline, underline-offset 4px
- `Artwork`: border-radius 12px, aspect-ratio 1, radial-gradient 배경
- `PlayButton`: 34×34px, border-radius 999px, bg `#f2f6fb`

---

## 5. 그라디언트 패턴

| 위치 | 값 |
|------|----|
| 로고 | `linear-gradient(145deg, #18b67a, #008f5a)` |
| 아바타 (어두운) | `linear-gradient(145deg, #2a2f38, #13161d)` |
| 아바타 프로필 | `linear-gradient(145deg, #5b6779, #252d3c)` |
| 트랙 커버 아트 | `linear-gradient(135deg, <dynamic>)` |
| 곡 상세 아트워크 | `radial-gradient(circle at 20% 20%, #effff7, #d8f8eb 58%, #bdeed9)` |

---

## 6. 애니메이션 & 트랜지션

### 로딩 스피너

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
animation: spin 0.85s linear infinite;
```

`FiLoader` 아이콘과 함께 사용. 트랙 검색, 단어 생성 대기 중에 노출.

### 버튼 hover

```css
transition: transform 0.15s ease, box-shadow 0.15s ease;
&:hover { transform: translateY(-1px); }
```

### 타이밍 상수

| 상황 | 지연 |
|------|------|
| 모달 닫힘 (단어 생성 완료 후) | 1200ms |
| 모바일 "Load More" 다음 배치 노출 | 380ms |

---

## 7. 아이콘 시스템

**라이브러리:** `react-icons` — Feather 계열 (`Fi*`) 위주, 일부 FontAwesome (`Fa*`)

### 주요 아이콘 매핑

| 아이콘 | 용도 |
|--------|------|
| `FiHome` | 대시보드 |
| `FiBookOpen` | 어휘/단어 |
| `FiMusic` | 트랙/음악 |
| `FiUser` | 프로필 |
| `FiSearch` | 검색 |
| `FiChevronLeft` / `FiChevronsRight` | 페이지네이션 화살표 |
| `FiList` | 정렬 인디케이터 |
| `FiLoader` | 로딩 스피너 |
| `FiPlus` | 추가 액션 |
| `FiX` | 모달 닫기 |
| `FiPlay` | 재생 |
| `FiVolume2` | 오디오 |
| `FiBookmark` | 저장/북마크 |
| `FaItunesNote` | 음악 브랜드 |
| `FaGoogle` | Google 인증 |

### 아이콘 크기 기준

| 크기 | 용도 |
|------|------|
| 14–16px | 배지 내 아이콘, 인라인 레이블 |
| 18–20px | 네비게이션, 버튼 내 |
| 24–26px | 헤더 액션 버튼 |
| 32px | 브랜드/히어로 영역 |

### 아이콘 색상

| 상태 | 색상 |
|------|------|
| 활성 | `#00A36C` (theme.blue) |
| 비활성 | `#647089`, `#98a2b5` |
| 컬러 배경 위 | `#fff` |

---

## 8. 반응형 패턴

### 조건부 컴포넌트 렌더링

```tsx
const isMobile = useMediaQuery("(max-width: 1023px)");
return isMobile ? <MobileWordList /> : <DesktopWordList />;
```

[src/shared/hooks/useMediaQuery.ts](../src/shared/hooks/useMediaQuery.ts) 훅 사용.

### 페이지네이션 전략

| 환경 | 방식 | 페이지당 항목 수 |
|------|------|----------------|
| 데스크탑 | 번호 버튼 | 6개 |
| 모바일 | Load More + Intersection Observer | 3개 |

### 미디어 쿼리 패턴

```css
/* Styled Component 내부 */
@media (max-width: 1023px) {
  /* 모바일 오버라이드 */
}
@media (max-width: 639px) {
  /* 소형 모바일 세부 조정 */
}
@media (max-width: 1399px) {
  /* 어휘 그리드 2열 → 3열 전환점 */
}
```

---

## 9. 디렉토리 구조

```
src/
├── styles/
│   ├── theme.ts          ← 디자인 토큰 (색상, 간격, 반지름, 그림자)
│   └── GlobalStyle.tsx   ← Emotion 전역 스타일
├── layout/
│   ├── WebShell.tsx      ← 데스크탑 레이아웃 래퍼
│   ├── MobileShell.tsx   ← 모바일 레이아웃 래퍼
│   ├── WebSidebar.tsx    ← 사이드바 네비게이션
│   ├── MobileBottomNav.tsx ← 하단 탭바
│   └── TopSearchBar.tsx  ← 공통 검색 입력
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TrackListPage.tsx
│   ├── WordDetailPage.tsx
│   └── ProfilePage.tsx
└── shared/hooks/
    └── useMediaQuery.ts  ← 반응형 훅
```

Styled components는 각 파일 **하단**에 정의. export 위에 위치.

---

## 10. 코딩 컨벤션 (디자인 관련)

- Styled components: 파일 하단, export 위에 정의
- 색상은 반드시 `theme.*` 토큰 우선 사용, 커스텀 값은 최소화
- 새 컴포넌트에 반응형 필요 시 `useMediaQuery` 훅으로 분기
- 모바일/데스크탑 UI가 크게 다를 경우 별도 컴포넌트로 분리
- `UPPER_SNAKE_CASE`로 상수 정의: `MOBILE_PAGE_SIZE`, `AUTH_KEY` 등
