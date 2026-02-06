import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import {
  FiChevronLeft,
  FiChevronsRight,
  FiList,
  FiLoader,
  FiMusic,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileShell from "./layout/MobileShell";
import WebShell from "./layout/WebShell";
import { useMediaQuery } from "./shared/hooks/useMediaQueryl";
import { useWordStore } from "./store/useWordStore";

type WordItem = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  artist: string;
  song: string;
  frequency: number;
  addedAt: string;
  language: "ENGLISH" | "JAPANESE" | "KOREAN";
};

type TrackItem = {
  id: number;
  title: string;
  artist: string;
  capturedAt: string;
  extractedWords: number;
  source: string;
  platform: "youtube" | "spotify" | "apple";
  coverStart: string;
  coverEnd: string;
};

const MOBILE_PAGE_SIZE = 3;

function App() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [desktopPage, setDesktopPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_PAGE_SIZE);
  const [mobileLoading, setMobileLoading] = useState(false);
  const mobileLoadTimerRef = useRef<number | null>(null);
  const mobileLoadAnchorRef = useRef<HTMLDivElement | null>(null);

  const {
    wordList,
    trackList,
    query,
    sortType,
    language,
    user,
    setQuery,
    setSortType,
    setLanguage,
    fetchAppData,
  } = useWordStore();

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const selectedTrackId = useMemo(() => {
    const raw = searchParams.get("trackId");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed)) {
      return null;
    }

    return parsed;
  }, [searchParams]);

  const selectedTrack = useMemo(() => {
    if (selectedTrackId === null) {
      return null;
    }

    return trackList.find((track) => track.id === selectedTrackId) ?? null;
  }, [selectedTrackId, trackList]);

  const trackScopedWords = useMemo(() => {
    if (!selectedTrack) {
      return wordList;
    }

    return wordList.filter((item) => wordBelongsToTrack(item, selectedTrack));
  }, [selectedTrack, wordList]);

  const visibleWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let filtered = normalizedQuery
      ? trackScopedWords.filter(
          (item) =>
            item.word.toLowerCase().includes(normalizedQuery) ||
            item.meaning.toLowerCase().includes(normalizedQuery) ||
            item.artist.toLowerCase().includes(normalizedQuery),
        )
      : trackScopedWords;

    if (!selectedTrack && language !== "ALL") {
      filtered = filtered.filter((item) => item.language === language);
    }

    if (sortType === "alphabet") {
      return [...filtered].sort((a, b) => a.word.localeCompare(b.word));
    }

    if (sortType === "frequency") {
      return [...filtered].sort((a, b) => b.frequency - a.frequency);
    }

    return [...filtered].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }, [trackScopedWords, query, selectedTrack, language, sortType]);

  const totalWordCount = selectedTrack ? trackScopedWords.length : wordList.length;

  const desktopPageSize = 6;
  const totalDesktopPages = Math.max(1, Math.ceil(visibleWords.length / desktopPageSize));

  useEffect(() => {
    setDesktopPage(1);
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
    setMobileLoading(false);
  }, [query, sortType, language, isMobile, selectedTrackId]);

  const safeDesktopPage = useMemo(() => {
    return Math.min(desktopPage, totalDesktopPages);
  }, [desktopPage, totalDesktopPages]);

  useEffect(() => {
    if (desktopPage !== safeDesktopPage) {
      setDesktopPage(safeDesktopPage);
    }
  }, [desktopPage, safeDesktopPage]);

  useEffect(() => {
    return () => {
      if (mobileLoadTimerRef.current !== null) {
        window.clearTimeout(mobileLoadTimerRef.current);
      }
    };
  }, []);

  const desktopStartIndex = (safeDesktopPage - 1) * desktopPageSize;
  const desktopWords = visibleWords.slice(
    desktopStartIndex,
    desktopStartIndex + desktopPageSize,
  );
  const mobileWords = visibleWords.slice(0, mobileVisibleCount);
  const pageWords = isMobile ? mobileWords : desktopWords;
  const hasMoreMobileWords = mobileVisibleCount < visibleWords.length;

  const handleLoadMoreMobile = useCallback(() => {
    if (mobileLoading || !hasMoreMobileWords) {
      return;
    }

    setMobileLoading(true);
    if (mobileLoadTimerRef.current !== null) {
      window.clearTimeout(mobileLoadTimerRef.current);
    }
    mobileLoadTimerRef.current = window.setTimeout(() => {
      setMobileVisibleCount((prev) =>
        Math.min(prev + MOBILE_PAGE_SIZE, visibleWords.length),
      );
      setMobileLoading(false);
    }, 380);
  }, [hasMoreMobileWords, mobileLoading, visibleWords.length]);

  useEffect(() => {
    if (!isMobile || !hasMoreMobileWords || mobileLoading) {
      return;
    }

    const anchor = mobileLoadAnchorRef.current;
    if (!anchor) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          handleLoadMoreMobile();
        }
      },
      {
        root: null,
        rootMargin: "120px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [handleLoadMoreMobile, hasMoreMobileWords, isMobile, mobileLoading]);

  const shellProps = {
    query,
    onChangeQuery: setQuery,
  };

  return isMobile ? (
    <MobileShell
      title={selectedTrack ? "단어장" : "단어장 목록"}
      totalCount={totalWordCount}
      {...shellProps}
    >
      {!selectedTrack ? (
        <MobileToolbar>
          <Chip active={language === "ALL"} onClick={() => setLanguage("ALL")}>전체</Chip>
          <Chip active={language === "ENGLISH"} onClick={() => setLanguage("ENGLISH")}>영어</Chip>
          <Chip active={language === "JAPANESE"} onClick={() => setLanguage("JAPANESE")}>일본어</Chip>
          <Chip active={language === "KOREAN"} onClick={() => setLanguage("KOREAN")}>한국어</Chip>
        </MobileToolbar>
      ) : null}

      {selectedTrack ? <TrackSummaryCard track={selectedTrack} mobile /> : null}

      <MobileSortTabs>
        <SortLabel>
          <FiList size={14} /> SORT BY
        </SortLabel>
        <SortTab onClick={() => setSortType("latest")} active={sortType === "latest"}>최신순</SortTab>
        <SortTab onClick={() => setSortType("frequency")} active={sortType === "frequency"}>빈도순</SortTab>
        <SortTab onClick={() => setSortType("alphabet")} active={sortType === "alphabet"}>알파벳순</SortTab>
      </MobileSortTabs>

      <WordGrid mobile>
        {pageWords.map((item) => (
          <WordCard key={item.id} item={item} mobile onClick={() => navigate(`/words/${item.id}`)} />
        ))}
      </WordGrid>

      <Pagination mobile>
        <LoadMoreButton onClick={handleLoadMoreMobile} disabled={!hasMoreMobileWords || mobileLoading}>
          {mobileLoading ? (
            <>
              <LoadingIcon size={15} />
              불러오는 중...
            </>
          ) : hasMoreMobileWords ? (
            "더 보기"
          ) : (
            "모든 단어를 불러왔습니다"
          )}
        </LoadMoreButton>
      </Pagination>
      <MobileLoadAnchor ref={mobileLoadAnchorRef} aria-hidden />
      <HelpButton mobile>?</HelpButton>
    </MobileShell>
  ) : (
    <WebShell userName={user.name} onAdd={() => undefined} {...shellProps}>
      <Content>
        <HeaderRow>
          <div>
            <Title>단어장</Title>
            <Subtitle>
              {selectedTrack ? (
                <>
                  선택한 트랙에서 추출된 단어입니다. 총 <b>{totalWordCount}</b>개의 단어가 저장되어 있습니다.
                </>
              ) : (
                <>
                  노래 가사에서 수집한 단어를 학습해보세요. 총 <b>{totalWordCount}</b>개의 단어가 등록되어 있습니다.
                </>
              )}
            </Subtitle>
          </div>
        </HeaderRow>

        {selectedTrack ? <TrackSummaryCard track={selectedTrack} /> : null}

        <FilterRow>
          {!selectedTrack ? (
            <>
              <FilterGroup>
                <FilterTitle>언어</FilterTitle>
                <Chip active={language === "ALL"} onClick={() => setLanguage("ALL")}>전체</Chip>
                <Chip active={language === "ENGLISH"} onClick={() => setLanguage("ENGLISH")}>영어</Chip>
                <Chip active={language === "JAPANESE"} onClick={() => setLanguage("JAPANESE")}>일본어</Chip>
                <Chip active={language === "KOREAN"} onClick={() => setLanguage("KOREAN")}>한국어</Chip>
              </FilterGroup>
              <FilterGroup>
                <FilterTitle>기간</FilterTitle>
                <Chip>최근 7일</Chip>
                <Chip>최근 30일</Chip>
              </FilterGroup>
            </>
          ) : null}
          <DesktopControls>
            <SortSelect>
              <FiList size={16} />
              <span>정렬</span>
            </SortSelect>
            <Pagination inline>
              <PageBtn icon onClick={() => setDesktopPage((prev) => Math.max(1, prev - 1))} disabled={safeDesktopPage === 1}>
                <FiChevronLeft size={18} />
              </PageBtn>
              {Array.from({ length: totalDesktopPages }, (_, idx) => idx + 1).map((page) => (
                <PageBtn key={page} active={safeDesktopPage === page} onClick={() => setDesktopPage(page)}>
                  {page}
                </PageBtn>
              ))}
              <PageBtn
                icon
                onClick={() => setDesktopPage((prev) => Math.min(totalDesktopPages, prev + 1))}
                disabled={safeDesktopPage === totalDesktopPages}
              >
                <FiChevronsRight size={18} />
              </PageBtn>
            </Pagination>
          </DesktopControls>
        </FilterRow>

        <WordGrid>
          {pageWords.map((item) => (
            <WordCard key={item.id} item={item} onClick={() => navigate(`/words/${item.id}`)} />
          ))}
        </WordGrid>

      </Content>
      <HelpButton>?</HelpButton>
    </WebShell>
  );
}

