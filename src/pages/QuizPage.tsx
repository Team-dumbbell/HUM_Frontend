import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { FiCheck, FiX, FiZap, FiBookOpen, FiArrowLeft, FiRotateCcw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useWordStore } from "../store/useWordStore";
import { useMediaQuery } from "../shared/hooks/useMediaQueryl";
import WebSidebar from "../layout/WebSidebar";
import MobileBottomNav from "../layout/MobileBottomNav";
import { theme as appTheme } from "../styles/theme";

type Language = "ALL" | "ENGLISH" | "JAPANESE" | "KOREAN";
type QuizStep = "setup" | "quiz" | "result";

type WordItem = {
  id: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  artist: string;
  song: string;
  language: string;
};

type QuizResult = {
  word: WordItem;
  userAnswer: string;
  correct: boolean;
};

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "ENGLISH", label: "영어" },
  { value: "JAPANESE", label: "일본어" },
  { value: "KOREAN", label: "한국어" },
];

const COUNT_OPTIONS = [5, 10, 20];

function normalize(str: string) {
  return str.trim().toLowerCase();
}

function checkAnswer(input: string, word: string): boolean {
  const normalizedInput = normalize(input);
  const candidates = word
    .split(/[/,]/)
    .map((s) => normalize(s))
    .filter(Boolean);
  return candidates.some((c) => c === normalizedInput);
}

