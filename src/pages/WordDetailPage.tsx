import { useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import {
  FiBookmark,
  FiChevronLeft,
  FiMoreVertical,
  FiPlay,
  FiVolume2,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import MobileBottomNav from "../layout/MobileBottomNav";
import WebSidebar from "../layout/WebSidebar";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import { useWordStore } from "../store/useWordStore";

type LyricsExample = {
  id: number;
  artist: string;
  song: string;
  lyric: string;
  release: string;
};

type SynonymExample = {
  id: number;
  word: string;
  meaning: string;
  note: string;
};

type RelatedTrack = {
  id: number;
  title: string;
  artist: string;
  colorA: string;
  colorB: string;
};

function highlightWord(text: string, word: string) {
  if (!word.trim()) {
    return text;
  }

  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, idx) =>
    part.toLowerCase() === word.toLowerCase() ? (
      <Highlight key={`${part}-${idx}`}>{part}</Highlight>
    ) : (
      part
    ),
  );
}

export default function WordDetailPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const navigate = useNavigate();
  const { wordId } = useParams();

  const { wordList, fetchAppData } = useWordStore();

  useEffect(() => {
    if (wordList.length === 0) {
      fetchAppData();
    }
  }, [fetchAppData, wordList.length]);

  const word = useMemo(
    () => wordList.find((item) => String(item.id) === wordId),
    [wordId, wordList],
  );

  if (!word) {
    return (
      <FallbackWrap>
        <h1>단어를 찾을 수 없습니다.</h1>
        <BackTextButton onClick={() => navigate("/")}>목록으로 돌아가기</BackTextButton>
      </FallbackWrap>
    );
  }

  const lyricsExamples: LyricsExample[] = [
    {
      id: 1,
      artist: word.artist,
      song: word.song,
      lyric: `It's the ${word.word} of just you and me`,
      release: "2025.03",
    },
    {
      id: 2,
      artist: "Taylor Swift",
      song: "Invisible String",
      lyric: `Isn't it just so pretty to think that all along there was some invisible string tying you to ${word.word}?`,
      release: "2025.02",
    },
  ];

  const synonymMap: Record<string, string[]> = {
    serendipity: ["chance", "fortune", "fluke"],
    euphoria: ["elation", "joy", "bliss"],
    epiphany: ["insight", "realization", "revelation"],
    persona: ["image", "identity", "character"],
    lonely: ["solitary", "isolated", "lonesome"],
    bloom: ["flourish", "blossom", "thrive"],
    paradise: ["heaven", "utopia", "eden"],
    unstoppable: ["invincible", "relentless", "untiring"],
  };

  const apiSynonyms = Array.isArray(word.synonyms) ? word.synonyms : [];
  const baseSynonyms =
    apiSynonyms.length > 0
      ? apiSynonyms
      : (synonymMap[word.word.toLowerCase()] ?? ["similar", "related", "equivalent"]);

  const synonyms: SynonymExample[] = baseSynonyms.map((item, idx) => ({
    id: idx + 1,
    word: item,
    meaning: `${word.meaning}와(과) 유사한 뉘앙스`,
    note: `${word.partOfSpeech} · 유의어`,
  }));

  const relatedTracks: RelatedTrack[] = [
    {
      id: 1,
      title: "Happy Accident",
      artist: "Brent Morgan",
      colorA: "#23c483",
      colorB: "#008f5a",
    },
    {
      id: 2,
      title: "Lucky Find",
      artist: "Sofia Clare",
      colorA: "#57d7a8",
      colorB: "#1f8a63",
    },
  ];

  const pronunciation = `/${word.word.toLowerCase()}/`;
  const addedAtDate = /^\d{4}\.\d{2}$/.test(word.addedAt)
    ? `${word.addedAt}.15`
    : word.addedAt;

  const content = (
    <Content mobile={isMobile}>
      <WordType>{word.partOfSpeech}</WordType>
      <WordRow>
        <Word>{word.word}</Word>
        <SoundButton>
          <FiVolume2 size={26} />
        </SoundButton>
      </WordRow>
      <Pronunciation>{pronunciation}</Pronunciation>
      <Meaning>{word.meaning}</Meaning>

      <Section>
        <SectionTitle>유의어</SectionTitle>
        <ExampleList>
          {synonyms.map((synonym) => (
            <ExampleCard key={synonym.id}>
              <Artwork />
              <ExampleBody>
                <ExampleMeta>
                  <strong>{synonym.word}</strong>
                  <span>{synonym.note}</span>
                </ExampleMeta>
                <ExampleLine>{highlightWord(synonym.meaning, word.word)}</ExampleLine>
                <ExampleRelease>단어 기반 추천</ExampleRelease>
              </ExampleBody>
              <PlayButton>
                <FiPlay size={14} />
              </PlayButton>
            </ExampleCard>
          ))}
        </ExampleList>
      </Section>

      <Section>
        <SectionTitle>가사 예문</SectionTitle>
        <ExampleList>
          {lyricsExamples.map((example) => (
            <ExampleCard key={example.id}>
              <Artwork />
              <ExampleBody>
                <ExampleMeta>
                  <strong>{example.artist}</strong>
                  <span>{example.song}</span>
                </ExampleMeta>
                <ExampleLine>
                  {highlightWord(example.lyric, word.word)}
                </ExampleLine>
                <ExampleRelease>캡처: {example.release}</ExampleRelease>
              </ExampleBody>
              <PlayButton>
                <FiPlay size={14} />
              </PlayButton>
            </ExampleCard>
          ))}
        </ExampleList>
      </Section>

      <LowerArea mobile={isMobile}>
        <Section>
          <SectionTitle>관련 트랙</SectionTitle>
          <TrackList mobile={isMobile}>
            {relatedTracks.map((track) => (
              <TrackCard key={track.id} mobile={isMobile}>
                <TrackCover colorA={track.colorA} colorB={track.colorB} />
                <TrackInfo>
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </TrackInfo>
                {!isMobile && (
                  <TrackAction>
                    <FiMoreVertical size={18} />
                  </TrackAction>
                )}
              </TrackCard>
            ))}
          </TrackList>
        </Section>

        <Section>
          <SectionTitle>단어 정보</SectionTitle>
          <InfoCard>
            <InfoItem>
              <InfoLabel>추가 일자</InfoLabel>
              <InfoValue>{addedAtDate}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>빈도수</InfoLabel>
              <InfoValueAccent>{word.frequency}회</InfoValueAccent>
            </InfoItem>
          </InfoCard>
        </Section>
      </LowerArea>
    </Content>
  );

  if (isMobile) {
    return (
      <MobileWrap>
        <MobileHeader>
          <HeaderLeft>
            <HeaderIconButton onClick={() => navigate(-1)}>
              <FiChevronLeft size={24} />
            </HeaderIconButton>
            <HeaderTitle>단어장</HeaderTitle>
          </HeaderLeft>
          <HeaderActions>
            <HeaderIconButton>
              <FiBookmark size={20} />
            </HeaderIconButton>
            <HeaderIconButton>
              <FiMoreVertical size={20} />
            </HeaderIconButton>
          </HeaderActions>
        </MobileHeader>

        <MobileBody>{content}</MobileBody>
        <MobileBottomNav />
      </MobileWrap>
    );
  }

  return (
    <DesktopWrap>
      <WebSidebar />
      <DesktopMain>
        <DesktopHeader>
          <HeaderLeft>
            <HeaderIconButton onClick={() => navigate(-1)}>
              <FiChevronLeft size={24} />
            </HeaderIconButton>
            <HeaderTitle>단어장</HeaderTitle>
          </HeaderLeft>
          <HeaderActions>
            <HeaderIconButton>
              <FiBookmark size={20} />
            </HeaderIconButton>
            <HeaderIconButton>
              <FiMoreVertical size={20} />
            </HeaderIconButton>
          </HeaderActions>
        </DesktopHeader>
        <DesktopBody>{content}</DesktopBody>
      </DesktopMain>
      <FloatingHelp>?</FloatingHelp>
    </DesktopWrap>
  );
}