function wordBelongsToTrack(item: WordItem, track: TrackItem) {
  const song = item.song.trim().toLowerCase();
  const artist = item.artist.trim().toLowerCase();
  const trackTitle = track.title.trim().toLowerCase();
  const trackArtist = track.artist.trim().toLowerCase();

  return song === trackTitle && artist === trackArtist;
}

function TrackSummaryCard(props: { track: TrackItem; mobile?: boolean }) {
  const { track, mobile = false } = props;

  return (
    <SelectedTrackCard mobile={mobile}>
      <SelectedTrackMain>
        <SelectedCover style={{ background: `linear-gradient(135deg, ${track.coverStart}, ${track.coverEnd})` }}>
          {track.title.slice(0, 2).toUpperCase()}
        </SelectedCover>
        <SelectedMeta>
          <SelectedTitle>{track.title} - {track.artist}</SelectedTitle>
          <SelectedInfo>
            <span>캡처 {track.capturedAt}</span>
            <b>단어 {track.extractedWords}개</b>
          </SelectedInfo>
        </SelectedMeta>
      </SelectedTrackMain>
    </SelectedTrackCard>
  );
}

function WordCard(props: { item: WordItem; mobile?: boolean; onClick?: () => void }) {
  const { item, mobile = false, onClick } = props;

  return (
    <Card mobile={mobile} clickable={Boolean(onClick)} onClick={onClick}>
      <CardHead>
        <Word>{item.word}</Word>
        <Badge>{item.partOfSpeech}</Badge>
      </CardHead>
      <Meaning>{item.meaning}</Meaning>

      <TrackRow>
        <FiMusic size={16} />
        <span>
          {item.song} - {item.artist}
        </span>
      </TrackRow>

      <Meta>
        <span>
          빈도 <b>{item.frequency}</b>
        </span>
        <span>
          추가 <b>{item.addedAt}</b>
        </span>
      </Meta>
    </Card>
  );
}

