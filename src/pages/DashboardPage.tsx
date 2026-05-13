import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { FiBookOpen, FiHome, FiLoader, FiMusic, FiPlus, FiSearch, FiUser, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { generateVocab, searchLyrics, type MusicSearchResult } from "../api/lyrics";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import WebSidebar from "../layout/WebSidebar";
import { useWordStore } from "../store/useWordStore";
import AttendanceHeatmap from "../shared/components/AttendanceHeatmap";

type NavItem = {
  id: "dashboard" | "words" | "tracks" | "profile";
  label: string;
  path: string;
  icon: typeof FiHome;
};

type WordCard = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
};

type TrackCard = {
  id: number;
  title: string;
  artist: string;
  artwork: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "대시보드", path: "/dashboard", icon: FiHome },
  { id: "words", label: "단어장", path: "/words", icon: FiBookOpen },
  { id: "tracks", label: "트랙", path: "/tracks", icon: FiMusic },
  { id: "profile", label: "프로필", path: "/mypage", icon: FiUser },
];

export default function DashboardPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { fetchAppData } = useWordStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [lyricsQuery, setLyricsQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MusicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generateDoneId, setGenerateDoneId] = useState<number | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  return (
    <>
      {isMobile
        ? <MobileDashboard onOpenAddTrack={() => setShowAddModal(true)} />
        : <DesktopDashboard onOpenAddTrack={() => setShowAddModal(true)} />
      }
      {addModal}
    </>
  );
}

function DesktopDashboard({ onOpenAddTrack }: { onOpenAddTrack: () => void }) {
  const { user, dashboard, attendedDates, fetchAppData, checkAttendance, fetchMonthlyAttendance, getDashboardRecentWords, getDashboardRecentTracks } = useWordStore();

  useEffect(() => {
    fetchAppData();
    checkAttendance();
    const now = new Date();
    fetchMonthlyAttendance(now.getFullYear(), now.getMonth() + 1);
  }, [fetchAppData, checkAttendance, fetchMonthlyAttendance]);

  const recentWords: WordCard[] = useMemo(
    () =>
      getDashboardRecentWords(3).map((item) => ({
        id: item.id,
        word: item.word,
        meaning: item.meaning,
        partOfSpeech: item.partOfSpeech,
      })),
    [getDashboardRecentWords],
  );

  const recentTracks: TrackCard[] = useMemo(
    () =>
      getDashboardRecentTracks(3).map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: `linear-gradient(145deg, ${track.coverStart}, ${track.coverEnd})`,
      })),
    [getDashboardRecentTracks],
  );

  return (
    <DesktopLayout>
      <WebSidebar />
      <DesktopMain>
        <DesktopTopbar>
          <HeaderSpacer />
          <UserArea>
            <UserName>{user.name}</UserName>
            <Avatar aria-hidden>{user.avatarText}</Avatar>
          </UserArea>
        </DesktopTopbar>

        <DesktopContent>
          <Greeting>
            반갑습니다, {dashboard.greetingName}님! <span>👋</span>
          </Greeting>
          <Title>오늘의 학습 대시보드</Title>

          <StatGrid>
            <StatCard>
              <StatHead>
                <StatIcon tone="blue">
                  <FiBookOpen size={17} />
                </StatIcon>
                <StatLabel>수집된 단어</StatLabel>
              </StatHead>
              <StatValue>{dashboard.totalWords}</StatValue>
            </StatCard>
            <StatCard>
              <StatHead>
                <StatIcon tone="orange">
                  <FiMusic size={17} />
                </StatIcon>
                <StatLabel>수집된 트랙</StatLabel>
              </StatHead>
              <StatValue>{dashboard.totalTracks}</StatValue>
            </StatCard>
          </StatGrid>

          <Section>
            <AttendanceHeatmap attendedDates={attendedDates} />
          </Section>

          <Section>
            <SectionHead>
              <SectionTitle>최근에 수집한 단어</SectionTitle>
              <ViewAllLink href="#">전체보기</ViewAllLink>
            </SectionHead>

            <DesktopWordGrid>
              {recentWords.map((item) => (
                <WordCardBox key={item.id}>
                  <WordTop>
                    <WordName>{item.word}</WordName>
                    <PartBadge>{item.partOfSpeech}</PartBadge>
                  </WordTop>
                  <WordMeaning>{item.meaning}</WordMeaning>
                </WordCardBox>
              ))}
            </DesktopWordGrid>
          </Section>

          <Section>
            <SectionHead>
              <SectionTitle>최근에 수집한 트랙</SectionTitle>
              <SectionActions>
                <ViewAllLink href="#">전체보기</ViewAllLink>
                <AddTrackButton type="button" onClick={onOpenAddTrack}>
                  <FiPlus size={14} />
                  새 트랙 추가
                </AddTrackButton>
              </SectionActions>
            </SectionHead>

            <TrackList>
              {recentTracks.map((item) => (
                <TrackRow key={item.id}>
                  <TrackCore>
                    <TrackArt style={{ background: item.artwork }} />
                    <TrackInfo>
                      <TrackTitle>{item.title}</TrackTitle>
                      <TrackArtist>{item.artist}</TrackArtist>
                    </TrackInfo>
                  </TrackCore>
                </TrackRow>
              ))}
            </TrackList>
          </Section>
        </DesktopContent>
      </DesktopMain>
    </DesktopLayout>
  );
}