const FallbackWrap = styled.main`
  min-height: 100dvh;
  display: grid;
  place-content: center;
  gap: 10px;
  text-align: center;
`;

const BackTextButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.blue};
  font-weight: 700;
  cursor: pointer;
`;

const MobileWrap = styled.div`
  min-height: 100dvh;
  background: #ffffff;
`;

const MobileHeader = styled.header`
  height: 64px;
  border-bottom: 1px solid #eef2f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  color: #0b1735;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HeaderIconButton = styled.button`
  border: 0;
  background: transparent;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #6f7e98;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const MobileBody = styled.div`
  padding: 16px 20px 94px;
`;

const DesktopWrap = styled.div`
  min-height: 100dvh;
  background: #ffffff;
  display: grid;
  grid-template-columns: 280px 1fr;
`;

const DesktopMain = styled.main`
  min-width: 0;
  position: relative;
`;

const DesktopHeader = styled.header`
  height: 86px;
  border-bottom: 1px solid #eef2f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
`;

const DesktopBody = styled.div`
  height: calc(100dvh - 86px);
  overflow-y: auto;
  padding: 16px 24px 20px;
`;

const Content = styled.div<{ mobile: boolean }>`
  max-width: ${({ mobile }) => (mobile ? "100%" : "1000px")};