const Content = styled.main`
  padding: 16px 24px 20px;

  @media (max-width: 1023px) {
    padding: 0;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 34px;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.color.subtext};
  font-size: 14px;

  b {
    color: ${({ theme }) => theme.color.blue};
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterTitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.subtext};
`;

const Chip = styled.button<{ active?: boolean }>`
  height: 30px;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.color.chipActive : theme.color.line};
  background: ${({ theme, active }) =>
    active ? theme.color.chipActive : theme.color.surface};
  color: ${({ theme, active }) => (active ? "#fff" : theme.color.text)};
  padding: 0 11px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex: 0 0 auto;

  @media (max-width: 1023px) {
    height: 42px;
    border-radius: 13px;
    padding: 0 16px;
    font-size: 14px;
  }
`;

const SortSelect = styled.button`
  height: 30px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  padding: 0 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const DesktopControls = styled.div`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const SelectedTrackCard = styled.article<{ mobile?: boolean }>`
  border-radius: 14px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ mobile }) => (mobile ? "14px" : "16px")};
  margin-bottom: 14px;
`;

const SelectedTrackMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectedCover = styled.div`
  width: 78px;
  height: 78px;
  border-radius: 12px;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 15px;
`;

const SelectedMeta = styled.div`
  min-width: 0;
`;

const SelectedTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 32px;

  @media (max-width: 1023px) {
    font-size: 22px;
  }
`;

const SelectedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  color: #8f9bb2;
  font-size: 14px;

  b {
    color: ${({ theme }) => theme.color.blue};
    font-size: 14px;
  }

  @media (max-width: 1023px) {
    font-size: 12px;

    b {
      font-size: 12px;
    }
  }
`;

const WordGrid = styled.div<{ mobile?: boolean }>`
  display: grid;
  grid-template-columns: ${({ mobile }) =>
    mobile ? "1fr" : "repeat(3, minmax(0, 1fr))"};
  gap: 12px;

  @media (max-width: 1400px) {
    grid-template-columns: ${({ mobile }) =>
      mobile ? "1fr" : "repeat(2, minmax(0, 1fr))"};
  }

  @media (max-width: 1023px) {
    gap: 22px;
  }
`;

const Card = styled.article<{ mobile?: boolean; clickable?: boolean }>`
  position: relative;
  border-radius: 14px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ mobile }) => (mobile ? "22px 20px" : "21px")};
  min-height: ${({ mobile }) => (mobile ? "208px" : "231px")};
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Word = styled.h2`
  margin: 0;
  font-size: 30px;
`;

const Badge = styled.span`
  min-width: 42px;
  text-align: center;
  border-radius: 8px;
  background: #e8fff5;
  color: ${({ theme }) => theme.color.blue};
  font-size: 18px;
  font-weight: 700;
  padding: 6px 10px;
`;

const Meaning = styled.p`
  margin: 10px 0 15px;
  color: ${({ theme }) => theme.color.blue};
  font-size: 21px;
  font-weight: 700;
`;

const TrackRow = styled.div`
  height: 45px;
  border-radius: 8px;
  background: #f7f9fc;
  color: #95a0b6;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin-bottom: 15px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #9aa4b8;
  font-size: 16px;

  b {
    color: #10162c;
    margin-left: 3px;
  }
`;

const Pagination = styled.div<{ mobile?: boolean; inline?: boolean }>`
  margin: ${({ mobile, inline }) => (inline ? "0" : mobile ? "24px 0 112px" : "14px 0 0")};
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const PageBtn = styled.button<{ active?: boolean; icon?: boolean }>`
  width: ${({ icon }) => (icon ? "42px" : "40px")};
  height: 40px;
  border: 1px solid
    ${({ theme, active }) => (active ? theme.color.blue : theme.color.line)};
  border-radius: 12px;
  background: ${({ theme, active }) =>
    active ? theme.color.blue : theme.color.surface};
  color: ${({ active }) => (active ? "#fff" : "#5f6d87")};
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const LoadMoreButton = styled.button`
  min-width: 160px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.surface};
  color: #5f6d87;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 14px;

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const LoadingIcon = styled(FiLoader)`
  animation: spin 0.85s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const MobileLoadAnchor = styled.div`
  width: 100%;
  height: 1px;
`;

const MobileToolbar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 10px;
  margin-bottom: 10px;
`;

const MobileSortTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.color.line};
  margin-bottom: 14px;
`;

const SortLabel = styled.div`
  color: #a3aec0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
`;

const SortTab = styled.button<{ active?: boolean }>`
  border: 0;
  background: transparent;
  color: ${({ theme, active }) => (active ? theme.color.blue : "#8994aa")};
  padding: 0 0 10px;
  font-size: 15px;
  font-weight: ${({ active }) => (active ? 700 : 600)};
  border-bottom: 3px solid
    ${({ theme, active }) => (active ? theme.color.blue : "transparent")};
  margin-bottom: -1px;
  cursor: pointer;
`;

const HelpButton = styled.button<{ mobile?: boolean }>`
  position: fixed;
  right: 20px;
  bottom: ${({ mobile }) => (mobile ? "84px" : "20px")};
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 0;
  background: linear-gradient(145deg, #0f203f, #041028);
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(1, 10, 34, 0.3);
`;

export default App;