// ─── Setup Screen ──────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
  totalWords,
}: {
  onStart: (count: number, lang: Language) => void;
  totalWords: number;
}) {
  const [selectedLang, setSelectedLang] = useState<Language>("ALL");
  const [selectedCount, setSelectedCount] = useState(10);

  return (
    <SetupWrap>
      <SetupCard>
        <SetupIcon>
          <FiZap size={28} />
        </SetupIcon>
        <SetupTitle>단어 테스트</SetupTitle>
        <SetupDesc>
          저장된 단어의 뜻을 보고 원어를 직접 입력하세요.
          <br />총 <Accent>{totalWords}</Accent>개의 단어가 있습니다.
        </SetupDesc>

        <Section>
          <SectionLabel>언어</SectionLabel>
          <ChipRow>
            {LANGUAGE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                active={selectedLang === opt.value}
                onClick={() => setSelectedLang(opt.value)}
                type="button"
              >
                {opt.label}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <Section>
          <SectionLabel>문제 수</SectionLabel>
          <ChipRow>
            {COUNT_OPTIONS.map((n) => (
              <Chip
                key={n}
                active={selectedCount === n}
                onClick={() => setSelectedCount(n)}
                type="button"
              >
                {n}개
              </Chip>
            ))}
          </ChipRow>
        </Section>

        <StartBtn
          onClick={() => onStart(selectedCount, selectedLang)}
          type="button"
        >
          시작하기
        </StartBtn>
      </SetupCard>
    </SetupWrap>
  );
}

// ─── Quiz Screen ───────────────────────────────────────────────────────────────

function QuizScreen({
  questions,
  onFinish,
}: {
  questions: WordItem[];
  onFinish: (results: QuizResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[index];
  const progress = ((index) / questions.length) * 100;

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [index, submitted]);

  function handleSubmit() {
    if (!input.trim() || submitted) return;
    const correct = checkAnswer(input, current.word);
    const newResults = [...results, { word: current, userAnswer: input.trim(), correct }];
    setResults(newResults);
    setSubmitted(true);
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      onFinish(results);
    } else {
      setIndex(index + 1);
      setInput("");
      setSubmitted(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!submitted) handleSubmit();
      else handleNext();
    }
  }

  const isCorrect = submitted && checkAnswer(input, current.word);
  const isWrong = submitted && !checkAnswer(input, current.word);

  return (
    <QuizWrap>
      <ProgressBar>
        <ProgressFill style={{ width: `${progress}%` }} />
      </ProgressBar>

      <QuizCounter>
        {index + 1} / {questions.length}
      </QuizCounter>

      <QuizCard>
        <PosBadge>{current.partOfSpeech}</PosBadge>
        <MeaningText>{current.meaning}</MeaningText>
        <TrackHint>
          <TrackHintIcon><FiBookOpen size={13} /></TrackHintIcon>
          {current.song} — {current.artist}
        </TrackHint>

        <InputWrap>
          <AnswerInput
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="단어를 입력하세요"
            disabled={submitted}
            state={submitted ? (isCorrect ? "correct" : "wrong") : "idle"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {submitted && (
            <InputIcon correct={isCorrect}>
              {isCorrect ? <FiCheck size={18} /> : <FiX size={18} />}
            </InputIcon>
          )}
        </InputWrap>

        {submitted && isWrong && (
          <AnswerReveal>
            정답: <AnswerWord>{current.word}</AnswerWord>
          </AnswerReveal>
        )}

        {!submitted ? (
          <SubmitBtn onClick={handleSubmit} type="button" disabled={!input.trim()}>
            확인
          </SubmitBtn>
        ) : (
          <NextBtn onClick={handleNext} type="button">
            {index + 1 >= questions.length ? "결과 보기" : "다음 →"}
          </NextBtn>
        )}
      </QuizCard>
    </QuizWrap>
  );
}

// ─── Result Screen ─────────────────────────────────────────────────────────────

function ResultScreen({
  results,
  onRetryWrong,
  onRetry,
  onHome,
}: {
  results: QuizResult[];
  onRetryWrong: () => void;
  onRetry: () => void;
  onHome: () => void;
}) {
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const score = Math.round((correctCount / total) * 100);
  const wrongItems = results.filter((r) => !r.correct);

  const scoreColor =
    score >= 80 ? appTheme.color.blue : score >= 50 ? "#ff8c18" : "#ef4444";

  return (
    <ResultWrap>
      <ResultCard>
        <ResultHeader>
          <ScoreCircle color={scoreColor}>
            <ScoreNum>{score}</ScoreNum>
            <ScoreLabel>점</ScoreLabel>
          </ScoreCircle>
          <ResultTitle>
            {correctCount}/{total} 정답
          </ResultTitle>
          <ResultDesc>
            {score >= 80
              ? "훌륭해요! 대부분의 단어를 기억하고 있어요."
              : score >= 50
              ? "잘 하고 있어요. 틀린 단어를 다시 복습해 보세요."
              : "조금 더 연습이 필요해요. 오답 단어를 집중적으로 복습하세요."}
          </ResultDesc>
        </ResultHeader>

        <BtnRow>
          <ActionBtn variant="outline" onClick={onRetry} type="button">
            <FiRotateCcw size={15} />
            다시 풀기
          </ActionBtn>
          {wrongItems.length > 0 && (
            <ActionBtn variant="primary" onClick={onRetryWrong} type="button">
              <FiZap size={15} />
              오답만 다시
            </ActionBtn>
          )}
        </BtnRow>

        {wrongItems.length > 0 && (
          <WrongSection>
            <WrongTitle>오답 노트 ({wrongItems.length}개)</WrongTitle>
            {wrongItems.map((r) => (
              <WrongItem key={r.word.id}>
                <WrongTop>
                  <WrongWord>{r.word.word}</WrongWord>
                  <WrongPos>{r.word.partOfSpeech}</WrongPos>
                </WrongTop>
                <WrongMeaning>{r.word.meaning}</WrongMeaning>
                <WrongMeta>
                  내 답: <UserAnswerText>{r.userAnswer || "(미입력)"}</UserAnswerText>
                  &nbsp;·&nbsp;{r.word.song} — {r.word.artist}
                </WrongMeta>
              </WrongItem>
            ))}
          </WrongSection>
        )}

        <BackLink onClick={onHome} type="button">
          <FiArrowLeft size={14} />
          단어장으로
        </BackLink>
      </ResultCard>
    </ResultWrap>
  );
}

// ─── Page Root ─────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  return isMobile ? <MobileQuiz /> : <DesktopQuiz />;
}

function useQuizLogic() {
  const { wordList, fetchAppData } = useWordStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<QuizStep>("setup");
  const [questions, setQuestions] = useState<WordItem[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  function startQuiz(count: number, lang: Language) {
    const pool =
      lang === "ALL"
        ? wordList
        : wordList.filter((w) => w.language === lang);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(count, shuffled.length)));
    setStep("quiz");
  }

  function finishQuiz(r: QuizResult[]) {
    setResults(r);
    setStep("result");
  }

  function retryAll() {
    setStep("setup");
  }

  function retryWrong() {
    const wrong = results.filter((r) => !r.correct).map((r) => r.word);
    setQuestions(wrong);
    setResults([]);
    setStep("quiz");
  }

  function goHome() {
    navigate("/words");
  }

  return {
    step,
    questions,
    results,
    wordList,
    startQuiz,
    finishQuiz,
    retryAll,
    retryWrong,
    goHome,
  };
}