`;

const WordType = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 24px;
  border-radius: 6px;
  background: #e8fff5;
  color: #008f5a;
  font-size: 12px;
  font-weight: 700;
`;

const WordRow = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Word = styled.h2`
  margin: 0;
  font-size: clamp(32px, 2.4vw, 44px);
  line-height: 1;
  font-weight: 800;
  color: #061436;
`;

const SoundButton = styled.button`
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 14px;
  background: #00b574;
  color: #ffffff;
  display: grid;
  place-items: center;
`;

const Pronunciation = styled.p`
  margin: 10px 0 0;
  color: #9aabc5;
  font-size: clamp(16px, 1.2vw, 22px);
`;

const Meaning = styled.p`
  margin: 26px 0 0;
  color: #009a62;
  font-size: clamp(22px, 1.6vw, 30px);
  font-weight: 800;
`;

const Section = styled.section`
  margin-top: 34px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px;
  color: #061436;
  font-size: clamp(20px, 1.4vw, 28px);
`;

const ExampleList = styled.div`
  display: grid;
  gap: 16px;
`;

const ExampleCard = styled.article`
  border: 1px solid #ecf0f6;
  border-radius: 16px;
  background: #ffffff;
  padding: 14px;
  display: grid;
  grid-template-columns: 74px 1fr auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 1023px) {
    grid-template-columns: 62px 1fr auto;
  }
`;

const Artwork = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  background: radial-gradient(circle at 20% 20%, #effff7, #d8f8eb 58%, #bdeed9);
`;

const ExampleBody = styled.div`
  min-width: 0;
`;

const ExampleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  strong {
    font-size: clamp(14px, 1vw, 20px);
    color: #0b1735;
  }

  span {
    font-size: clamp(12px, 0.85vw, 16px);
    color: #93a3bd;
  }
`;

const ExampleLine = styled.p`
  margin: 8px 0 8px;
  font-size: clamp(16px, 1.2vw, 24px);
  color: #0b1735;
  line-height: 1.35;
`;

const ExampleRelease = styled.p`
  margin: 0;
  color: #a0aec4;
  font-size: clamp(12px, 0.8vw, 14px);
`;

const Highlight = styled.span`
  color: #00a36c;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
`;

const PlayButton = styled.button`
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #f2f6fb;
  color: #8a9ab2;
  display: grid;
  place-items: center;
`;

const LowerArea = styled.div<{ mobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ mobile }) => (mobile ? "1fr" : "1fr 1fr")};
  gap: 20px;
`;

const TrackList = styled.div<{ mobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ mobile }) => (mobile ? "1fr 1fr" : "1fr")};
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TrackCard = styled.article<{ mobile: boolean }>`
  border: 1px solid #ecf0f6;
  border-radius: 16px;
  background: #ffffff;
  padding: ${({ mobile }) => (mobile ? "12px" : "10px")};
  display: grid;
  grid-template-columns: ${({ mobile }) => (mobile ? "1fr" : "64px 1fr auto")};
  align-items: center;
  gap: 12px;
`;

const TrackCover = styled.div<{ colorA: string; colorB: string }>`
  width: 100%;
  max-width: 148px;
  aspect-ratio: 1;
  border-radius: 14px;
  background: linear-gradient(145deg, ${({ colorA }) => colorA}, ${({ colorB }) => colorB});
`;

const TrackInfo = styled.div`
  strong {
    display: block;
    color: #0b1735;
    font-size: clamp(16px, 1.05vw, 20px);
  }

  span {
    color: #7f8ea7;
    font-size: clamp(12px, 0.85vw, 14px);
  }
`;

const TrackAction = styled.button`
  border: 0;
  background: transparent;
  color: #9aa8bf;
`;

const InfoCard = styled.article`
  border: 1px solid #ecf0f6;
  border-radius: 16px;
  background: #ffffff;
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: grid;
  gap: 6px;
`;

const InfoLabel = styled.span`
  color: #95a4ba;
  font-size: clamp(12px, 0.8vw, 14px);
`;

const InfoValue = styled.strong`
  color: #071635;
  font-size: clamp(20px, 1.2vw, 24px);
`;

const InfoValueAccent = styled(InfoValue)`
  color: #00a06a;
`;

const FloatingHelp = styled.button`
  position: fixed;
  right: 22px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 999px;
  background: #061436;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
`;