function MobileDashboard({ onOpenAddTrack }: { onOpenAddTrack: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, dashboard, attendedDates, fetchAppData, checkAttendance, fetchMonthlyAttendance, getDashboardRecentWords, getDashboardRecentTracks } = useWordStore();

  useEffect(() => {
    fetchAppData();
    checkAttendance();
    const now = new Date();
    fetchMonthlyAttendance(now.getFullYear(), now.getMonth() + 1);
  }, [fetchAppData, checkAttendance, fetchMonthlyAttendance]);

  const recentWords: WordCard[] = useMemo(
    () =>
      getDashboardRecentWords(2).map((item) => ({
        id: item.id,
        word: item.word,
        meaning: item.meaning,
        partOfSpeech: item.partOfSpeech,
      })),
    [getDashboardRecentWords],
  );

  const recentTracks: TrackCard[] = useMemo(
    () =>
      getDashboardRecentTracks(2).map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: `linear-gradient(145deg, ${track.coverStart}, ${track.coverEnd})`,
      })),
    [getDashboardRecentTracks],
  );

  const isActive = (id: NavItem["id"]) => {
    if (id === "words") return pathname.startsWith("/words");
    if (id === "tracks") return pathname.startsWith("/tracks");
    if (id === "dashboard") return pathname.startsWith("/dashboard");
    return pathname.startsWith("/mypage") || pathname.startsWith("/profile");
  };

  return (
    <MobileWrap>
      <MobileInner>
        <MobileHeader>
          <div>
            <Greeting>
              반갑습니다, {dashboard.greetingName}님! <span>👋</span>
            </Greeting>
            <Title mobile>오늘의 학습 대시보드</Title>
          </div>
          <Avatar aria-hidden>{user.avatarText}</Avatar>
        </MobileHeader>

        <MobileStatGrid>
          <StatCard>
            <StatHead>
              <StatIcon tone="blue">
                <FiBookOpen size={16} />
              </StatIcon>
              <StatLabel>수집된 단어</StatLabel>
            </StatHead>
            <StatValue mobile>{dashboard.totalWords}</StatValue>
          </StatCard>
          <StatCard>
            <StatHead>
              <StatIcon tone="orange">
                <FiMusic size={16} />
              </StatIcon>
              <StatLabel>수집된 트랙</StatLabel>
            </StatHead>
            <StatValue mobile>{dashboard.totalTracks}</StatValue>
          </StatCard>
        </MobileStatGrid>

        <Section>
          <AttendanceHeatmap attendedDates={attendedDates} compact />
        </Section>

        <Section>
          <SectionHead>
            <SectionTitle>최근에 수집한 단어</SectionTitle>
            <ViewAllLink href="#">전체보기</ViewAllLink>
          </SectionHead>
          <MobileWordList>
            {recentWords.map((item) => (
              <WordCardBox key={item.id}>
                <WordTop>
                  <WordName>{item.word}</WordName>
                  <PartBadge>{item.partOfSpeech}</PartBadge>
                </WordTop>
                <WordMeaning>{item.meaning}</WordMeaning>
              </WordCardBox>
            ))}
          </MobileWordList>
        </Section>

        <Section>
          <SectionHead>
            <SectionTitle>최근에 수집한 트랙</SectionTitle>
            <ViewAllLink href="#">전체보기</ViewAllLink>
          </SectionHead>
          <TrackList>
            {recentTracks.map((item) => (
              <TrackRow key={item.id}>
                <TrackCore>
                  <TrackArt style={{ background: item.artwork }} />
                  <TrackInfo>
                    <TrackTitle>{item.title}</TrackTitle>
                    <TrackArtist>{item.artist}</TrackArtist>
                  </TrackInfo>
                </TrackCore>
              </TrackRow>
            ))}
          </TrackList>
        </Section>

        <MobileAddTrackButton type="button" onClick={onOpenAddTrack}>
          <FiPlus size={18} />
          새 트랙 추가
        </MobileAddTrackButton>
      </MobileInner>

      <BottomNav>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavItem
              key={item.id}
              active={isActive(item.id)}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </BottomNavItem>
          );
        })}
      </BottomNav>
    </MobileWrap>
  );
}

