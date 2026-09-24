import { ArrowRight } from 'lucide-react';

type SummaryTodayCardProps = {
  budget: string;
  electorate: string;
  transport: string;
  sanitation: string;
  onNavigate?: (id: string) => void;
};

const items = [
  ['Orçamento', 'budget', 'previsão anual do município'],
  ['Eleitorado', 'electorate', 'pessoas aptas a votar'],
  ['Transporte', 'transport', 'valor informado do serviço'],
  ['Saneamento', 'sanitation', 'cobertura de atendimento'],
] as const;

export function SummaryTodayCard({ budget, electorate, transport, sanitation, onNavigate }: SummaryTodayCardProps) {
  const values = { budget, electorate, transport, sanitation };

  return (
    <section className="today-rail grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo público da cidade">
      {items.map(([label, key, description]) => (
        <article
          key={key}
          className="group flex min-h-32 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </span>

          <strong className="mt-2 block break-words text-xl font-black leading-tight text-slate-900 dark:text-white sm:text-2xl">
            {values[key]}
          </strong>

          <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </span>

          <button
            type="button"
            aria-label={`Ver detalhes de ${label}`}
            onClick={() => onNavigate?.(key)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-sky-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-fit"
          >
            Ver detalhes
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </article>
      ))}
    </section>
  );
}
