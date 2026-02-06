import { useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { FiBookOpen, FiHome, FiMusic, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import WebSidebar from "../layout/WebSidebar";
import { useWordStore } from "../store/useWordStore";

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

  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}

function DesktopDashboard() {
  const { user, dashboard, fetchAppData, getDashboardRecentWords, getDashboardRecentTracks } = useWordStore();

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

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
        </DesktopContent>
      </DesktopMain>
    </DesktopLayout>
  );
}

function MobileDashboard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, dashboard, fetchAppData, getDashboardRecentWords, getDashboardRecentTracks } = useWordStore();

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

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