const DesktopLayout = styled.div`
  height: 100dvh;
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
`;

const DesktopMain = styled.div`
  min-height: 0;
  display: grid;
  grid-template-rows: 86px minmax(0, 1fr);
`;

const DesktopTopbar = styled.div`
  height: 86px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderSpacer = styled.div`
  width: 300px;
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.color.text};
  font-weight: 700;
  font-size: 24px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: linear-gradient(145deg, #2a2f38, #13161d);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 19px;
  font-weight: 700;
`;

const DesktopContent = styled.main`
  padding: 16px 30px 24px;
  overflow-y: auto;
`;

const Greeting = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.blue};
  font-weight: 700;
  font-size: 14px;

  span {
    margin-left: 2px;
  }
`;

const Title = styled.h1<{ mobile?: boolean }>`
  margin: 8px 0 0;
  color: #061234;
  font-size: ${({ mobile }) => (mobile ? "18px" : "34px")};
  letter-spacing: -0.03em;
`;

const StatGrid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`;

const MobileStatGrid = styled(StatGrid)`
  margin-top: 16px;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const StatCard = styled.article`
  border-radius: 16px;
  border: 1px solid #e9eef5;
  background: ${({ theme }) => theme.color.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 14px 16px;
`;

const StatHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatIcon = styled.span<{ tone: "blue" | "orange" }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: ${({ tone }) => (tone === "blue" ? "#3c87ff" : "#ff8c18")};
  background: ${({ tone }) => (tone === "blue" ? "#eef5ff" : "#fff5e8")};
`;

const StatLabel = styled.span`
  color: #9ba8be;
  font-size: 12px;
  font-weight: 700;
`;

const StatValue = styled.p<{ mobile?: boolean }>`
  margin: 12px 0 0;
  color: #061234;
  font-size: ${({ mobile }) => (mobile ? "28px" : "34px")};
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const Section = styled.section`
  margin-top: 26px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #061234;
  font-size: 28px;
  letter-spacing: -0.03em;

  @media (max-width: 1023px) {
    font-size: 18px;
  }
`;

const ViewAllLink = styled.a`
  color: #91a3c7;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;

  @media (max-width: 1023px) {
    font-size: 14px;
  }
`;

const DesktopWordGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const MobileWordList = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const WordCardBox = styled.article`
  border-radius: 16px;
  border: 1px solid #e9eef5;
  background: ${({ theme }) => theme.color.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 14px 16px;
`;

const WordTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const WordName = styled.h3`
  margin: 0;
  color: #061234;
  font-size: 18px;
`;

const PartBadge = styled.span`
  min-width: 48px;
  text-align: center;
  border-radius: 8px;
  background: #e8fff5;
  color: ${({ theme }) => theme.color.blue};
  font-size: 12px;
  font-weight: 800;
  padding: 4px 9px;
`;

const WordMeaning = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.color.blue};
  font-size: 16px;
  font-weight: 800;
`;

const TrackList = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const TrackRow = styled.article`
  border-radius: 16px;
  border: 1px solid #e9eef5;
  background: ${({ theme }) => theme.color.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 10px 14px;
`;

const TrackCore = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const TrackArt = styled.div`
  width: 66px;
  height: 66px;
  border-radius: 10px;
  box-shadow: 0 8px 14px rgba(4, 28, 61, 0.12);
`;

const TrackInfo = styled.div`
  min-width: 0;
`;

const TrackTitle = styled.h3`
  margin: 0;
  color: #061234;
  font-size: 20px;
  line-height: 1.2;
`;

const TrackArtist = styled.p`
  margin: 4px 0 0;
  color: #7f8ca7;
  font-size: 14px;
`;

const MobileWrap = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.color.bg};
  padding: 22px 20px 86px;
`;

const MobileInner = styled.main`
  padding-bottom: 10px;
`;

const MobileHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const BottomNav = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  background: ${({ theme }) => theme.color.surface};
  border-top: 1px solid ${({ theme }) => theme.color.line};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  z-index: 20;
`;

const BottomNavItem = styled.button<{ active?: boolean }>`
  border: 0;
  background: transparent;
  color: ${({ theme, active }) => (active ? theme.color.blue : "#98a2b5")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: ${({ active }) => (active ? 700 : 600)};
  cursor: pointer;
`;

const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddTrackButton = styled.button`
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

const MobileAddTrackButton = styled.button`
  margin-top: 20px;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 0;
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;

  @media (max-width: 1023px) {
    padding: 20px 16px calc(20px + 72px);
  }
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
  overflow: hidden;

  @media (max-width: 1023px) {
    max-height: calc(100dvh - 40px - 72px);
    border-radius: 16px;
    padding: 20px 16px;
  }
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
  flex: 1;
  min-height: 0;
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

const LoadingIcon = styled(FiLoader)`
  animation: spin 0.85s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

