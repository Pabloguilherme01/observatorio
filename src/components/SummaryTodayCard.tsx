import { ArrowRight } from 'lucide-react';

type SummaryTodayCardProps = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate?: (id: string) => void;
};

const items = [
  ['LOA 2026', 'budget', 'orçamento'],
  ['Eleitorado', 'electorate', 'eleitores'],
  ['Transporte', 'transport', 'por trecho'],
  ['Saneamento', 'sanitation', 'esgoto'],
] as const;

export function SummaryTodayCard({ budget, electorate, transport, sanitation, onNavigate }: SummaryTodayCardProps) {
  const values = { budget, electorate, transport, sanitation };

  return (
    <div className="today-rail" aria-label="Resumo de indicadores">
      {items.map(([label, key, description]) => (
        <div key={key} className="today-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
          <strong className="mt-2 block text-2xl font-black text-white">{values[key]}</strong>
          <span className="mt-1 block text-xs text-slate-500">{description}</span>
          <button type="button" onClick={() => onNavigate?.(key)} className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950">
            Ver <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
