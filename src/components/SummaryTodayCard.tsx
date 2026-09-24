import { ArrowRight } from 'lucide-react';

type SummaryTodayCardProps = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate?: (id: string) => void;
};

const items = [
  ['Orçamento', 'budget', 'LOA 2026'],
  ['Eleitorado', 'electorate', 'universo eleitoral'],
  ['Transporte', 'transport', 'tarifa informada'],
  ['Saneamento', 'sanitation', 'cobertura registrada'],
] as const;

export function SummaryTodayCard({ budget, electorate, transport, sanitation, onNavigate }: SummaryTodayCardProps) {
  const values = { budget, electorate, transport, sanitation };

  return (
    <section className="today-rail grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
      {items.map(([label, key, description]) => (
        <article
          key={key}
          className="group flex min-h-28 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {label}
          </span>

          <strong className="mt-2 block break-words text-2xl font-black leading-none text-slate-900 dark:text-white sm:text-3xl">
            {values[key]}
          </strong>

          <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <span className="block h-full w-2/3 rounded-full bg-sky-400" aria-hidden="true" />
          </div>

          <button
            type="button"
            aria-label={`Explorar ${label}`}
            onClick={() => onNavigate?.(key)}
            className="mt-3 inline-flex min-h-10 items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-300"
          >
            Explorar
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </article>
      ))}
    </section>
  );
}
