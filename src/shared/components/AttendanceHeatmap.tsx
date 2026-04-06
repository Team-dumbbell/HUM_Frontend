import styled from "@emotion/styled";
import { useMemo } from "react";

const WEEKS = 15;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 더미 데이터 — 백엔드 연동 시 props로 교체
function buildDummyAttendance(): Set<string> {
  const attended = new Set<string>();
  const today = new Date();
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (Math.random() < 0.45) {
      attended.add(d.toISOString().slice(0, 10));
    }
  }
  return attended;
}

function buildCells(attended: Set<string>) {
  const today = new Date();
  const cells: { date: string; active: boolean; isToday: boolean }[] = [];

  // 오늘 기준 TOTAL_DAYS-1일 전부터 오늘까지
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({
      date: key,
      active: attended.has(key),
      isToday: i === 0,
    });
  }
  return cells;
}

// 컬럼(주) 단위로 슬라이스 — 첫 주의 앞쪽은 빈 셀로 채움
function groupIntoWeeks(cells: ReturnType<typeof buildCells>) {
  // cells는 이미 날짜 순 정렬
  const firstDay = new Date(cells[0].date).getDay(); // 0=일
  const padded: (ReturnType<typeof buildCells>[number] | null)[] = [
    ...Array(firstDay).fill(null),
    ...cells,
  ];
  const weeks: (ReturnType<typeof buildCells>[number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += DAYS_PER_WEEK) {
    weeks.push(padded.slice(i, i + DAYS_PER_WEEK));
  }
  return weeks;
}

type Props = {
  /** 백엔드 연동 후 ISO date string 배열로 교체 */
  attendedDates?: string[];
  compact?: boolean;
};

export default function AttendanceHeatmap({ attendedDates, compact = false }: Props) {
  const attended = useMemo(() => {
    if (attendedDates) return new Set(attendedDates);
    return buildDummyAttendance();
  }, [attendedDates]);

  const cells = useMemo(() => buildCells(attended), [attended]);
  const weeks = useMemo(() => groupIntoWeeks(cells), [cells]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (attended.has(d.toISOString().slice(0, 10))) count++;
      else break;
    }
    return count;
  }, [attended]);

  const total = useMemo(() => attended.size, [attended]);

  return (
    <Wrap compact={compact}>
      <TopRow>
        <Label>출석 현황</Label>
        <Stats>
          <StatChip>
            <StatNum>{streak}</StatNum>
            <StatSub>연속 출석</StatSub>
          </StatChip>
          <StatChip>
            <StatNum>{total}</StatNum>
            <StatSub>총 출석</StatSub>
          </StatChip>
        </Stats>
      </TopRow>

      <GridWrap compact={compact}>
        <DayAxis compact={compact}>
          {DAY_LABELS.map((d) => (
            <DayLabel key={d} compact={compact}>{d}</DayLabel>
          ))}
        </DayAxis>

        <WeekScroll>
          {weeks.map((week, wi) => (
            <WeekCol key={wi} compact={compact}>
              {week.map((cell, di) =>
                cell ? (
                  <Cell
                    key={cell.date}
                    active={cell.active}
                    isToday={cell.isToday}
                    compact={compact}
                    title={cell.date}
                  />
                ) : (
                  <Cell key={`empty-${wi}-${di}`} active={false} isToday={false} compact={compact} />
                ),
              )}
            </WeekCol>
          ))}
        </WeekScroll>
      </GridWrap>

      <Legend>
        <LegendLabel>적음</LegendLabel>
        {[false, true].map((a, i) => (
          <LegendCell key={i} active={a} compact={false} isToday={false} />
        ))}
        <LegendLabel>많음</LegendLabel>
      </Legend>
    </Wrap>
  );
}

const CELL_SIZE = 13;
const CELL_SIZE_COMPACT = 10;
const CELL_GAP = 3;

const Wrap = styled.div<{ compact: boolean }>`
  border-radius: 16px;
  border: 1px solid #e9eef5;
  background: #fff;
  padding: ${({ compact }) => (compact ? "14px 16px" : "18px 20px")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const Label = styled.span`
  color: #061234;
  font-size: 15px;
  font-weight: 800;
`;

const Stats = styled.div`
  display: flex;
  gap: 10px;
`;

const StatChip = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const StatNum = styled.span`
  color: #00a36c;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const StatSub = styled.span`
  color: #9ba8be;
  font-size: 11px;
  font-weight: 700;
`;

const GridWrap = styled.div<{ compact: boolean }>`
  display: flex;
  gap: ${({ compact }) => (compact ? "4px" : "6px")};
  overflow: hidden;
`;

const DayAxis = styled.div<{ compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${CELL_GAP}px;
  flex-shrink: 0;
`;

const DayLabel = styled.span<{ compact: boolean }>`
  height: ${({ compact }) => (compact ? CELL_SIZE_COMPACT : CELL_SIZE)}px;
  color: #b0bace;
  font-size: ${({ compact }) => (compact ? "8px" : "9px")};
  font-weight: 700;
  display: flex;
  align-items: center;
`;

const WeekScroll = styled.div`
  display: flex;
  gap: ${CELL_GAP}px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const WeekCol = styled.div<{ compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${CELL_GAP}px;
  flex-shrink: 0;
`;

const Cell = styled.div<{ active: boolean; isToday: boolean; compact: boolean }>`
  width: ${({ compact }) => (compact ? CELL_SIZE_COMPACT : CELL_SIZE)}px;
  height: ${({ compact }) => (compact ? CELL_SIZE_COMPACT : CELL_SIZE)}px;
  border-radius: ${({ compact }) => (compact ? 2 : 3)}px;
  background: ${({ active, isToday }) => {
    if (isToday) return "#00a36c";
    if (active) return "#6ee7b7";
    return "#eef2f7";
  }};
  opacity: ${({ active, isToday }) => (active || isToday ? 1 : 0.6)};
  transition: transform 0.1s;
  cursor: default;

  &:hover {
    transform: scale(1.3);
    opacity: 1;
  }
`;

const Legend = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;

const LegendLabel = styled.span`
  color: #b0bace;
  font-size: 10px;
  font-weight: 700;
`;

const LegendCell = styled(Cell)`
  width: 10px;
  height: 10px;
  cursor: default;
  &:hover {
    transform: none;
  }
`;