function DesktopQuiz() {
  const logic = useQuizLogic();

  return (
    <DesktopLayout>
      <WebSidebar />
      <DesktopMain>
        <DesktopTopbar>
          <PageTitle>단어 테스트</PageTitle>
        </DesktopTopbar>
        <DesktopBody>
          {logic.step === "setup" && (
            <SetupScreen onStart={logic.startQuiz} totalWords={logic.wordList.length} />
          )}
          {logic.step === "quiz" && (
            <QuizScreen questions={logic.questions} onFinish={logic.finishQuiz} />
          )}
          {logic.step === "result" && (
            <ResultScreen
              results={logic.results}
              onRetry={logic.retryAll}
              onRetryWrong={logic.retryWrong}
              onHome={logic.goHome}
            />
          )}
        </DesktopBody>
      </DesktopMain>
    </DesktopLayout>
  );
}

function MobileQuiz() {
  const logic = useQuizLogic();

  return (
    <MobileWrap>
      <MobileHeader>
        <MobilePageTitle>단어 테스트</MobilePageTitle>
      </MobileHeader>
      <MobileBody>
        {logic.step === "setup" && (
          <SetupScreen onStart={logic.startQuiz} totalWords={logic.wordList.length} />
        )}
        {logic.step === "quiz" && (
          <QuizScreen questions={logic.questions} onFinish={logic.finishQuiz} />
        )}
        {logic.step === "result" && (
          <ResultScreen
            results={logic.results}
            onRetry={logic.retryAll}
            onRetryWrong={logic.retryWrong}
            onHome={logic.goHome}
          />
        )}
      </MobileBody>
      <MobileBottomNav />
    </MobileWrap>
  );
}

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
`;

// ─── Desktop Layout ────────────────────────────────────────────────────────────

const DesktopLayout = styled.div`
  height: 100dvh;
  display: grid;
  grid-template-columns: 280px 1fr;
  overflow: hidden;
`;

const DesktopMain = styled.div`
  background: ${({ theme }) => theme.color.bg};
  min-height: 0;
  display: grid;
  grid-template-rows: 86px minmax(0, 1fr);
`;

const DesktopTopbar = styled.div`
  height: 86px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.color.line};
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.color.text};
`;

const DesktopBody = styled.div`
  overflow-y: auto;
  padding: 16px 30px 40px;
`;

// ─── Mobile Layout ─────────────────────────────────────────────────────────────

const MobileWrap = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.color.bg};
  display: flex;
  flex-direction: column;
`;

const MobileHeader = styled.header`
  padding: 20px 20px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.color.line};
`;

const MobilePageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.color.text};
`;

const MobileBody = styled.main`
  flex: 1;
  padding: 0 20px 88px;
  overflow-y: auto;
`;

// ─── Setup Styles ──────────────────────────────────────────────────────────────

const SetupWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0;
`;

const SetupCard = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 36px 32px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.25s ease;

  @media (max-width: 1023px) {
    padding: 28px 20px;
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`;

const SetupIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: linear-gradient(145deg, #18b67a, #008f5a);
  color: #fff;
  display: grid;
  place-items: center;
`;

const SetupTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.color.text};
`;

const SetupDesc = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${({ theme }) => theme.color.subtext};
  line-height: 1.6;
`;

const Accent = styled.span`
  color: ${({ theme }) => theme.color.blue};
  font-weight: 700;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #647089;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ active?: boolean }>`
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme, active }) => (active ? theme.color.blue : theme.color.line)};
  background: ${({ theme, active }) => (active ? theme.color.blue : theme.color.surface)};
  color: ${({ active }) => (active ? "#fff" : "#647089")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    color: ${({ active, theme }) => (active ? "#fff" : theme.color.blue)};
  }

  @media (max-width: 1023px) {
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 12px;
  }
`;

const StartBtn = styled.button`
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border: 0;
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.color.blueHover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

// ─── Quiz Styles ───────────────────────────────────────────────────────────────

const QuizWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 16px;
  animation: ${fadeIn} 0.2s ease;

  @media (max-width: 1023px) {
    padding: 20px 0;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 560px;
  height: 4px;
  background: ${({ theme }) => theme.color.line};
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.color.blue};
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const QuizCounter = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.subtext};
  align-self: flex-end;
  width: 100%;
  max-width: 560px;
`;

const QuizCard = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 32px;
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1023px) {
    padding: 24px 20px;
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`;

const PosBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  background: #e8fff5;
  color: ${({ theme }) => theme.color.blue};
  font-size: 12px;
  font-weight: 700;
  align-self: flex-start;
`;

const MeaningText = styled.div`
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  color: ${({ theme }) => theme.color.blue};
  line-height: 1.3;
`;

const TrackHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  background: #f7f9fc;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #9aa4b8;
`;

const TrackHintIcon = styled.span`
  display: flex;
  align-items: center;
  color: #b0bac9;
`;

const InputWrap = styled.div`
  position: relative;
`;

const AnswerInput = styled.input<{ state: "idle" | "correct" | "wrong" }>`
  width: 100%;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border: 1.5px solid
    ${({ theme, state }) =>
      state === "correct"
        ? theme.color.blue
        : state === "wrong"
        ? "#ef4444"
        : theme.color.line};
  background: ${({ state }) =>
    state === "correct" ? "#f0fdf8" : state === "wrong" ? "#fff5f5" : "#fff"};
  padding: 0 44px 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
  animation: ${({ state }) => (state === "wrong" ? shake : "none")} 0.35s ease;

  &:focus {
    border-color: ${({ theme, state }) =>
      state === "idle" ? theme.color.blue : undefined};
  }

  &::placeholder {
    color: #c4cdd9;
    font-weight: 400;
  }

  &:disabled {
    cursor: default;
  }
`;

const InputIcon = styled.span<{ correct: boolean }>`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ correct }) => (correct ? "#00a36c" : "#ef4444")};
  display: flex;
  align-items: center;
`;

const AnswerReveal = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.subtext};
`;

const AnswerWord = styled.span`
  color: ${({ theme }) => theme.color.blue};
  font-weight: 700;
`;

const SubmitBtn = styled.button`
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border: 0;
  background: ${({ theme }) => theme.color.blue};
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.blueHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const NextBtn = styled.button`
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border: 1.5px solid ${({ theme }) => theme.color.blue};
  background: transparent;
  color: ${({ theme }) => theme.color.blue};
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.color.blue};
    color: #fff;
    transform: translateY(-1px);
  }
`;

// ─── Result Styles ─────────────────────────────────────────────────────────────

const ResultWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0 48px;
  animation: ${fadeIn} 0.25s ease;

  @media (max-width: 1023px) {
    padding: 20px 0 32px;
  }
`;

const ResultCard = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.color.line};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 36px 32px;
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1023px) {
    padding: 24px 20px;
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`;

const ResultHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const ScoreCircle = styled.div<{ color: string }>`
  width: 96px;
  height: 96px;
  border-radius: 999px;
  border: 4px solid ${({ color }) => color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

const ScoreNum = styled.span`
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.color.text};
  line-height: 1;
`;

const ScoreLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.subtext};
`;

const ResultTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.color.text};
`;

const ResultDesc = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.color.subtext};
  line-height: 1.6;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button<{ variant: "primary" | "outline" }>`
  flex: 1;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border: 1.5px solid
    ${({ theme, variant }) =>
      variant === "primary" ? theme.color.blue : theme.color.line};
  background: ${({ theme, variant }) =>
    variant === "primary" ? theme.color.blue : theme.color.surface};
  color: ${({ variant }) =>
    variant === "primary" ? "#fff" : "#647089"};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme, variant }) =>
      variant === "primary" ? theme.color.blueHover : theme.color.chip};
  }
`;

const WrongSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WrongTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const WrongItem = styled.div`
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const WrongTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WrongWord = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

const WrongPos = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: #e8fff5;
  color: ${({ theme }) => theme.color.blue};
`;

const WrongMeaning = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.subtext};
`;

const WrongMeta = styled.div`
  font-size: 12px;
  color: #b0bac9;
`;

const UserAnswerText = styled.span`
  color: #ef4444;
  font-weight: 600;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.subtext};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  align-self: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
  }
`;
