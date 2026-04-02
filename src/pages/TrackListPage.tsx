import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronsRight,
  FiList,
  FiLoader,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { generateVocab, searchLyrics, type MusicSearchResult } from "../api/lyrics";
import MobileShell from "../layout/MobileShell";
import WebShell from "../layout/WebShell";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import { useWordStore } from "../store/useWordStore";

type Platform = "youtube" | "spotify" | "apple";

const MOBILE_PAGE_SIZE = 4;
const DESKTOP_PAGE_SIZE = 4;

export default function TrackListPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [desktopPage, setDesktopPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lyricsQuery, setLyricsQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MusicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generateDoneId, setGenerateDoneId] = useState<number | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_PAGE_SIZE);
  const [mobileLoading, setMobileLoading] = useState(false);
  const mobileLoadTimerRef = useRef<number | null>(null);
  const mobileLoadAnchorRef = useRef<HTMLDivElement | null>(null);

  const {
    trackList,
    user,
    trackPlatformFilter,
    trackSortType,
    setTrackPlatformFilter,
    setTrackSortType,
    fetchAppData,
    getFilteredTracks,
  } = useWordStore();

  const handleLyricsSearch = useCallback(async () => {
    if (!lyricsQuery.trim() || isSearching) return;
    setIsSearching(true);
    setSearchResults([]);
    setSearchError(false);
    try {
      const results = await searchLyrics(lyricsQuery.trim());
      const raw = Array.isArray(results) ? results : [];
      const q = lyricsQuery.trim().toLowerCase();
      const sorted = [...raw].sort((a, b) => {
        const aName = a.trackName.toLowerCase();
        const bName = b.trackName.toLowerCase();
        const aIdx = aName.indexOf(q);
        const bIdx = bName.indexOf(q);
        if (aIdx !== bIdx) return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
        return aName.localeCompare(bName);
      });
      setSearchResults(sorted);
    } catch {
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  }, [lyricsQuery, isSearching]);

  const handleGenerate = useCallback(async (track: MusicSearchResult) => {
    if (generatingId !== null) return;
    setGeneratingId(track.id);
    setGenerateDoneId(null);
    setGenerateError(null);
    try {
      await generateVocab(track.id);
      setGenerateDoneId(track.id);
      window.setTimeout(() => {
        void fetchAppData();
        setShowAddModal(false);
        setLyricsQuery("");
        setSearchResults([]);
        setGenerateDoneId(null);
      }, 1200);
    } catch {
      setGenerateError("단어 추출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGeneratingId(null);
    }
  }, [generatingId, fetchAppData]);

  const closeAddModal = useCallback(() => {
    if (generatingId !== null) return;
    setShowAddModal(false);
    setLyricsQuery("");
    setSearchResults([]);
    setGenerateDoneId(null);
    setGenerateError(null);
    setSearchError(false);
  }, [generatingId]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const visibleTracks = useMemo(
    () => getFilteredTracks(query),
    [getFilteredTracks, query, trackList, trackPlatformFilter, trackSortType],
  );

  useEffect(() => {
    setDesktopPage(1);
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
    setMobileLoading(false);
  }, [query, trackPlatformFilter, trackSortType, isMobile]);

  const totalDesktopPages = Math.max(1, Math.ceil(visibleTracks.length / DESKTOP_PAGE_SIZE));
  const safeDesktopPage = Math.min(desktopPage, totalDesktopPages);
  const desktopStart = (safeDesktopPage - 1) * DESKTOP_PAGE_SIZE;

  const desktopTracks = visibleTracks.slice(desktopStart, desktopStart + DESKTOP_PAGE_SIZE);
  const mobileTracks = visibleTracks.slice(0, mobileVisibleCount);
  const hasMoreMobile = mobileVisibleCount < visibleTracks.length;

  useEffect(() => {
    return () => {
      if (mobileLoadTimerRef.current !== null) {
        window.clearTimeout(mobileLoadTimerRef.current);
      }
    };
  }, []);

  const handleLoadMoreMobile = useCallback(() => {
    if (mobileLoading || !hasMoreMobile) {
      return;
    }

    setMobileLoading(true);
    if (mobileLoadTimerRef.current !== null) {
      window.clearTimeout(mobileLoadTimerRef.current);
    }
    mobileLoadTimerRef.current = window.setTimeout(() => {
      setMobileVisibleCount((prev) =>
        Math.min(prev + MOBILE_PAGE_SIZE, visibleTracks.length),
      );
      setMobileLoading(false);
    }, 380);
  }, [hasMoreMobile, mobileLoading, visibleTracks.length]);

  useEffect(() => {
    if (!isMobile || !hasMoreMobile || mobileLoading) {
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
  }, [handleLoadMoreMobile, hasMoreMobile, isMobile, mobileLoading]);

  const shellProps = {
    query,
    onChangeQuery: setQuery,
    onAdd: () =>
      setTrackSortType((prev) =>
        prev === "latest" ? "words" : prev === "words" ? "title" : "latest",
      ),
  };

  const addModal = showAddModal ? (
    <ModalOverlay onClick={closeAddModal}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>새 트랙 추가</ModalTitle>
          <ModalCloseButton type="button" onClick={closeAddModal}>
            <FiX size={20} />
          </ModalCloseButton>
        </ModalHeader>

        <ModalSearchRow>
          <ModalInput
            value={lyricsQuery}
            onChange={(e) => setLyricsQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleLyricsSearch(); }}
            placeholder="곡 제목 또는 아티스트명으로 검색"
            autoFocus
          />
          <ModalSearchButton type="button" onClick={() => void handleLyricsSearch()} disabled={isSearching}>
            {isSearching ? <LoadingIcon size={16} /> : <FiSearch size={16} />}
          </ModalSearchButton>
        </ModalSearchRow>

        {generateError && (
          <ModalErrorText>{generateError}</ModalErrorText>
        )}

        <ModalResultList>
          {searchError && (
            <ModalEmptyText error>검색 중 오류가 발생했습니다. 다시 시도해주세요.</ModalEmptyText>
          )}
          {!searchError && searchResults.length === 0 && !isSearching && lyricsQuery.trim() && (
            <ModalEmptyText>검색 결과가 없습니다.</ModalEmptyText>
          )}
          {searchResults.map((track) => (
            <ModalResultItem key={track.id}>
              <ModalResultInfo>
                <ModalResultTitle>{track.trackName}</ModalResultTitle>
                <ModalResultArtist>{track.artistName}</ModalResultArtist>
              </ModalResultInfo>
              <ModalGenerateButton
                type="button"
                done={generateDoneId === track.id}
                onClick={() => void handleGenerate(track)}
                disabled={generatingId !== null}
              >
                {generateDoneId === track.id ? "완료!" : generatingId === track.id ? (
                  <LoadingIcon size={14} />
                ) : "단어 추출"}
              </ModalGenerateButton>
            </ModalResultItem>
          ))}
        </ModalResultList>
      </ModalBox>
    </ModalOverlay>
  ) : null;

  return isMobile ? (
    <>
    <MobileShell
      title="최근 캡처된 곡"
      totalCount={visibleTracks.length}
      actionLabel={
        trackSortType === "latest"
          ? "최신순"
          : trackSortType === "words"
            ? "단어수"
            : "제목순"
      }
      {...shellProps}
    >
      <MobileToolbar>
        <Chip active={trackPlatformFilter === "ALL"} onClick={() => setTrackPlatformFilter("ALL")}>전체</Chip>
        <Chip active={trackPlatformFilter === "YOUTUBE"} onClick={() => setTrackPlatformFilter("YOUTUBE")}>YouTube</Chip>
        <Chip active={trackPlatformFilter === "SPOTIFY"} onClick={() => setTrackPlatformFilter("SPOTIFY")}>Spotify</Chip>
        <Chip active={trackPlatformFilter === "APPLE"} onClick={() => setTrackPlatformFilter("APPLE")}>Apple</Chip>
        <MobileAddButton type="button" onClick={() => setShowAddModal(true)}>
          <FiPlus size={15} />
          새 트랙
        </MobileAddButton>
      </MobileToolbar>

      <MobileSortTabs>
        <SortLabel>
          <FiList size={14} /> SORT BY
        </SortLabel>
        <SortTab active={trackSortType === "latest"} onClick={() => setTrackSortType("latest")}>최신순</SortTab>
        <SortTab active={trackSortType === "words"} onClick={() => setTrackSortType("words")}>단어수</SortTab>
        <SortTab active={trackSortType === "title"} onClick={() => setTrackSortType("title")}>제목순</SortTab>
      </MobileSortTabs>

      <TrackList mobile>
        {mobileTracks.map((track) => (
          <TrackCard key={track.id} mobile clickable onClick={() => navigate(`/words?trackId=${track.id}`)}>
            <TrackMain>
              <Cover style={{ background: `linear-gradient(135deg, ${track.coverStart}, ${track.coverEnd})` }}>
                {track.title.slice(0, 2).toUpperCase()}
              </Cover>
              <MetaBlock>
                <CardTop>
                  <Name>{track.title} - {track.artist}</Name>
                  <PlatformBadge platform={track.platform}>{platformLabel(track.platform)}</PlatformBadge>
                </CardTop>
                <TrackMeta>
                  <span>캡처 {track.capturedAt}</span>
                  <b>단어 {track.extractedWords}개</b>
                </TrackMeta>
              </MetaBlock>
            </TrackMain>
          </TrackCard>
        ))}
      </TrackList>

      <Pagination mobile>
        <LoadMoreButton
          type="button"
          onClick={handleLoadMoreMobile}
          disabled={!hasMoreMobile || mobileLoading}
        >
          {mobileLoading ? (
            <>
              <LoadingIcon size={15} />
              불러오는 중...
            </>
          ) : hasMoreMobile ? (
            "더 보기"
          ) : (
            "모든 트랙을 불러왔습니다"
          )}
        </LoadMoreButton>
      </Pagination>
      <MobileLoadAnchor ref={mobileLoadAnchorRef} aria-hidden />
    </MobileShell>
    {addModal}
    </>
  ) : (
    <>
    <WebShell userName={user.name} {...shellProps}>
      <Content>
        <HeaderRow>
          <div>
            <Title>트랙 목록</Title>
            <Subtitle>
              학습을 위해 캡처된 음악 로그입니다. 총 <b>{visibleTracks.length}</b>개의 트랙이 있습니다.
            </Subtitle>
          </div>
          <HeaderSortButton
            type="button"
            onClick={() =>
              setTrackSortType((prev) =>
                prev === "latest" ? "words" : prev === "words" ? "title" : "latest",
              )
            }
          >
            <span>{trackSortType === "latest" ? "최신순" : trackSortType === "words" ? "단어수" : "제목순"}</span>
            <FiChevronDown size={16} />
          </HeaderSortButton>
        </HeaderRow>

        <FilterRow>
          <FilterGroup>
            <FilterTitle>플랫폼</FilterTitle>
            <Chip active={trackPlatformFilter === "ALL"} onClick={() => setTrackPlatformFilter("ALL")}>전체</Chip>
            <Chip active={trackPlatformFilter === "YOUTUBE"} onClick={() => setTrackPlatformFilter("YOUTUBE")}>YouTube</Chip>
            <Chip active={trackPlatformFilter === "SPOTIFY"} onClick={() => setTrackPlatformFilter("SPOTIFY")}>Spotify</Chip>
            <Chip active={trackPlatformFilter === "APPLE"} onClick={() => setTrackPlatformFilter("APPLE")}>Apple</Chip>
          </FilterGroup>
          <AddTrackButton type="button" onClick={() => setShowAddModal(true)}>
            <FiPlus size={15} />
            새 트랙 추가
          </AddTrackButton>
        </FilterRow>

        <TrackList>
          {desktopTracks.map((track) => (
            <TrackCard key={track.id} clickable onClick={() => navigate(`/words?trackId=${track.id}`)}>
              <TrackMain>
                <Cover style={{ background: `linear-gradient(135deg, ${track.coverStart}, ${track.coverEnd})` }}>
                  {track.title.slice(0, 2).toUpperCase()}
                </Cover>
                <MetaBlock>
                  <CardTop>
                    <Name>{track.title} - {track.artist}</Name>
                    <WebPlatformBadge platform={track.platform} multiline={track.platform === "apple"}>
                      {track.platform === "apple" ? (
                        <>
                          <span>APPLE</span>
                          <span>MUSIC</span>
                        </>
                      ) : (
                        webPlatformLabel(track.platform)
                      )}
                    </WebPlatformBadge>
                  </CardTop>
                  <TrackMeta>
                    <span>캡처 {track.capturedAt}</span>
                    <b>단어 {track.extractedWords}개</b>
                    <Source
                      href={track.source}
                      onClick={(event) => event.stopPropagation()}
                    >
                      소스 링크
                    </Source>
                  </TrackMeta>
                </MetaBlock>
              </TrackMain>
            </TrackCard>
          ))}
        </TrackList>

        <Pagination desktopSticky>
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
      </Content>
    </WebShell>
    {addModal}
    </>
  );
}

function platformLabel(platform: Platform) {
  if (platform === "youtube") return "YOUTUBE";
  if (platform === "spotify") return "SPOTIFY";
  return "APPLE";
}

function webPlatformLabel(platform: Platform) {
  if (platform === "youtube") return "YOUTUBE";
  if (platform === "spotify") return "SPOTIFY";
  return "APPLE MUSIC";
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

const HeaderSortButton = styled.button`
  border: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  padding: 0 14px;
  height: 38px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
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
  border: 1px solid ${({ theme, active }) => (active ? theme.color.chipActive : theme.color.line)};
  background: ${({ theme, active }) => (active ? theme.color.chipActive : theme.color.surface)};
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

const TrackList = styled.div<{ mobile?: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ mobile }) => (mobile ? "12px" : "10px")};
`;

const TrackCard = styled.article<{ mobile?: boolean; clickable?: boolean }>`
  border-radius: 14px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ mobile }) => (mobile ? "16px" : "14px")};
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
`;

const TrackMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Cover = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
`;

const MetaBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const PlatformBadge = styled.span<{ platform: Platform }>`
  min-width: 68px;
  text-align: center;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 800;
  color: ${({ platform }) => {
    if (platform === "youtube") return "#ff2f2f";
    if (platform === "spotify") return "#08a962";
    return "#e10087";
  }};
  background: ${({ platform }) => {
    if (platform === "youtube") return "#fff0f1";
    if (platform === "spotify") return "#edfef5";
    return "#ffeff8";
  }};
`;

const WebPlatformBadge = styled.span<{ platform: Platform; multiline?: boolean }>`
  min-width: ${({ multiline }) => (multiline ? "58px" : "66px")};
  min-height: ${({ multiline }) => (multiline ? "36px" : "22px")};
  padding: ${({ multiline }) => (multiline ? "4px 8px" : "0 10px")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${({ multiline }) => (multiline ? "column" : "row")};
  gap: ${({ multiline }) => (multiline ? "2px" : "0")};
  border-radius: 6px;
  border: 1px solid ${({ platform }) => {
    if (platform === "youtube") return "#ffd9dd";
    if (platform === "spotify") return "#d9f9e7";
    return "#ffd7ef";
  }};
  color: ${({ platform }) => {
    if (platform === "youtube") return "#ff2f2f";
    if (platform === "spotify") return "#08a962";
    return "#e10087";
  }};
  background: ${({ platform }) => {
    if (platform === "youtube") return "#fff7f8";
    if (platform === "spotify") return "#f2fef7";
    return "#fff5fb";
  }};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
`;

const TrackMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  color: #8f9bb2;
  font-size: 13px;

  b {
    color: ${({ theme }) => theme.color.blue};
    font-size: 14px;
  }

  @media (max-width: 1023px) {
    justify-content: space-between;
    gap: 10px;
  }
`;

const Source = styled.a`
  margin-left: auto;
  color: #7f8aa2;
  text-decoration: underline;
  white-space: nowrap;
`;

const Pagination = styled.div<{ mobile?: boolean; desktopSticky?: boolean }>`
  margin: ${({ mobile }) => (mobile ? "24px 0 112px" : "14px 0 0")};
  display: flex;
  justify-content: center;
  gap: 10px;

  ${({ desktopSticky, mobile, theme }) =>
    desktopSticky && !mobile
      ? `
    position: sticky;
    bottom: 0;
    padding-top: 10px;
    background: ${theme.color.bg};
    z-index: 2;
  `
      : ""}
`;

const PageBtn = styled.button<{ active?: boolean; icon?: boolean }>`
  width: ${({ icon }) => (icon ? "42px" : "40px")};
  height: 40px;
  border: 1px solid ${({ theme, active }) => (active ? theme.color.blue : theme.color.line)};
  border-radius: 12px;
  background: ${({ theme, active }) => (active ? theme.color.blue : theme.color.surface)};
  color: ${({ active }) => (active ? "#fff" : "#5f6d87")};
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const LoadMoreButton = styled.button`
  min-width: 180px;
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
  padding: 0 14px;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: default;
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

const AddTrackButton = styled.button`
  margin-left: auto;
  height: 30px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.blue};
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
`;

const MobileAddButton = styled.button`
  height: 42px;
  border-radius: 13px;
  border: 1px solid ${({ theme }) => theme.color.blue};
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.color.bg};
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80dvh;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
`;

const ModalCloseButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.subtext};
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 4px;
`;

const ModalSearchRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ModalInput = styled.input`
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  padding: 0 14px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const ModalSearchButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 0;
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: 0 0 auto;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ModalResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 320px;
`;

const ModalEmptyText = styled.p<{ error?: boolean }>`
  margin: 0;
  color: ${({ theme, error }) => (error ? "#d93025" : theme.color.subtext)};
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
`;

const ModalErrorText = styled.p`
  margin: 0;
  color: #d93025;
  background: #fff2f2;
  border: 1px solid #ffd5d5;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
`;

const ModalResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.surface};
`;

const ModalResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModalResultTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModalResultArtist = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.color.subtext};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModalGenerateButton = styled.button<{ done?: boolean }>`
  height: 32px;
  min-width: 72px;
  border-radius: 8px;
  border: 0;
  background: ${({ done, theme }) => (done ? "#00b574" : theme.color.blue)};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
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
  border-bottom: 3px solid ${({ theme, active }) => (active ? theme.color.blue : "transparent")};
  margin-bottom: -1px;
  cursor: pointer;
`;
