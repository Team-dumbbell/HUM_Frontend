import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMusic, FiCheck, FiChevronRight } from "react-icons/fi";

const ONBOARDING_DONE_KEY = "onewave_onboarding_done";
const ONBOARDING_PREFS_KEY = "onewave_onboarding_prefs";

const NATIVE_LANGS = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const LEARN_LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const MUSIC_GENRES = [
  { code: "pop", label: "Pop", icon: "🎵" },
  { code: "hiphop", label: "Hip-Hop", icon: "🎤" },
  { code: "kpop", label: "K-Pop", icon: "✨" },
  { code: "rnb", label: "R&B", icon: "🎶" },
  { code: "rock", label: "Rock", icon: "🎸" },
  { code: "jazz", label: "Jazz", icon: "🎷" },
  { code: "electronic", label: "Electronic", icon: "🎛️" },
  { code: "classical", label: "Classical", icon: "🎻" },
  { code: "latin", label: "Latin", icon: "💃" },
  { code: "indie", label: "Indie", icon: "🌿" },
];

type Prefs = {
  nativeLang: string;
  learnLang: string;
  genres: string[];
};

const STEPS = ["native", "learn", "genre", "done"] as const;
type Step = (typeof STEPS)[number];

export function isOnboardingDone(): boolean {
  return Boolean(localStorage.getItem(ONBOARDING_DONE_KEY));
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("native");
  const [prefs, setPrefs] = useState<Prefs>({ nativeLang: "", learnLang: "", genres: [] });
  const [leaving, setLeaving] = useState(false);

  const advance = (nextStep: Step) => {
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      setStep(nextStep);
    }, 320);
  };

  const handleNative = (code: string) => {
    setPrefs((p) => ({ ...p, nativeLang: code }));
    advance("learn");
  };

  const handleLearn = (code: string) => {
    setPrefs((p) => ({ ...p, learnLang: code }));
    advance("genre");
  };

  const toggleGenre = (code: string) => {
    setPrefs((p) => {
      const has = p.genres.includes(code);
      return { ...p, genres: has ? p.genres.filter((g) => g !== code) : [...p.genres, code] };
    });
  };

  const handleGenreNext = () => {
    advance("done");
    setTimeout(() => {
      localStorage.setItem(ONBOARDING_DONE_KEY, "1");
      localStorage.setItem(ONBOARDING_PREFS_KEY, JSON.stringify(prefs));
    }, 0);
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2200);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <Page>
      <Inner>
        <LogoRow>
          <LogoMark>
            <FiMusic size={14} />
          </LogoMark>
          <LogoText>HUM</LogoText>
        </LogoRow>

        <ProgressBar>
          {[0, 1, 2].map((i) => (
            <ProgressDot key={i} active={stepIndex > i} current={stepIndex === i} />
          ))}
        </ProgressBar>

        <StepWrap leaving={leaving}>
          {step === "native" && (
            <StepNative onSelect={handleNative} />
          )}
          {step === "learn" && (
            <StepLearn nativeLang={prefs.nativeLang} onSelect={handleLearn} />
          )}
          {step === "genre" && (
            <StepGenre selected={prefs.genres} onToggle={toggleGenre} onNext={handleGenreNext} />
          )}
          {step === "done" && (
            <StepDone />
          )}
        </StepWrap>
      </Inner>
    </Page>
  );
}

function StepNative({ onSelect }: { onSelect: (code: string) => void }) {
  return (
    <>
      <StepLabel>Step 1 of 3</StepLabel>
      <StepTitle>모국어가 무엇인가요?</StepTitle>
      <StepSub>사용하기 편한 언어를 선택해 주세요.</StepSub>
      <OptionGrid>
        {NATIVE_LANGS.map((l) => (
          <OptionBtn key={l.code} type="button" onClick={() => onSelect(l.code)}>
            <OptionFlag>{l.flag}</OptionFlag>
            <OptionLabel>{l.label}</OptionLabel>
            <FiChevronRight size={15} style={{ color: "#b0bcd0", flexShrink: 0 }} />
          </OptionBtn>
        ))}
      </OptionGrid>
    </>
  );
}

function StepLearn({ nativeLang, onSelect }: { nativeLang: string; onSelect: (code: string) => void }) {
  const options = LEARN_LANGS.filter((l) => l.code !== nativeLang);
  return (
    <>
      <StepLabel>Step 2 of 3</StepLabel>
      <StepTitle>어떤 언어를 배우고 싶으세요?</StepTitle>
      <StepSub>음악으로 익히고 싶은 언어를 골라보세요.</StepSub>
      <OptionGrid>
        {options.map((l) => (
          <OptionBtn key={l.code} type="button" onClick={() => onSelect(l.code)}>
            <OptionFlag>{l.flag}</OptionFlag>
            <OptionLabel>{l.label}</OptionLabel>
            <FiChevronRight size={15} style={{ color: "#b0bcd0", flexShrink: 0 }} />
          </OptionBtn>
        ))}
      </OptionGrid>
    </>
  );
}

