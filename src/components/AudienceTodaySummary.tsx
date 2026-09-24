import { SummaryTodayCard } from "./SummaryTodayCard";

type Props = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate: (id: string) => void;
};

export function AudienceTodaySummary({
  budget,
  electorate,
  transport,
  sanitation,
  onNavigate,
}: Props) {
  return (
    <SummaryTodayCard
      budget={budget}
      electorate={electorate}
      transport={transport}
      sanitation={sanitation}
      onNavigate={onNavigate}
    />
  );
}
