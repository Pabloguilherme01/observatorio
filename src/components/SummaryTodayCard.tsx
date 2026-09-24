import { ArrowRight } from 'lucide-react';

type SummaryTodayCardProps = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate?: (id: string) => void;
};

const items = [
  ['Orçamento', 'budget'],
  ['Eleitorado', 'electorate'],
  ['Transporte', 'transport'],
  ['Saneamento', 'sanitation'],
] as const;

export function SummaryTodayCard({ budget, electorate, transport, sanitation, onNavigate }: SummaryTodayCardProps) {
  const values = { budget, electorate, transport, sanitation };

  return (
    <section className="today-rail grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
      {items.map(([label, key]) => (
        <article
          key={key}
          className="group flex min-h-24 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>

          <strong className="mt-2 text-3xl font-black leading-none text-slate-900 dark:text-white">
            {values[key]}
          </strong>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <span className="block h-full w-2/3 rounded-full bg-sky-400" aria-hidden="true" />
          </div>

          <button
            type="button"
            aria-label={`Explorar ${label}`}
            onClick={() => onNavigate?.(key)}
            className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-300"
          >
            Ver dados
            <ArrowRight className="h-3 w-3" />
          </button>
        </article>
      ))}
    </section>
  );
}