function StepGenre({
  selected,
  onToggle,
  onNext,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepLabel>Step 3 of 3</StepLabel>
      <StepTitle>좋아하는 음악 장르는?</StepTitle>
      <StepSub>여러 개 선택해도 좋아요.</StepSub>
      <GenreGrid>
        {MUSIC_GENRES.map((g) => {
          const active = selected.includes(g.code);
          return (
            <GenreChip key={g.code} active={active} type="button" onClick={() => onToggle(g.code)}>
              <GenreIcon>{g.icon}</GenreIcon>
              <GenreLabel>{g.label}</GenreLabel>
              {active && <FiCheck size={13} />}
            </GenreChip>
          );
        })}
      </GenreGrid>
      <NextBtn type="button" onClick={onNext} disabled={selected.length === 0}>
        완료
      </NextBtn>
    </>
  );
}

function StepDone() {
  return (
    <DoneWrap>
      <DoneSpinner />
      <DoneTitle>잠깐만요!</DoneTitle>
      <DoneSub>
        선택하신 정보로
        <br />
        맞춤 환경을 준비하고 있어요.
      </DoneSub>
      <DotRow>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 0.18} />
        ))}
      </DotRow>
    </DoneWrap>
  );
}

// ─── animations ───────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40%           { transform: translateY(-8px); opacity: 1; }
`;

// ─── styled components ────────────────────────────────────────
const Page = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 28px 20px;
  background:
    radial-gradient(circle at 15% 10%, rgba(40, 227, 180, 0.18), transparent 35%),
    radial-gradient(circle at 85% 90%, rgba(22, 162, 118, 0.16), transparent 32%),
    #f3f5fa;
`;

const Inner = styled.div`
  width: min(520px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
`;

const LogoMark = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(145deg, #18b67a, #008f5a);
  display: grid;
  place-items: center;
  color: #fff;
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0a1431;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 36px;
`;

const ProgressDot = styled.div<{ active: boolean; current: boolean }>`
  height: 5px;
  border-radius: 99px;
  flex: 1;
  transition: background 0.3s ease;
  background: ${({ active, current }) =>
    active ? "#00A36C" : current ? "rgba(0,163,108,0.45)" : "#e5e7eb"};
`;

const StepWrap = styled.div<{ leaving: boolean }>`
  opacity: ${({ leaving }) => (leaving ? 0 : 1)};
  transform: ${({ leaving }) => (leaving ? "translateY(-10px)" : "translateY(0)")};
  transition: opacity 0.28s ease, transform 0.28s ease;
  animation: ${fadeIn} 0.35s ease both;
`;

const StepLabel = styled.p`
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #00a36c;
`;

const StepTitle = styled.h1`
  margin: 0;
  font-size: clamp(26px, 5vw, 36px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0a1431;
  line-height: 1.2;
`;

const StepSub = styled.p`
  margin: 10px 0 28px;
  font-size: 16px;
  color: #63708c;
  line-height: 1.5;
`;

const OptionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #00a36c;
    box-shadow: 0 4px 14px rgba(0, 163, 108, 0.14);
    transform: translateY(-1px);
  }
`;

const OptionFlag = styled.span`
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
`;

const OptionLabel = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #17284d;
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const GenreChip = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  border-radius: 14px;
  border: 1.5px solid ${({ active }) => (active ? "#00a36c" : "#e5e7eb")};
  background: ${({ active }) => (active ? "#e8fff5" : "#fff")};
  color: ${({ active }) => (active ? "#007a50" : "#17284d")};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #00a36c;
    transform: translateY(-1px);
  }
`;

const GenreIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const GenreLabel = styled.span`
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
`;

const NextBtn = styled.button`
  margin-top: 24px;
  width: 100%;
  height: 56px;
  border-radius: 14px;
  border: none;
  background: #00a36c;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    background: #008f5a;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 163, 108, 0.28);
  }

  &:disabled {
    background: #c8eed9;
    cursor: not-allowed;
  }
`;

const DoneWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 0 20px;
  gap: 0;
`;

const DoneSpinner = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid #e8fff5;
  border-top-color: #00a36c;
  animation: ${spin} 0.85s linear infinite;
  margin-bottom: 32px;
`;

const DoneTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0a1431;
`;

const DoneSub = styled.p`
  margin: 0 0 28px;
  font-size: 16px;
  color: #63708c;
  line-height: 1.6;
`;

const DotRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00a36c;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;
