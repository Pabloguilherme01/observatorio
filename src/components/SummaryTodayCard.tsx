import { ArrowRight } from 'lucide-react';

type SummaryTodayCardProps = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate?: (id: string) => void;
};

const items = [
  ['Orçamento', 'budget', 'orcamento'],
  ['Eleitorado', 'electorate', 'eleitorado'],
  ['Transporte', 'transport', 'transporte'],
  ['Saneamento', 'sanitation', 'saude'],
] as const;

export function SummaryTodayCard({ budget, electorate, transport, sanitation, onNavigate }: SummaryTodayCardProps) {
  const values = { budget, electorate, transport, sanitation };

  return (
    <section className="today-rail grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
      {items.map(([label, key, target]) => (
        <article
          key={key}
          className="group flex min-h-[104px] flex-col rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-sky-400/50 dark:border-white/10 dark:bg-slate-900"
        >
          <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {label}
          </span>

          <strong className="mt-1.5 block truncate text-[clamp(1.5rem,5vw,2rem)] font-black leading-none text-slate-900 dark:text-white">
            {values[key]}
          </strong>

          <button
            type="button"
            aria-label={"Abrir detalhes de " + label}
            onClick={() => onNavigate?.(target)}
            className="mt-auto inline-flex min-h-8 items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-300"
          >
            Detalhes
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </article>
      ))}
    </section>
  );
}
